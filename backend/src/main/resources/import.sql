-- Correction de import.sql pour correspondre au schéma réel et aux énumérations

-- 1. Services
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

-- 2. Motifs (objet_visite)
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('EST_RES', 'Réservation centres', 1, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('RH_ATT', 'Attestation de travail', 2, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('BO_DEP', 'Dépôt courrier', 3, 'PRIORITE', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('ADH_NEW', 'Nouvelle adhésion', 4, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('DIR_RDV', 'Rendez-vous Directeur', 5, 'PRIORITE', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('MED_PEC', 'Prise en charge', 6, 'PRIORITE', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('INF_TECH', 'Problème technique', 7, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('ASS_SIN', 'Déclaration Sinistre', 8, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('FIN_PAI', 'Paiement / Règlement', 9, 'SEQUENTIEL', 'ALEATOIRE', 1);
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, type_affectation, actif) VALUES ('TEC_MAINT', 'Maintenance', 10, 'SEQUENTIEL', 'ALEATOIRE', 1);

-- 3. Utilisateurs (Test)
-- password: password (BCrypt)
-- Chaque service doit avoir au moins un fonctionnaire pour l'affectation automatique
INSERT INTO utilisateurs (username, nom_complet, password, role, service_id, statut_presence, actif, is_chef) VALUES 
('f1', 'Fonctionnaire Estivage', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 1, 'EN_LIGNE', 1, 0),
('f2', 'Fonctionnaire RH', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 2, 'EN_LIGNE', 1, 0),
('f3', 'Fonctionnaire BO', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 3, 'EN_LIGNE', 1, 0),
('f4', 'Fonctionnaire Adhésion', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 4, 'EN_LIGNE', 1, 0),
('f5', 'Fonctionnaire Direction', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 5, 'EN_LIGNE', 1, 0),
('f6', 'Fonctionnaire Médicale', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'FONCTIONNAIRE', 6, 'EN_LIGNE', 1, 0);

-- 4. Badges (Statut: DISPONIBLE)
INSERT INTO badges (code, statut, service_id) VALUES ('B-EST-01', 'DISPONIBLE', 1);
INSERT INTO badges (code, statut, service_id) VALUES ('B-RH-01', 'DISPONIBLE', 2);
INSERT INTO badges (code, statut, service_id) VALUES ('B-BO-01', 'DISPONIBLE', 3);
INSERT INTO badges (code, statut, service_id) VALUES ('B-ADH-01', 'DISPONIBLE', 4);
INSERT INTO badges (code, statut, service_id) VALUES ('B-DIR-01', 'DISPONIBLE', 5);
INSERT INTO badges (code, statut, service_id) VALUES ('B-MED-01', 'DISPONIBLE', 6);
INSERT INTO badges (code, statut) VALUES ('B-GEN-01', 'DISPONIBLE');
INSERT INTO badges (code, statut) VALUES ('B-GEN-02', 'DISPONIBLE');

-- 5. Visiteurs (Test)
INSERT INTO visiteurs (nom, prenom, type, cin) VALUES ('ALAMI', 'Youssef', 'ADHERENT', 'AB123456');
INSERT INTO visiteurs (nom, prenom, type, num_adhesion) VALUES ('BENANI', 'Fatima', 'ADHERENT', 'ADH-789');
