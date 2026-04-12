-- Services
INSERT INTO services (nom, description) VALUES ('Estivage', 'Gestion des centres d''estivage et vacances');
INSERT INTO services (nom, description) VALUES ('RH', 'Ressources Humaines');
INSERT INTO services (nom, description) VALUES ('Bureau d''ordre', 'Gestion du courrier entrant et sortant');
INSERT INTO services (nom, description) VALUES ('Adhésion', 'Gestion des adhérents et cartes');
INSERT INTO services (nom, description) VALUES ('Direction', 'Secrétariat de direction');
INSERT INTO services (nom, description) VALUES ('Médicale', 'Services de santé et prises en charge');
INSERT INTO services (nom, description) VALUES ('Informatique', 'Support et systèmes d''information');
INSERT INTO services (nom, description) VALUES ('Assurance', 'Assurances et mutuelles');
INSERT INTO services (nom, description) VALUES ('Finance', 'Gestion financière et comptabilité');
INSERT INTO services (nom, description) VALUES ('Technique', 'Support technique et maintenance');

-- Motifs pour Estivage (Service ID 1)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('EST_RES', 'Réservation centres', 1, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('EST_SUI', 'Suivi dossier', 1, 'SEQUENTIEL', 1);

-- Motifs pour RH (Service ID 2)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('RH_ATT', 'Attestation de travail', 2, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('RH_CON', 'Demande de congés', 2, 'SEQUENTIEL', 1);

-- Motifs pour Bureau d''ordre (Service ID 3)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('BO_DEP', 'Dépôt courrier', 3, 'PRIORITE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('BO_REC', 'Récupération courrier', 3, 'SEQUENTIEL', 1);

-- Motifs pour Adhésion (Service ID 4)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ADH_NEW', 'Nouvelle adhésion', 4, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ADH_CAR', 'Renouvellement carte', 4, 'SEQUENTIEL', 1);

-- Motifs pour Direction (Service ID 5)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('DIR_RDV', 'Rendez-vous Directeur', 5, 'PRIORITE', 1);

-- Motifs pour Médicale (Service ID 6)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('MED_PEC', 'Prise en charge', 6, 'PRIORITE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('MED_REM', 'Remboursement', 6, 'SEQUENTIEL', 1);

-- Motifs pour Informatique (Service ID 7)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('INF_TECH', 'Problème technique', 7, 'SEQUENTIEL', 1);

-- Motifs pour Assurance (Service ID 8)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ASS_SIN', 'Déclaration Sinistre', 8, 'SEQUENTIEL', 1);

-- Motifs pour Finance (Service ID 9)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('FIN_PAI', 'Paiement / Règlement', 9, 'SEQUENTIEL', 1);

-- Motifs pour Technique (Service ID 10)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('TEC_MAINT', 'Maintenance', 10, 'SEQUENTIEL', 1);
