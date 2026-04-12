import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Key, 
  ChevronLeft, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  LogOut
} from 'lucide-react';

interface Badge {
  code: string;
  statut: 'DISPONIBLE' | 'OCCUPE' | 'PRET_A_RESTITUER';
  visiteur?: string;
  heureArrivee?: string;
}

export const RestitutionBadgePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchCode] = useState('');

  // Simulation des badges
  const [badges] = useState<Badge[]>([
    { code: 'B001', statut: 'OCCUPE', visiteur: 'Mustapha El Alami', heureArrivee: '10:30' },
    { code: 'B002', statut: 'PRET_A_RESTITUER', visiteur: 'Karim Benjelloun', heureArrivee: '09:15' },
    { code: 'B003', statut: 'DISPONIBLE' },
    { code: 'B004', statut: 'OCCUPE', visiteur: 'Sanaa Tazi', heureArrivee: '11:05' },
    { code: 'B005', statut: 'DISPONIBLE' },
    { code: 'B006', statut: 'DISPONIBLE' },
  ]);

  const handleRestitution = (code: string) => {
    alert(`Badge ${code} restitué. Le badge est maintenant disponible.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/agent')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Retour au tableau de bord</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Restitution des Badges</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par code badge ou nom visiteur..."
            className="w-full pl-10 pr-4 py-2.5 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} /> Filtrer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.filter(b => b.code.includes(searchTerm) || b.visiteur?.toLowerCase().includes(searchTerm.toLowerCase())).map((badge) => (
          <div key={badge.code} className={`p-6 rounded-2xl border-2 transition-all ${
            badge.statut === 'DISPONIBLE' ? 'bg-white border-gray-100 opacity-60' : 
            badge.statut === 'PRET_A_RESTITUER' ? 'bg-green-50 border-green-200 shadow-md ring-2 ring-green-500 ring-offset-2' : 
            'bg-white border-blue-100 shadow-sm'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${
                badge.statut === 'DISPONIBLE' ? 'bg-gray-100 text-gray-400' : 
                badge.statut === 'PRET_A_RESTITUER' ? 'bg-green-500 text-white' : 
                'bg-blue-600 text-white'
              }`}>
                <Key size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                badge.statut === 'DISPONIBLE' ? 'bg-gray-100 text-gray-500' : 
                badge.statut === 'PRET_A_RESTITUER' ? 'bg-green-100 text-green-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {badge.statut.replace(/_/g, ' ')}
              </span>
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-1">Badge {badge.code}</h3>
            
            {badge.statut !== 'DISPONIBLE' ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-gray-400" />
                  <span>Visiteur: <span className="font-bold text-gray-800">{badge.visiteur}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>Arrivée: <span className="font-bold text-gray-800">{badge.heureArrivee}</span></span>
                </div>
                <button 
                  onClick={() => handleRestitution(badge.code)}
                  className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    badge.statut === 'PRET_A_RESTITUER' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-slate-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <LogOut size={18} /> Restituer le badge
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400 italic">Ce badge est libre pour une nouvelle visite.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
