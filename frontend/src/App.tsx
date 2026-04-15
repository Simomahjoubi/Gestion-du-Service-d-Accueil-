import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AgentLayout } from './layouts/AgentLayout';
import { ProtectedRoute } from './router/ProtectedRoute';

import { NouvelleVisitePage } from './pages/agent/NouvelleVisitePage';
import { RestitutionBadgePage } from './pages/agent/RestitutionBadgePage';
import { HistoriquePage } from './pages/agent/HistoriquePage';
import { FonctionnaireDashboard } from './pages/fonctionnaire/FonctionnaireDashboard';
import { FonctionnaireLayout } from './layouts/FonctionnaireLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdherentManagement } from './pages/admin/AdherentManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { ServiceMotifManagement } from './pages/admin/ServiceMotifManagement';
import { ReferencesManagement } from './pages/admin/ReferencesManagement';
import { BadgeManagement } from './pages/admin/BadgeManagement';
import { ResponsableDashboard } from './pages/responsable/ResponsableDashboard';
import { DirecteurDashboard } from './pages/directeur/DirecteurDashboard';
import { MainLayout } from './layouts/MainLayout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Agent Routes */}
        <Route element={<ProtectedRoute roles={['AGENT']} />}>
          <Route path="/agent" element={<AgentLayout><AgentDashboard /></AgentLayout>} />
          <Route path="/agent/nouvelle-visite" element={<AgentLayout><NouvelleVisitePage /></AgentLayout>} />
          <Route path="/agent/restitution" element={<AgentLayout><RestitutionBadgePage /></AgentLayout>} />
          <Route path="/agent/historique" element={<AgentLayout><HistoriquePage /></AgentLayout>} />
        </Route>

        {/* Fonctionnaire Routes */}
        <Route element={<ProtectedRoute roles={['FONCTIONNAIRE']} />}>
          <Route path="/fonctionnaire" element={<FonctionnaireLayout><FonctionnaireDashboard /></FonctionnaireLayout>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="adherents" element={<AdherentManagement />} />
            <Route path="comptes" element={<UserManagement />} />
            <Route path="services" element={<ServiceMotifManagement />} />
            <Route path="badges" element={<BadgeManagement />} />
            <Route path="references" element={<ReferencesManagement />} />
          </Route>
        </Route>

        {/* Responsable Routes */}
        <Route element={<ProtectedRoute roles={['RESPONSABLE']} />}>
          <Route path="/responsable" element={<MainLayout />}>
             <Route index element={<ResponsableDashboard />} />
          </Route>
        </Route>

        {/* Directeur Routes */}
        <Route element={<ProtectedRoute roles={['DIRECTEUR']} />}>
          <Route path="/directeur" element={<MainLayout />}>
             <Route index element={<DirecteurDashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-600 font-bold">Accès non autorisé</div>} />
      </Routes>
    </BrowserRouter>
  );
};
