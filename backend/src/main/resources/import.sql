-- Services (existing content above)
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

-- Motifs (existing content above)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('EST_RES', 'Réservation centres', 1, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('EST_SUI', 'Suivi dossier', 1, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('RH_ATT', 'Attestation de travail', 2, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('RH_CON', 'Demande de congés', 2, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('BO_DEP', 'Dépôt courrier', 3, 'PRIORITE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('BO_REC', 'Récupération courrier', 3, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ADH_NEW', 'Nouvelle adhésion', 4, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ADH_CAR', 'Renouvellement carte', 4, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('DIR_RDV', 'Rendez-vous Directeur', 5, 'PRIORITE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('MED_PEC', 'Prise en charge', 6, 'PRIORITE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('MED_REM', 'Remboursement', 6, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('INF_TECH', 'Problème technique', 7, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('ASS_SIN', 'Déclaration Sinistre', 8, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('FIN_PAI', 'Paiement / Règlement', 9, 'SEQUENTIEL', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) VALUES ('TEC_MAINT', 'Maintenance', 10, 'SEQUENTIEL', 1);

-- Mock Badges
INSERT INTO badge (code, statut) VALUES ('B-001', 'LIBRE');
INSERT INTO badge (code, statut) VALUES ('B-002', 'LIBRE');
INSERT INTO badge (code, statut) VALUES ('B-003', 'OCCUPE');
INSERT INTO badge (code, statut) VALUES ('B-004', 'OCCUPE');

-- Mock Visiteurs
INSERT INTO visiteur (nom, prenom, type_visiteur) VALUES ('ALAMI', 'Youssef', 'ADHERENT');
INSERT INTO visiteur (nom, prenom, type_visiteur) VALUES ('BENANI', 'Fatima', 'INVITE');
INSERT INTO visiteur (nom, prenom, type_visiteur) VALUES ('RACHIDI', 'Omar', 'ADHERENT');
INSERT INTO visiteur (nom, prenom, type_visiteur) VALUES ('MANSOURI', 'Salma', 'INVITE');

-- Mock Visites (Simple insertion pour simulation)
INSERT INTO visite (date_visite, heure_arrivee, statut_visite, visiteur_id, service_id, motif_id, badge_id) 
VALUES (CURRENT_TIMESTAMP, '08:30:00', 'EN_COURS', 1, 1, 1, 3);
INSERT INTO visite (date_visite, heure_arrivee, statut_visite, visiteur_id, service_id, motif_id, badge_id) 
VALUES (CURRENT_TIMESTAMP, '09:15:00', 'TERMINEE', 2, 2, 3, 4);
INSERT INTO visite (date_visite, heure_arrivee, statut_visite, visiteur_id, service_id, motif_id, badge_id) 
VALUES (CURRENT_TIMESTAMP, '10:00:00', 'EN_COURS', 3, 4, 7, 3);
INSERT INTO visite (date_visite, heure_arrivee, statut_visite, visiteur_id, service_id, motif_id, badge_id) 
VALUES (CURRENT_TIMESTAMP, '10:45:00', 'EN_COURS', 4, 9, 14, 4);
