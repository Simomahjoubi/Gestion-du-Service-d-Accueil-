import React from 'react';

export const AdherentManagement: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Gestion des Adhérents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">Ajout manuel</h3>
          {/* Formulaire d'ajout manuel ici */}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">Importation massive (XLS)</h3>
          {/* Composant upload ici */}
        </div>
      </div>
    </div>
  );
};
