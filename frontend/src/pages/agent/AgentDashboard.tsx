import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { visiteService } from '../../services/visiteService';
import { 
  UserPlus, 
  Key, 
  Clock, 
  CheckCircle, 
  Unlock, 
  Users,
  RefreshCcw
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => visiteService.getStatsToday(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="space-y-10">
      {/* 1. Statistiques rapides (Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Visites en attente" 
          value={isLoading ? '...' : stats?.visitesEnAttente?.toString() || '0'} 
          icon={<Clock size={24}/>} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Badges occupés" 
          value={isLoading ? '...' : stats?.badgesOccupes?.toString() || '0'} 
          icon={<Key size={24}/>} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Badges libres" 
          value={isLoading ? '...' : stats?.badgesLibres?.toString() || '0'} 
          icon={<Unlock size={24}/>} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Total visites (Jour)" 
          value={isLoading ? '...' : stats?.totalVisitesAujourdhui?.toString() || '0'} 
          icon={<CheckCircle size={24}/>} 
          color="bg-blue-600" 
        />
      </div>

      {/* 2. Menu d'actions (Design app.PNG) */}
      <section>
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Opérations d'accueil
          </h2>
          <button 
            onClick={() => refetch()}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="Rafraîchir les données"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <ActionCard 
              onClick={() => navigate('/agent/nouvelle-visite')}
              icon={<UserPlus size={28}/>} 
              color="bg-[#1e1b4b]" 
              title="Nouvelle Visite" 
              description="Enregistrer l'arrivée d'un visiteur (Adhérent, Conjoint, Enfant, etc.) et lui assigner un badge." 
           />
           <ActionCard 
              onClick={() => navigate('/agent/restitution')}
              icon={<Key size={28}/>} 
              color="bg-[#70446b]" 
              title="Restitution Badge" 
              description="Marquer un badge comme rendu lorsqu'un visiteur quitte la fondation pour le libérer." 
           />
           <ActionCard 
              onClick={() => navigate('/agent/historique')}
              icon={<Users size={28}/>} 
              color="bg-[#166534]" 
              title="Historique du jour" 
              description="Consulter la liste de toutes les visites enregistrées depuis ce matin." 
           />
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
    <div className={`${color} text-white p-4 rounded-lg shadow-md`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode, color: string, title: string, description: string, onClick: () => void }> = ({ icon, color, title, description, onClick }) => (
  <div onClick={onClick} className="flex items-start gap-4 group cursor-pointer hover:bg-white hover:shadow-md p-5 rounded-xl transition-all border border-transparent hover:border-gray-100 bg-gray-50/50">
    <div className={`w-14 h-14 ${color} rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
      {icon}
    </div>
    <div>
      <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);
