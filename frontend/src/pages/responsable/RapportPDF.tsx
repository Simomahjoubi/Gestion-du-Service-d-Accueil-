import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Image,
  Svg, Rect, Circle, G, Line, Path,
} from '@react-pdf/renderer';
import logoSrc from '../../assets/logoBase64';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Rendement {
  fonctionnaireId: number; nomComplet: string;
  visitesTraiteesAujourdhui: number;
  tempsTraitementMoyen: number; tauxOccupation: number;
}

export interface RapportData {
  periode: string; debut: string; fin: string;
  totalVisites: number; visitesTerminees: number;
  visitesEnCours: number; visitesEnAttente: number;
  tempsAttenteMoyen: number; tempsTraitementMoyen: number;
  rendementParFonctionnaire: Rendement[];
  visites: any[];
}

interface Props {
  rapport: RapportData;
  serviceNom: string;
  periodeLabel: string;
  allMotifs: string[];
}

// ── Couleurs ──────────────────────────────────────────────────────────────────
const C = {
  blue:      '#1e40af',
  blueLight: '#dbeafe',
  blueMid:   '#3b82f6',
  green:     '#059669',
  greenLight:'#d1fae5',
  amber:     '#d97706',
  amberLight:'#fef3c7',
  purple:    '#7c3aed',
  purpleLight:'#ede9fe',
  gray:      '#6b7280',
  grayLight: '#f3f4f6',
  grayBorder:'#e5e7eb',
  white:     '#ffffff',
  dark:      '#111827',
  text:      '#374151',
  muted:     '#9ca3af',
  emerald:   '#10b981',
  rose:      '#f43f5e',
  indigo:    '#6366f1',
};

const CHART_COLORS = [C.blueMid, C.indigo, C.rose, C.amber, C.emerald, C.purple];
const MOTIF_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#14b8a6'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

const fmt = (n: number) => {
  if (n <= 0) return '—';
  if (n < 1) return '< 1 min';
  return `${Math.round(n)} min`;
};

const STATUT_CFG: Record<string, { label: string; bg: string; color: string }> = {
  CLOTUREE:   { label: 'Cloturee',   bg: C.greenLight,  color: C.green  },
  TERMINEE:   { label: 'Terminee',   bg: C.greenLight,  color: C.green  },
  EN_COURS:   { label: 'En cours',   bg: C.blueLight,   color: C.blueMid},
  EN_ATTENTE: { label: 'En attente', bg: C.amberLight,  color: C.amber  },
  REAFFECTEE: { label: 'Reaffectee', bg: C.purpleLight, color: C.purple },
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:       { fontFamily: 'Helvetica', backgroundColor: C.white, paddingBottom: 50 },

  // Header
  header:     { backgroundColor: C.blue, padding: 20, paddingBottom: 16 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoBox:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg:    { width: 48, height: 48, borderRadius: 4, backgroundColor: C.white, padding: 2 },
  logoTextBox:{ flexDirection: 'column', justifyContent: 'center' },
  logoTop:    { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white, letterSpacing: 1 },
  logoYellow: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#fbbf24', letterSpacing: 1, marginTop: 1 },
  logoSub:    { fontSize: 5.5, color: '#93c5fd', marginTop: 1, letterSpacing: 0.5 },
  headerRight:{ alignItems: 'flex-end' },
  headerDate: { fontSize: 7, color: '#bfdbfe', marginTop: 3 },
  titleBox:   { marginTop: 12, alignItems: 'center' },
  titleMain:  { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
  titleSub:   { fontSize: 8, color: '#bfdbfe', marginTop: 5, textAlign: 'center' },

  // Body
  body:       { paddingHorizontal: 24, paddingTop: 20 },

  // Section
  section:    { marginBottom: 20 },
  sectionHead:{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionNum: { width: 20, height: 20, backgroundColor: C.blue, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  sectionNumT:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
  sectionTitle:{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.blue },

  // Stat cards
  cards:      { flexDirection: 'row', gap: 10, marginBottom: 6 },
  card:       { flex: 1, borderRadius: 8, padding: 12, border: '1 solid ' + C.grayBorder },
  cardLabel:  { fontSize: 6.5, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cardValue:  { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.dark },
  cardUnit:   { fontSize: 8, color: C.muted },

  // Table
  table:      { borderRadius: 6, overflow: 'hidden', border: '1 solid ' + C.grayBorder },
  thead:      { flexDirection: 'row', backgroundColor: C.blue, paddingVertical: 7, paddingHorizontal: 10 },
  theadCell:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.4 },
  trow:       { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottom: '1 solid ' + C.grayBorder },
  trowAlt:    { backgroundColor: C.grayLight },
  tcell:      { fontSize: 8, color: C.text },

  // Badge statut
  badge:      { borderRadius: 10, paddingVertical: 2, paddingHorizontal: 6, alignSelf: 'flex-start' },
  badgeText:  { fontSize: 7, fontFamily: 'Helvetica-Bold' },

  // Progress bar
  barBg:      { height: 5, backgroundColor: C.grayBorder, borderRadius: 3, flex: 1 },
  barFill:    { height: 5, backgroundColor: C.blueMid, borderRadius: 3 },

  // Footer
  footer:     { position: 'absolute', bottom: 16, left: 24, right: 24, borderTop: '1 solid ' + C.grayBorder, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: C.muted },

  // Chart area
  chartBox:   { marginBottom: 6 },
  legendRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 7.5, color: C.text },
});

// ── Pie Chart SVG ─────────────────────────────────────────────────────────────
function PieChartSVG({ slices, size = 100 }: {
  slices: { value: number; color: string }[];
  size?: number;
}) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4, ir = r * 0.5;
  let angle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  slices.forEach(sl => {
    if (sl.value === 0) return;
    const sweep = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    paths.push({
      color: sl.color,
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
    });
  });

  return (
    <Svg width={size} height={size}>
      {paths.map((p, i) => (
        <G key={i}>
          <Path d={p.d} fill={p.color} />
        </G>
      ))}
      <Circle cx={cx} cy={cy} r={ir} fill={C.white} />
    </Svg>
  );
}

// ── Bar Chart SVG ─────────────────────────────────────────────────────────────
function BarChartSVG({ bars, width = 480, height = 80 }: {
  bars: { label: string; value: number; color: string }[];
  width?: number; height?: number;
}) {
  if (bars.length === 0) return null;
  const maxVal = Math.max(1, ...bars.map(b => b.value));
  const barW = Math.min(36, (width / bars.length) * 0.55);
  const gap  = width / bars.length;
  const chartH = height - 20;

  return (
    <Svg width={width} height={height}>
      {/* Baseline */}
      <Line x1={0} y1={chartH} x2={width} y2={chartH} stroke={C.grayBorder} strokeWidth={0.5} />

      {bars.map((bar, i) => {
        const bh = maxVal > 0 ? (bar.value / maxVal) * chartH : 0;
        const bx = i * gap + (gap - barW) / 2;
        const by = chartH - bh;
        return (
          <G key={i}>
            <Rect x={bx} y={by} width={barW} height={bh} fill={bar.color} rx={2} />
            {bar.value > 0 && (
              <Text x={bx + barW / 2} y={by - 3} style={{ fontSize: 7, fill: C.dark }} {...{ textAnchor: 'middle' }}>
                {bar.value}
              </Text>
            )}
            <Text x={bx + barW / 2} y={chartH + 10} style={{ fontSize: 6.5, fill: C.muted }} {...{ textAnchor: 'middle' }}>
              {bar.label.length > 10 ? bar.label.slice(0, 10) + '.' : bar.label}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Motif Bar Chart — Same pattern as Taux Occupation bar (works) ────────────
function MotifChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  if (bars.length === 0) return null;
  const maxVal = Math.max(1, ...bars.map(b => b.value));
  const LABEL_W = 140;
  const VAL_W   = 36;
  const ROW_H   = 22;
  const BAR_H   = 12;

  return (
    <View style={{ paddingTop: 4 }}>
      {bars.map((bar, i) => {
        const pct = bar.value > 0 ? Math.max(2, Math.round((bar.value / maxVal) * 100)) : 0;
        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              height: ROW_H,
              marginTop: i === 0 ? 0 : 4,
            }}
          >
            <Text style={{ width: LABEL_W, fontSize: 8, color: C.text }}>
              {bar.label.length > 22 ? bar.label.slice(0, 22) + '.' : bar.label}
            </Text>
            <View style={{ height: BAR_H, backgroundColor: C.grayLight, borderRadius: 3, flex: 1 }}>
              {pct > 0 && (
                <View
                  style={{
                    width: `${pct}%`,
                    height: BAR_H,
                    backgroundColor: bar.color,
                    borderRadius: 3,
                  }}
                />
              )}
            </View>
            <Text style={{ width: VAL_W, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.dark, textAlign: 'right' }}>
              {bar.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Main PDF Document ─────────────────────────────────────────────────────────
export const RapportPDF: React.FC<Props> = ({ rapport, serviceNom, periodeLabel, allMotifs }) => {
  const today = new Date().toLocaleDateString('fr-FR');

  const pieData = [
    { label: 'Traitees',   value: rapport.visitesTerminees, color: C.emerald },
    { label: 'En cours',   value: rapport.visitesEnCours,   color: C.blueMid },
    { label: 'En attente', value: rapport.visitesEnAttente, color: C.amber   },
  ].filter(d => d.value > 0);

  const barData = rapport.rendementParFonctionnaire.map((r, i) => ({
    label: r.nomComplet,
    value: r.visitesTraiteesAujourdhui,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Tous les motifs actifs, y compris ceux à 0 visite
  const motifCounts: Record<string, number> = {};
  allMotifs.forEach(m => { motifCounts[m] = 0; });
  rapport.visites.forEach((v: any) => {
    const m = v.motifLibelle;
    if (m && m !== '—') motifCounts[m] = (motifCounts[m] ?? 0) + 1;
  });
  const motifData = Object.entries(motifCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: MOTIF_COLORS[i % MOTIF_COLORS.length] }));

  return (
    <Document title={`Rapport ${serviceNom} - ${periodeLabel}`} author="Fondation Hassan II">
      <Page size="A4" style={s.page}>

        {/* ── En-tête ── */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={s.logoBox}>
              <Image src={logoSrc} style={s.logoImg} />
              <View style={s.logoTextBox}>
                <Text style={s.logoTop}>FONDATION</Text>
                <Text style={s.logoYellow}>HASSAN II</Text>
                <Text style={s.logoSub}>DES OEUVRES SOCIALES</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <Text style={{ fontSize: 7, color: '#bfdbfe' }}>Service : {serviceNom}</Text>
              <Text style={s.headerDate}>Genere le {today}</Text>
            </View>
          </View>
          <View style={s.titleBox}>
            <Text style={s.titleMain}>Rapport du Service — {serviceNom}</Text>
            <Text style={s.titleSub}>
              Periode : {periodeLabel}  |  {fmtDate(rapport.debut)} → {fmtDate(rapport.fin)}
            </Text>
          </View>
        </View>

        <View style={s.body}>

          {/* ── 1. Statistiques globales ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionNum}><Text style={s.sectionNumT}>1</Text></View>
              <Text style={s.sectionTitle}>Statistiques globales</Text>
            </View>
            <View style={s.cards}>
              <View style={[s.card, { backgroundColor: C.blueLight, borderColor: '#bfdbfe' }]}>
                <Text style={s.cardLabel}>Total visites</Text>
                <Text style={[s.cardValue, { color: C.blue }]}>{rapport.totalVisites}</Text>
              </View>
              <View style={[s.card, { backgroundColor: C.greenLight, borderColor: '#a7f3d0' }]}>
                <Text style={s.cardLabel}>Traitees</Text>
                <Text style={[s.cardValue, { color: C.green }]}>{rapport.visitesTerminees}</Text>
              </View>
              <View style={[s.card, { backgroundColor: C.amberLight, borderColor: '#fcd34d' }]}>
                <Text style={s.cardLabel}>Tps attente moy.</Text>
                <Text style={[s.cardValue, { color: C.amber, fontSize: 13 }]}>{fmt(rapport.tempsAttenteMoyen)}</Text>
              </View>
              <View style={[s.card, { backgroundColor: C.purpleLight, borderColor: '#c4b5fd' }]}>
                <Text style={s.cardLabel}>Tps traitement moy.</Text>
                <Text style={[s.cardValue, { color: C.purple, fontSize: 13 }]}>{fmt(rapport.tempsTraitementMoyen)}</Text>
              </View>
            </View>
          </View>

          {/* ── 2. Graphiques ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionNum}><Text style={s.sectionNumT}>2</Text></View>
              <Text style={s.sectionTitle}>Graphiques</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              {/* Camembert */}
              <View style={[s.card, { flex: 1, alignItems: 'center', padding: 14 }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.blue, marginBottom: 10 }}>
                  Repartition des visites
                </Text>
                {rapport.totalVisites > 0 ? (
                  <>
                    <PieChartSVG slices={pieData} size={90} />
                    <View style={s.legendRow}>
                      {pieData.map((d, i) => (
                        <View key={i} style={s.legendItem}>
                          <View style={[s.legendDot, { backgroundColor: d.color }]} />
                          <Text style={s.legendText}>
                            {d.label} ({Math.round(d.value / rapport.totalVisites * 100)}%)
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ fontSize: 8, color: C.muted }}>Aucune donnee</Text>
                )}
              </View>

              {/* Barres rendement */}
              <View style={[s.card, { flex: 1.6, padding: 14 }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.blue, marginBottom: 10 }}>
                  Visites traitees par fonctionnaire
                </Text>
                {barData.length > 0 ? (
                  <>
                    <BarChartSVG bars={barData} width={220} height={90} />
                    <View style={[s.legendRow, { marginTop: 4 }]}>
                      {barData.map((b, i) => (
                        <View key={i} style={s.legendItem}>
                          <View style={[s.legendDot, { backgroundColor: b.color, borderRadius: 2 }]} />
                          <Text style={s.legendText}>{b.label}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ fontSize: 8, color: C.muted }}>Aucune donnee</Text>
                )}
              </View>
            </View>

            {/* Motifs — dans la même section Graphiques */}
            {motifData.length > 0 && (
              <View style={[s.card, { padding: 14, marginTop: 10 }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.blue, marginBottom: 8 }}>
                  Motifs les plus demandes (Top {motifData.length})
                </Text>
                <MotifChart bars={motifData} />
              </View>
            )}
          </View>

          {/* ── 3. Rendement par fonctionnaire ── */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <View style={s.sectionNum}><Text style={s.sectionNumT}>3</Text></View>
              <Text style={s.sectionTitle}>Rendement par fonctionnaire</Text>
            </View>
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.theadCell, { flex: 2.5 }]}>Fonctionnaire</Text>
                <Text style={[s.theadCell, { flex: 1.2, textAlign: 'center' }]}>Trainees</Text>
                <Text style={[s.theadCell, { flex: 1.2, textAlign: 'center' }]}>Tps moyen</Text>
                <Text style={[s.theadCell, { flex: 2 }]}>Taux occupation</Text>
              </View>
              {rapport.rendementParFonctionnaire.map((r, i) => (
                <View key={r.fonctionnaireId} style={[s.trow, i % 2 === 1 ? s.trowAlt : {}]}>
                  <Text style={[s.tcell, { flex: 2.5, fontFamily: 'Helvetica-Bold' }]}>{r.nomComplet}</Text>
                  <Text style={[s.tcell, { flex: 1.2, textAlign: 'center', color: C.green, fontFamily: 'Helvetica-Bold' }]}>
                    {r.visitesTraiteesAujourdhui}
                  </Text>
                  <Text style={[s.tcell, { flex: 1.2, textAlign: 'center' }]}>{fmt(r.tempsTraitementMoyen)}</Text>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={s.barBg}>
                      <View style={[s.barFill, { width: `${r.tauxOccupation}%` }]} />
                    </View>
                    <Text style={[s.tcell, { width: 28 }]}>{r.tauxOccupation}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Service {serviceNom} — {periodeLabel} — {today}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ── Page 2 : Détail des visites ── */}
      {rapport.visites.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={[s.header, { paddingVertical: 12 }]}>
            <View style={s.headerRow}>
              <View style={s.logoBox}>
                <Image src={logoSrc} style={[s.logoImg, { width: 36, height: 36 }]} />
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white }}>
                  Rapport du Service — {serviceNom}
                </Text>
              </View>
              <Text style={{ fontSize: 7.5, color: '#bfdbfe' }}>{periodeLabel}</Text>
            </View>
          </View>

          <View style={s.body}>
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionNum}><Text style={s.sectionNumT}>4</Text></View>
                <Text style={s.sectionTitle}>Detail des visites ({rapport.visites.length})</Text>
              </View>
              <View style={s.table}>
                <View style={s.thead}>
                  <Text style={[s.theadCell, { width: 22 }]}>#</Text>
                  <Text style={[s.theadCell, { flex: 2 }]}>Visiteur</Text>
                  <Text style={[s.theadCell, { flex: 2 }]}>Fonctionnaire</Text>
                  <Text style={[s.theadCell, { flex: 1.5 }]}>Motif</Text>
                  <Text style={[s.theadCell, { width: 40 }]}>Arrivee</Text>
                  <Text style={[s.theadCell, { width: 52 }]}>Statut</Text>
                </View>
                {rapport.visites.map((v: any, i: number) => {
                  const cfg = STATUT_CFG[v.statut] ?? { label: v.statut, bg: C.grayLight, color: C.gray };
                  return (
                    <View key={v.id} style={[s.trow, i % 2 === 1 ? s.trowAlt : {}]}>
                      <Text style={[s.tcell, { width: 22, color: C.muted }]}>#{v.id}</Text>
                      <Text style={[s.tcell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{v.visiteurNom}</Text>
                      <Text style={[s.tcell, { flex: 2 }]}>{v.fonctionnaireNom}</Text>
                      <Text style={[s.tcell, { flex: 1.5, color: C.muted }]}>{v.motifLibelle}</Text>
                      <Text style={[s.tcell, { width: 40, color: C.muted }]}>
                        {new Date(v.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <View style={{ width: 52, justifyContent: 'center' }}>
                        <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                          <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>Service {serviceNom} — {periodeLabel} — {today}</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
};
