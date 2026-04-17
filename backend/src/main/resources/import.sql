-- ==========================================================
-- NETTOYAGE (Ordre respectant les contraintes)
-- ==========================================================
DELETE FROM visites;
DELETE FROM motif_affectation;
DELETE FROM utilisateur_motifs;
DELETE FROM affectation_fonctionnaires;
DELETE FROM objet_visite;
DELETE FROM utilisateurs;
DELETE FROM badges;
DELETE FROM services;
DELETE FROM visiteurs;
DELETE FROM reference_items;

-- ==========================================================
-- 1. RÉFÉRENCES (INDISPENSABLES POUR LE FRONT)
-- ==========================================================
INSERT INTO reference_items (categorie, valeur, ordre) VALUES ('TYPE_ADHERENT', 'ADHERENT', 0), ('TYPE_ADHERENT', 'CONJOINT', 1), ('TYPE_ADHERENT', 'EXTERNE', 2);
INSERT INTO reference_items (categorie, valeur, ordre) VALUES ('STATUT', 'ACTIF', 0), ('STATUT', 'RETRAITE', 1);
INSERT INTO reference_items (categorie, valeur, ordre) VALUES ('ROLE', 'AGENT', 0), ('ROLE', 'FONCTIONNAIRE', 1), ('ROLE', 'ADMIN', 2);

-- ==========================================================
-- 2. SERVICES
-- ==========================================================
INSERT INTO services (nom, description) VALUES ('Estivage', 'Gestion des centres d''estivage');
INSERT INTO services (nom, description) VALUES ('Médicale', 'Prises en charge médicales');
INSERT INTO services (nom, description) VALUES ('RH', 'Ressources Humaines');
INSERT INTO services (nom, description) VALUES ('Prêts & Aides', 'Gestion des prêts et aides sociales');
INSERT INTO services (nom, description) VALUES ('Formation & Culture', 'Activités culturelles et formation');

-- ==========================================================
-- 3. UTILISATEURS (AGENTS & FONCTIONNAIRES)
-- ==========================================================
INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('agent_ahmed', 'Ahmed Mansouri', 'AGENT', 1, 0, 'DISPONIBLE', GETDATE(), NULL);

INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('f_driss', 'Driss Alaoui', 'FONCTIONNAIRE', 1, 0, 'DISPONIBLE', GETDATE(), (SELECT id FROM services WHERE nom='Estivage'));

INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('f_khadija', 'Khadija El Amrani', 'FONCTIONNAIRE', 1, 0, 'DISPONIBLE', GETDATE(), (SELECT id FROM services WHERE nom='Médicale'));

INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('f_fatima', 'Fatima Zohra', 'FONCTIONNAIRE', 1, 0, 'DISPONIBLE', GETDATE(), (SELECT id FROM services WHERE nom='Prêts & Aides'));

INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('f_omar', 'Omar Bennani', 'FONCTIONNAIRE', 1, 0, 'DISPONIBLE', GETDATE(), (SELECT id FROM services WHERE nom='Formation & Culture'));

INSERT INTO utilisateurs (username, nom_complet, role, actif, is_chef, statut_presence, date_creation, service_id) 
VALUES ('admin_user', 'Admin Système', 'ADMIN', 1, 0, 'DISPONIBLE', GETDATE(), NULL);

-- ==========================================================
-- 4. MOTIFS (OBJET_VISITE)
-- ==========================================================
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) 
VALUES ('EST_RES', 'Réservation centres', (SELECT id FROM services WHERE nom='Estivage'), 'SEQUENTIEL', 1);

INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) 
VALUES ('MED_PEC', 'Prise en charge', (SELECT id FROM services WHERE nom='Médicale'), 'PRIORITE', 1);

INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) 
VALUES ('SOC_PRET', 'Demande de prêt', (SELECT id FROM services WHERE nom='Prêts & Aides'), 'SEQUENTIEL', 1);

INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme, actif) 
VALUES ('CUL_EXC', 'Inscription Excursion', (SELECT id FROM services WHERE nom='Formation & Culture'), 'SEQUENTIEL', 1);

-- ==========================================================
-- 4b. LIENS UTILISATEUR - MOTIFS
-- ==========================================================
INSERT INTO motif_affectation (motif_id, utilisateur_id, priorite)
VALUES ((SELECT id FROM objet_visite WHERE code='EST_RES'), (SELECT id FROM utilisateurs WHERE username='f_driss'), 1);

INSERT INTO motif_affectation (motif_id, utilisateur_id, priorite)
VALUES ((SELECT id FROM objet_visite WHERE code='MED_PEC'), (SELECT id FROM utilisateurs WHERE username='f_khadija'), 1);

INSERT INTO motif_affectation (motif_id, utilisateur_id, priorite)
VALUES ((SELECT id FROM objet_visite WHERE code='SOC_PRET'), (SELECT id FROM utilisateurs WHERE username='f_fatima'), 1);

INSERT INTO motif_affectation (motif_id, utilisateur_id, priorite)
VALUES ((SELECT id FROM objet_visite WHERE code='CUL_EXC'), (SELECT id FROM utilisateurs WHERE username='f_omar'), 1);

INSERT INTO utilisateur_motifs (utilisateur_id, motif_id)
VALUES ((SELECT id FROM utilisateurs WHERE username='f_driss'), (SELECT id FROM objet_visite WHERE code='EST_RES'));

INSERT INTO utilisateur_motifs (utilisateur_id, motif_id)
VALUES ((SELECT id FROM utilisateurs WHERE username='f_khadija'), (SELECT id FROM objet_visite WHERE code='MED_PEC'));

INSERT INTO utilisateur_motifs (utilisateur_id, motif_id)
VALUES ((SELECT id FROM utilisateurs WHERE username='f_fatima'), (SELECT id FROM objet_visite WHERE code='SOC_PRET'));

INSERT INTO utilisateur_motifs (utilisateur_id, motif_id)
VALUES ((SELECT id FROM utilisateurs WHERE username='f_omar'), (SELECT id FROM objet_visite WHERE code='CUL_EXC'));

-- ==========================================================
-- 4c. AFFECTATIONS SERVICES
-- ==========================================================
INSERT INTO affectation_fonctionnaires (service_id, fonctionnaire_id, priorite, actif)
VALUES ((SELECT id FROM services WHERE nom='Estivage'), (SELECT id FROM utilisateurs WHERE username='f_driss'), 1, 1);

INSERT INTO affectation_fonctionnaires (service_id, fonctionnaire_id, priorite, actif)
VALUES ((SELECT id FROM services WHERE nom='Médicale'), (SELECT id FROM utilisateurs WHERE username='f_khadija'), 1, 1);

INSERT INTO affectation_fonctionnaires (service_id, fonctionnaire_id, priorite, actif)
VALUES ((SELECT id FROM services WHERE nom='Prêts & Aides'), (SELECT id FROM utilisateurs WHERE username='f_fatima'), 1, 1);

INSERT INTO affectation_fonctionnaires (service_id, fonctionnaire_id, priorite, actif)
VALUES ((SELECT id FROM services WHERE nom='Formation & Culture'), (SELECT id FROM utilisateurs WHERE username='f_omar'), 1, 1);

-- ==========================================================
-- 5. BADGES
-- ==========================================================
INSERT INTO badges (code, statut, service_id) VALUES ('EST-01', 'DISPONIBLE', (SELECT id FROM services WHERE nom='Estivage'));
INSERT INTO badges (code, statut, service_id) VALUES ('EST-02', 'DISPONIBLE', (SELECT id FROM services WHERE nom='Estivage'));
INSERT INTO badges (code, statut, service_id) VALUES ('MED-01', 'DISPONIBLE', (SELECT id FROM services WHERE nom='Médicale'));
INSERT INTO badges (code, statut, service_id) VALUES ('MED-02', 'OCCUPE', (SELECT id FROM services WHERE nom='Médicale'));
INSERT INTO badges (code, statut, service_id) VALUES ('SOC-01', 'DISPONIBLE', (SELECT id FROM services WHERE nom='Prêts & Aides'));
INSERT INTO badges (code, statut, service_id) VALUES ('CUL-01', 'DISPONIBLE', (SELECT id FROM services WHERE nom='Formation & Culture'));
INSERT INTO badges (code, statut) VALUES ('B-101', 'DISPONIBLE');
INSERT INTO badges (code, statut) VALUES ('B-103', 'PRET_A_RESTITUER');

-- ==========================================================
-- 6. VISITEURS (ADHÉRENTS)
-- ==========================================================
INSERT INTO visiteurs (nom, prenom, type, cin, num_adhesion, statut_adherent, type_adherent_detail, grade, affectation, type_assurance) 
VALUES ('EL OUALI', 'Mohammed', 'ADHERENT', 'AB123456', 'ADH-2024-01', 'ACTIF', 'Budget Général', 'Administrateur Adjoint', 'Rabat', 'MI/FH2');

INSERT INTO visiteurs (nom, prenom, type, cin, num_adhesion, statut_adherent, type_adherent_detail, grade, affectation, type_assurance) 
VALUES ('BENNANI', 'Siham', 'CONJOINT', 'CD789012', 'ADH-2024-02', 'ACTIF', 'Budget Communal', 'Caïd', 'Casablanca', 'MI');

INSERT INTO visiteurs (nom, prenom, type, cin, num_adhesion, statut_adherent, type_adherent_detail, grade, affectation, type_assurance) 
VALUES ('ALAOUI', 'Yassine', 'ADHERENT', 'EE112233', 'ADH-2024-03', 'ACTIF', 'DGST', 'Gouverneur', 'Tanger', 'MI/FH2');

INSERT INTO visiteurs (nom, prenom, type, cin, num_adhesion, statut_adherent, type_adherent_detail, grade, affectation, type_assurance) 
VALUES ('MAZOUZI', 'Leila', 'ADHERENT', 'FF445566', 'ADH-2024-04', 'RETRAITE', 'Protection Civile', 'Khalifa', 'Marrakech', 'MI');

INSERT INTO visiteurs (nom, prenom, type, cin, num_adhesion, statut_adherent, type_adherent_detail, grade, affectation, type_assurance) 
VALUES ('CHERRADI', 'Karim', 'EXTERNE', 'GG778899', NULL, NULL, NULL, NULL, NULL, NULL);

-- ==========================================================
-- 7. VISITES (HISTORIQUE DU JOUR)
-- ==========================================================
INSERT INTO visites (visiteur_id, service_id, objet_visite_id, fonctionnaire_id, agent_accueil_id, badge_id, statut, heure_arrivee, heure_cloture, notes)
VALUES (
    (SELECT id FROM visiteurs WHERE cin='AB123456'),
    (SELECT id FROM services WHERE nom='Estivage'),
    (SELECT id FROM objet_visite WHERE code='EST_RES'),
    (SELECT id FROM utilisateurs WHERE username='f_driss'),
    (SELECT id FROM utilisateurs WHERE username='agent_ahmed'),
    (SELECT id FROM badges WHERE code='B-101'),
    'CLOTUREE',
    DATEADD(HOUR, -5, GETDATE()),
    DATEADD(HOUR, -4, GETDATE()),
    'Dossier validé avec succès'
);
