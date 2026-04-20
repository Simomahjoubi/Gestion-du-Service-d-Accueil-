import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import { FileText, Table2, TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RapportPDF, RapportData } from './RapportPDF';
import ExcelJS from 'exceljs';

interface Rendement {
  fonctionnaireId: number; nomComplet: string;
  visitesTraiteesAujourdhui: number;
  tempsTraitementMoyen: number; tauxOccupation: number;
}

interface Rapport {
  periode: string; debut: string; fin: string;
  totalVisites: number; visitesTerminees: number;
  visitesEnCours: number; visitesEnAttente: number;
  tempsAttenteMoyen: number; tempsTraitementMoyen: number;
  rendementParFonctionnaire: Rendement[];
  visites: any[];
}

const PERIODES = [
  { key: 'JOUR',  label: "Aujourd'hui" },
  { key: 'MOIS',  label: 'Ce mois' },
  { key: 'ANNEE', label: 'Cette année' },
];

const STATUT_LABELS: Record<string, string> = {
  CLOTUREE: 'Clôturée', TERMINEE: 'Terminée',
  EN_COURS: 'En cours', EN_ATTENTE: 'En attente', REAFFECTEE: 'Réaffectée',
};


export const ResponsableRapport: React.FC = () => {
  const { user } = useAuthStore();
  const serviceId  = user?.serviceId;
  const serviceNom = user?.serviceNom ?? 'Service';

  const [periode, setPeriode] = useState('JOUR');
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [allMotifs, setAllMotifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const genererRapport = async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        api.get<Rapport>(`/responsable/service/${serviceId}/rapport?periode=${periode}`),
        api.get<{ motif: string; count: number }[]>(`/responsable/service/${serviceId}/top-motifs`),
      ]);
      setRapport(r.data);
      setAllMotifs(m.data.map(x => x.motif));
    } finally { setLoading(false); }
  };

  const fmt = (n: number) => {
    if (n <= 0) return '—';
    if (n < 1) return '< 1 min';
    return `${Math.round(n)} min`;
  };
  const fmtDate  = (d: string) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const periodeLabel = (r: Rapport) => PERIODES.find(p => p.key === r.periode)?.label ?? r.periode;

  // ── Calcul motifs avec 0 inclus ──────────────────────────────────────────
  const computeMotifData = (r: Rapport, motifs: string[], colors: string[]) => {
    const counts: Record<string, number> = {};
    motifs.forEach(m => { counts[m] = 0; });
    r.visites.forEach((v: any) => {
      const m = v.motifLibelle;
      if (m && m !== '—') counts[m] = (counts[m] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  };

  // ── SVG → PNG base64 (via Canvas) ────────────────────────────────────────
  const svgToPng = (svg: string, w: number, h: number): Promise<string> =>
    new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      const img = new Image();
      // data URL évite le "canvas taint" causé par blob URL cross-origin
      const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/png').replace('data:image/png;base64,', ''));
        } catch (e) { reject(e); }
      };
      img.onerror = (e) => reject(new Error('SVG render failed: ' + e));
      img.src = dataUrl;
    });

  // ── Export Excel ──────────────────────────────────────────────────────────
  const exportExcel = async () => {
    if (!rapport) return;

    const BAR_COLORS   = ['#3b82f6','#6366f1','#f43f5e','#f59e0b','#10b981','#7c3aed'];
    const MOTIF_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#14b8a6'];

    // ── SVG Pie ──
    const pieSlices = [
      { label: 'Traites',    value: rapport.visitesTerminees, color: '#10b981' },
      { label: 'En cours',   value: rapport.visitesEnCours,   color: '#3b82f6' },
      { label: 'En attente', value: rapport.visitesEnAttente, color: '#f59e0b' },
    ].filter(s => s.value > 0);
    const pieTotal = pieSlices.reduce((a, s) => a + s.value, 0);
    const buildPieSVG = () => {
      if (pieTotal === 0) return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><text x="150" y="155" text-anchor="middle" font-size="18" fill="#9ca3af">Aucune donnee</text></svg>`;
      const CX = 150, CY = 145, R = 115, IR = 52;
      let a = -Math.PI / 2;
      const paths = pieSlices.map(sl => {
        const sweep = (sl.value / pieTotal) * 2 * Math.PI;
        const x1 = CX + R * Math.cos(a), y1 = CY + R * Math.sin(a);
        a += sweep;
        const x2 = CX + R * Math.cos(a), y2 = CY + R * Math.sin(a);
        return `<path d="M${CX} ${CY} L${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${sl.color}"/>`;
      }).join('');
      const legend = pieSlices.map((sl, i) =>
        `<rect x="${20 + i * 95}" y="272" width="10" height="10" fill="${sl.color}"/>
         <text x="${34 + i * 95}" y="281" font-size="10" fill="#374151">${sl.label} ${Math.round(sl.value / pieTotal * 100)}%</text>`
      ).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="295">
        <rect width="300" height="295" fill="white"/>
        ${paths}
        <circle cx="${CX}" cy="${CY}" r="${IR}" fill="white"/>
        <text x="${CX}" y="${CY - 6}" text-anchor="middle" font-size="22" font-weight="bold" fill="#1e40af">${pieTotal}</text>
        <text x="${CX}" y="${CY + 14}" text-anchor="middle" font-size="11" fill="#6b7280">visites</text>
        ${legend}
      </svg>`;
    };

    // ── SVG Bar ──
    const bars = rapport.rendementParFonctionnaire;
    const buildBarSVG = () => {
      if (bars.length === 0) return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="240"><rect width="500" height="240" fill="white"/><text x="250" y="125" text-anchor="middle" font-size="18" fill="#9ca3af">Aucune donnee</text></svg>`;
      const W = 500, H = 240, CH = 190, PAD = 35;
      const maxV = Math.max(1, ...bars.map(b => b.visitesTraiteesAujourdhui));
      const bW = Math.min(52, (W - PAD * 2) / bars.length * 0.6);
      const gap = (W - PAD * 2) / bars.length;
      const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
        const y = CH - f * (CH - 20);
        return `<line x1="${PAD}" y1="${y.toFixed(1)}" x2="${W - PAD}" y2="${y.toFixed(1)}" stroke="#f3f4f6" stroke-width="1"/>
          <text x="${PAD - 5}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#9ca3af">${Math.round(maxV * f)}</text>`;
      }).join('');
      const rects = bars.map((b, i) => {
        const bh = (b.visitesTraiteesAujourdhui / maxV) * (CH - 20);
        const bx = PAD + i * gap + (gap - bW) / 2;
        const by = CH - bh;
        const col = BAR_COLORS[i % BAR_COLORS.length];
        const nm = b.nomComplet.split(' ')[0].slice(0, 9);
        return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${col}"/>
          ${b.visitesTraiteesAujourdhui > 0 ? `<text x="${(bx + bW / 2).toFixed(1)}" y="${(by - 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="bold" fill="#111827">${b.visitesTraiteesAujourdhui}</text>` : ''}
          <text x="${(bx + bW / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#6b7280">${nm}</text>`;
      }).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="white"/>
        ${gridLines}
        <line x1="${PAD}" y1="${CH}" x2="${W - PAD}" y2="${CH}" stroke="#d1d5db" stroke-width="1.5"/>
        ${rects}
      </svg>`;
    };

    const pieSVG = buildPieSVG();
    const barSVG = buildBarSVG();

    // ── Motifs (tous, même 0 visite) ──
    const motifData = computeMotifData(rapport, allMotifs, MOTIF_COLORS);

    const buildMotifSVG = () => {
      const W = 640, rowH = 28, PL = 200, PR = 40, PT = 10, PB = 22;
      const chartW = W - PL - PR;
      const H = motifData.length * rowH + PT + PB;
      if (motifData.length === 0) return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="60"><rect width="${W}" height="60" fill="white"/><text x="${W/2}" y="35" text-anchor="middle" font-size="13" fill="#9ca3af">Aucune donnee</text></svg>`;
      const maxV = Math.max(1, ...motifData.map(m => m.value));
      const barH = 14;

      // X-axis ticks
      const ticks = [0.25, 0.5, 0.75, 1].map(f => Math.round(maxV * f));
      const gridLines = ticks.map(val => {
        const x = (PL + (val / maxV) * chartW).toFixed(1);
        const yBottom = (PT + motifData.length * rowH).toFixed(1);
        return `<line x1="${x}" y1="${PT}" x2="${x}" y2="${yBottom}" stroke="#e5e7eb" stroke-width="0.8"/>
          <text x="${x}" y="${(PT + motifData.length * rowH + 14).toFixed(1)}" text-anchor="middle" font-size="9" fill="#9ca3af">${val}</text>`;
      }).join('');

      // Y axis + X axis
      const yBottom = (PT + motifData.length * rowH).toFixed(1);
      const axes = `<line x1="${PL}" y1="${PT}" x2="${PL}" y2="${yBottom}" stroke="#d1d5db" stroke-width="1"/>
        <line x1="${PL}" y1="${yBottom}" x2="${PL + chartW}" y2="${yBottom}" stroke="#d1d5db" stroke-width="1"/>`;

      const rows = motifData.map((m, i) => {
        const by = PT + i * rowH + (rowH - barH) / 2;
        const bw = Math.max((m.value / maxV) * chartW, 2);
        const lbl = m.label.length > 26 ? m.label.slice(0, 26) + '.' : m.label;
        const midY = (by + barH / 2 + 4).toFixed(1);
        return `<rect x="${PL}" y="${by}" width="${chartW}" height="${barH}" fill="#f3f4f6" rx="2"/>
          <rect x="${PL}" y="${by}" width="${bw.toFixed(1)}" height="${barH}" fill="${m.color}" rx="2"/>
          <text x="${(PL - 8).toFixed(1)}" y="${midY}" text-anchor="end" font-size="10" fill="#374151">${lbl}</text>
          <text x="${(PL + bw + 6).toFixed(1)}" y="${midY}" font-size="10" font-weight="bold" fill="#111827">${m.value}</text>`;
      }).join('');

      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="white"/>
        ${gridLines}
        ${axes}
        ${rows}
      </svg>`;
    };
    const motifSVG = buildMotifSVG();

    const motifH = Math.max(60, motifData.length * 28 + 32);
    const [pieBase64, barBase64, motifBase64] = await Promise.all([
      svgToPng(pieSVG, 300, 290),
      svgToPng(barSVG, 500, 240),
      svgToPng(motifSVG, 640, motifH),
    ]);

    // ── ExcelJS Workbook ──
    // Layout: A(spacer) B(name/wide) C(num) D(num) E(pct) F(motif) G(statut)
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Fondation Hassan II';
    wb.created = new Date();
    const ws = wb.addWorksheet('Rapport', { pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 } });

    ws.columns = [
      { width: 3  },  // A spacer
      { width: 26 },  // B
      { width: 20 },  // C
      { width: 20 },  // D
      { width: 20 },  // E
      { width: 22 },  // F
      { width: 16 },  // G
    ];

    const BLUE       = '1E40AF';
    const BLUE_LIGHT = 'DBEAFE';
    const GREEN      = '059669';
    const GREEN_L    = 'D1FAE5';
    const AMBER      = 'D97706';
    const AMBER_L    = 'FEF3C7';
    const PURPLE     = '7C3AED';
    const PURPLE_L   = 'EDE9FE';
    const BORDER_C   = 'E5E7EB';
    const END_COL    = 'G'; // last column used

    const hBorder = (color = BORDER_C): Partial<ExcelJS.Borders> => ({
      top:    { style: 'thin', color: { argb: 'FF' + color } },
      bottom: { style: 'thin', color: { argb: 'FF' + color } },
      left:   { style: 'thin', color: { argb: 'FF' + color } },
      right:  { style: 'thin', color: { argb: 'FF' + color } },
    });

    const mergeHeader = (range: string, text: string, bg: string, fg = 'FFFFFF', size = 11) => {
      ws.mergeCells(range);
      const c = ws.getCell(range.split(':')[0]);
      c.value = text;
      c.font = { bold: true, size, color: { argb: 'FF' + fg }, name: 'Calibri' };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } };
      c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    };

    const styleCell = (addr: string, val: ExcelJS.CellValue, opts: {
      bg?: string; fg?: string; bold?: boolean; size?: number;
      align?: ExcelJS.Alignment['horizontal']; border?: boolean;
    } = {}) => {
      const c = ws.getCell(addr);
      c.value = val;
      if (opts.fg)     c.font = { size: opts.size ?? 9, bold: opts.bold ?? false, color: { argb: 'FF' + opts.fg }, name: 'Calibri' };
      if (opts.bg)     c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + opts.bg } };
      if (opts.align)  c.alignment = { horizontal: opts.align, vertical: 'middle' };
      if (opts.border) c.border = hBorder();
    };

    // ── Row 1: spacer ──
    ws.getRow(1).height = 10;

    // ── Row 2: Main title ──
    ws.getRow(2).height = 34;
    mergeHeader(`B2:${END_COL}2`, `FONDATION HASSAN II  —  Rapport du Service : ${serviceNom}`, BLUE, 'FFFFFF', 14);

    // ── Row 3: Subtitle ──
    ws.getRow(3).height = 16;
    mergeHeader(`B3:${END_COL}3`, `Periode : ${periodeLabel(rapport)}   |   ${fmtDate(rapport.debut)} -> ${fmtDate(rapport.fin)}   |   Genere le ${new Date().toLocaleDateString('fr-FR')}`, '1E3A8A', 'BFDBFE', 9);

    // ── Row 4: spacer ──
    ws.getRow(4).height = 8;

    // ── Row 5: Section 1 header ──
    ws.getRow(5).height = 20;
    mergeHeader(`B5:${END_COL}5`, '1  STATISTIQUES GLOBALES', '1D4ED8', 'FFFFFF', 11);

    // ── Rows 6-7: KPI cards — each KPI in its own single cell (no overlap) ──
    ws.getRow(6).height = 16;
    ws.getRow(7).height = 32;
    ws.getRow(8).height = 10;

    const kpis = [
      { col: 'B', label: 'TOTAL VISITES',  value: rapport.totalVisites,              bg: BLUE_LIGHT, fg: BLUE   },
      { col: 'C', label: 'TRAITEES',       value: rapport.visitesTerminees,           bg: GREEN_L,    fg: GREEN  },
      { col: 'D', label: 'TPS ATTENTE',    value: fmt(rapport.tempsAttenteMoyen),    bg: AMBER_L,    fg: AMBER  },
      { col: 'E', label: 'TPS TRAITEMENT', value: fmt(rapport.tempsTraitementMoyen), bg: PURPLE_L,   fg: PURPLE },
    ];
    kpis.forEach(k => {
      styleCell(`${k.col}6`, k.label, { bg: k.bg, fg: k.fg, bold: true, size: 8,  align: 'center', border: true });
      styleCell(`${k.col}7`, k.value, { bg: k.bg, fg: k.fg, bold: true, size: 20, align: 'center', border: true });
    });

    // ── Row 9: Section 2 header ──
    ws.getRow(9).height = 20;
    mergeHeader(`B9:${END_COL}9`, '2  GRAPHIQUES', '1D4ED8', 'FFFFFF', 11);

    // ── Rows 10-25: Chart images ──
    for (let r = 10; r <= 25; r++) ws.getRow(r).height = 14;

    const pieImgId = wb.addImage({ base64: pieBase64, extension: 'png' });
    ws.addImage(pieImgId, 'B10:D25');

    const barImgId = wb.addImage({ base64: barBase64, extension: 'png' });
    ws.addImage(barImgId, 'E10:G25');

    // ── Row 26: spacer ──
    ws.getRow(26).height = 8;

    // ── Row 27: Section 3 — Motifs ──
    ws.getRow(27).height = 20;
    mergeHeader(`B27:${END_COL}27`, '3  MOTIFS LES PLUS DEMANDES', '1D4ED8', 'FFFFFF', 11);

    const motifImgRows = Math.max(8, motifData.length * 2 + 4);
    for (let r = 28; r <= 27 + motifImgRows; r++) ws.getRow(r).height = 14;
    const motifImgId = wb.addImage({ base64: motifBase64, extension: 'png' });
    ws.addImage(motifImgId, `B28:${END_COL}${27 + motifImgRows}`);

    const rendStart = 27 + motifImgRows + 2;

    // ── Section 4 — Rendement ──
    ws.getRow(rendStart - 1).height = 8;
    ws.getRow(rendStart).height = 20;
    mergeHeader(`B${rendStart}:${END_COL}${rendStart}`, '4  RENDEMENT PAR FONCTIONNAIRE', '1D4ED8', 'FFFFFF', 11);

    ws.getRow(rendStart + 1).height = 16;
    [['B','Fonctionnaire'],['C','Visites traitees'],['D','Temps moyen'],['E','Taux occupation']].forEach(([col, label]) => {
      styleCell(`${col}${rendStart + 1}`, label, { bg: '1E40AF', fg: 'FFFFFF', bold: true, size: 9, align: col === 'B' ? 'left' : 'center', border: true });
    });

    rapport.rendementParFonctionnaire.forEach((r, i) => {
      const row = rendStart + 2 + i;
      ws.getRow(row).height = 16;
      const bg = i % 2 === 1 ? 'F9FAFB' : 'FFFFFF';
      styleCell(`B${row}`, r.nomComplet,                   { bg, fg: '111827', bold: true, size: 9, align: 'left',   border: true });
      styleCell(`C${row}`, r.visitesTraiteesAujourdhui,    { bg, fg: '059669', bold: true, size: 9, align: 'center', border: true });
      styleCell(`D${row}`, fmt(r.tempsTraitementMoyen),    { bg, fg: '374151', size: 9,              align: 'center', border: true });
      styleCell(`E${row}`, `${r.tauxOccupation}%`,         { bg, fg: '374151', size: 9,              align: 'center', border: true });
    });

    // ── Visites detail ──
    if (rapport.visites.length > 0) {
      const vStart = rendStart + 2 + rapport.rendementParFonctionnaire.length + 1;
      ws.getRow(vStart - 1).height = 8;
      ws.getRow(vStart).height = 20;
      mergeHeader(`B${vStart}:${END_COL}${vStart}`, `5  DETAIL DES VISITES (${rapport.visites.length})`, '1D4ED8', 'FFFFFF', 11);

      ws.getRow(vStart + 1).height = 16;
      [['B','#'],['C','Visiteur'],['D','Fonctionnaire'],['E','Motif'],['F','Arrivee'],['G','Statut']].forEach(([col, label]) => {
        styleCell(`${col}${vStart + 1}`, label, { bg: '1E40AF', fg: 'FFFFFF', bold: true, size: 9, align: 'center', border: true });
      });

      const STATUS_XL: Record<string,{label:string;fg:string}> = {
        CLOTUREE:   { label: 'Cloturee',   fg: '059669' },
        TERMINEE:   { label: 'Terminee',   fg: '059669' },
        EN_COURS:   { label: 'En cours',   fg: '1E40AF' },
        EN_ATTENTE: { label: 'En attente', fg: 'D97706'  },
        REAFFECTEE: { label: 'Reaffectee', fg: '7C3AED'  },
      };

      rapport.visites.forEach((v: any, i: number) => {
        const row = vStart + 2 + i;
        ws.getRow(row).height = 14;
        const bg = i % 2 === 1 ? 'F9FAFB' : 'FFFFFF';
        const cfg = STATUS_XL[v.statut] ?? { label: v.statut, fg: '6B7280' };
        const time = new Date(v.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        styleCell(`B${row}`, `#${v.id}`,              { bg, fg: '9CA3AF', size: 8, align: 'center', border: true });
        styleCell(`C${row}`, v.visiteurNom,            { bg, fg: '111827', size: 8, bold: true, align: 'left', border: true });
        styleCell(`D${row}`, v.fonctionnaireNom ?? '—',{ bg, fg: '374151', size: 8, align: 'left',   border: true });
        styleCell(`E${row}`, v.motifLibelle ?? '—',    { bg, fg: '6B7280', size: 8, align: 'left',   border: true });
        styleCell(`F${row}`, time,                     { bg, fg: '6B7280', size: 8, align: 'center', border: true });
        styleCell(`G${row}`, cfg.label,                { bg, fg: cfg.fg,   size: 8, bold: true, align: 'center', border: true });
      });
    }

    // ── Download ──
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${serviceNom}_${rapport.periode}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={22} className="text-blue-500" /> Génération de rapport
        </h1>
      </div>

      {/* Sélecteur période */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Sélectionner la période</h2>
        <div className="flex gap-3 flex-wrap">
          {PERIODES.map(p => (
            <button key={p.key} onClick={() => setPeriode(p.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                periode === p.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={genererRapport} disabled={loading}
          className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <FileText size={15} />}
          {loading ? 'Génération...' : 'Générer le rapport'}
        </button>
      </div>

      {rapport && (
        <>
          {/* En-tête rapport + boutons export */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Rapport du Service — {serviceNom} &nbsp;·&nbsp; {periodeLabel(rapport)}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {fmtDate(rapport.debut)} → {fmtDate(rapport.fin)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportExcel().catch(e => alert('Erreur Excel: ' + e?.message))}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
                >
                  <Table2 size={14} /> Exporter Excel
                </button>
                <PDFDownloadLink
                  document={<RapportPDF rapport={rapport as RapportData} serviceNom={serviceNom} periodeLabel={periodeLabel(rapport)} allMotifs={allMotifs} />}
                  fileName={`rapport_${serviceNom}_${rapport.periode}_${new Date().toISOString().split('T')[0]}.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50" disabled={pdfLoading}>
                      <FileText size={14} /> {pdfLoading ? 'Préparation...' : 'Exporter PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RapportCard icon={<Users size={16} className="text-blue-500" />}          label="Total visites"        value={rapport.totalVisites} />
              <RapportCard icon={<CheckCircle size={16} className="text-emerald-500" />} label="Traitées"             value={rapport.visitesTerminees} />
              <RapportCard icon={<Clock size={16} className="text-amber-500" />}         label="Tps attente moy."     value={fmt(rapport.tempsAttenteMoyen)} />
              <RapportCard icon={<TrendingUp size={16} className="text-purple-500" />}   label="Tps traitement moy."  value={fmt(rapport.tempsTraitementMoyen)} />
            </div>
          </div>

          {/* Rendement */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" /> Rendement par fonctionnaire
              </h2>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Fonctionnaire</th>
                  <th className="px-5 py-3 text-center">Visites traitées</th>
                  <th className="px-5 py-3 text-center">Tps moyen</th>
                  <th className="px-5 py-3">Taux d'occupation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rapport.rendementParFonctionnaire.map(r => (
                  <tr key={r.fonctionnaireId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.nomComplet}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600">{r.visitesTraiteesAujourdhui}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{fmt(r.tempsTraitementMoyen)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${r.tauxOccupation}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-10">{r.tauxOccupation}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Détail visites */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Détail des visites ({rapport.visites.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Visiteur</th>
                    <th className="px-4 py-3">Fonctionnaire</th>
                    <th className="px-4 py-3">Motif</th>
                    <th className="px-4 py-3">Arrivée</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rapport.visites.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 text-xs">#{v.id}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{v.visiteurNom}</td>
                      <td className="px-4 py-2.5 text-gray-600">{v.fonctionnaireNom}</td>
                      <td className="px-4 py-2.5 text-gray-500">{v.motifLibelle}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{new Date(v.heureArrivee).toLocaleTimeString('fr-FR')}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          v.statut === 'CLOTUREE' || v.statut === 'TERMINEE' ? 'bg-emerald-100 text-emerald-700' :
                          v.statut === 'EN_COURS'   ? 'bg-blue-100 text-blue-700' :
                          v.statut === 'EN_ATTENTE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                        }`}>{STATUT_LABELS[v.statut] ?? v.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const RapportCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-semibold text-gray-500">{label}</span></div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);
