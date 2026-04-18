-- V1__Initial_Schema.sql
-- Schema complet correspondant aux entités Java actuelles
-- Note : Flyway est désactivé (spring.flyway.enabled=false) — Hibernate ddl-auto:update gère le schéma.
-- Ce fichier sert de référence / bootstrap manuel si nécessaire.

CREATE TABLE services (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL
);

CREATE TABLE utilisateurs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL UNIQUE,
    nom_complet NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NULL,
    password NVARCHAR(255) NULL,
    role NVARCHAR(255) NOT NULL CHECK (role IN ('AGENT','FONCTIONNAIRE','RESPONSABLE','ADMIN','DIRECTEUR')),
    is_chef BIT NOT NULL DEFAULT 0,
    actif BIT NOT NULL DEFAULT 1,
    service_id BIGINT NULL REFERENCES services(id),
    statut_presence NVARCHAR(50) NOT NULL DEFAULT 'HORS_LIGNE',
    date_creation DATETIME2 NULL,
    date_modification DATETIME2 NULL
);

CREATE TABLE objet_visite (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    code             NVARCHAR(255) NOT NULL UNIQUE,
    libelle_fr       NVARCHAR(255) NOT NULL,
    libelle_ar       NVARCHAR(255) NULL,
    algorithme       NVARCHAR(255) NULL CHECK (algorithme IN ('SEQUENTIEL','PRIORITE')),
    type_affectation NVARCHAR(50)  NULL CHECK (type_affectation IN ('ALEATOIRE','SPECIFIQUE')),
    service_id       BIGINT NOT NULL REFERENCES services(id),
    actif            BIT NOT NULL DEFAULT 1
);

CREATE TABLE utilisateur_motifs (
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    motif_id BIGINT NOT NULL REFERENCES objet_visite(id),
    PRIMARY KEY (utilisateur_id, motif_id)
);

CREATE TABLE badges (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    code               NVARCHAR(255) NOT NULL UNIQUE,
    statut             NVARCHAR(255) NOT NULL DEFAULT 'DISPONIBLE'
                           CHECK (statut IN ('DISPONIBLE','OCCUPE','PRET_A_RESTITUER','RESTITUE')),
    visite_courante_id BIGINT NULL,
    service_id         BIGINT NULL REFERENCES services(id)
);

CREATE TABLE visiteurs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(255) NOT NULL,
    prenom NVARCHAR(255) NOT NULL,
    cin NVARCHAR(255) NULL UNIQUE,
    num_adhesion NVARCHAR(255) NULL UNIQUE,
    telephone NVARCHAR(255) NULL,
    sexe NVARCHAR(50) NULL,
    situation_familiale NVARCHAR(50) NULL,
    type NVARCHAR(255) NOT NULL CHECK (type IN ('ADHERENT','CONJOINT','ENFANT','PARTENAIRE','MEDECIN','VIP','EXTERNE')),
    statut_adherent NVARCHAR(255) NULL CHECK (statut_adherent IN ('ACTIF','RETRAITE','RADIE')),
    parent_id BIGINT NULL REFERENCES visiteurs(id),
    affectation NVARCHAR(255) NULL,
    grade NVARCHAR(255) NULL,
    lien_parente NVARCHAR(255) NULL,
    type_adherent_detail NVARCHAR(255) NULL,
    type_assurance NVARCHAR(255) NULL
);

CREATE TABLE visites (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    visiteur_id BIGINT NOT NULL REFERENCES visiteurs(id),
    objet_visite_id BIGINT NULL REFERENCES objet_visite(id),
    service_id BIGINT NOT NULL REFERENCES services(id),
    fonctionnaire_id BIGINT NULL REFERENCES utilisateurs(id),
    agent_accueil_id BIGINT NULL REFERENCES utilisateurs(id),
    badge_id BIGINT NULL REFERENCES badges(id),
    statut NVARCHAR(255) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE','EN_COURS','REAFFECTEE','TERMINEE','CLOTUREE')),
    heure_arrivee DATETIME2 NOT NULL DEFAULT GETDATE(),
    heure_acceptation DATETIME2 NULL,
    heure_entree DATETIME2 NULL,
    heure_sortie DATETIME2 NULL,
    heure_cloture DATETIME2 NULL,
    heure_restitution_badge DATETIME2 NULL,
    notes NVARCHAR(1000) NULL,
    date_creation DATETIME2 NULL,
    date_modification DATETIME2 NULL
);

CREATE TABLE affectation_fonctionnaires (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id),
    fonctionnaire_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    priorite INT NOT NULL DEFAULT 1,
    actif BIT NOT NULL DEFAULT 1
);

CREATE TABLE motif_affectation (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    motif_id   BIGINT NOT NULL REFERENCES objet_visite(id),
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    priorite   INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_motif_priorite UNIQUE (motif_id, priorite)
);

-- ─── Références configurables ────────────────────────────────────────────────
CREATE TABLE reference_items (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    categorie   NVARCHAR(50)  NOT NULL,
    valeur      NVARCHAR(200) NOT NULL,
    description NVARCHAR(500) NULL,
    ordre       INT           NOT NULL DEFAULT 0,
    CONSTRAINT uq_reference_categorie_valeur UNIQUE (categorie, valeur)
);

-- ─── Données initiales ───────────────────────────────────────────────────────

-- Type de l'adhérent
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('TYPE_ADHERENT', 'ADHERENT',   0),
    ('TYPE_ADHERENT', 'CONJOINT',   1),
    ('TYPE_ADHERENT', 'ENFANT',     2),
    ('TYPE_ADHERENT', 'PARTENAIRE', 3),
    ('TYPE_ADHERENT', 'MEDECIN',    4),
    ('TYPE_ADHERENT', 'VIP',        5),
    ('TYPE_ADHERENT', 'EXTERNE',    6);

-- Situation familiale
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('SITUATION_FAMILIALE', 'CELIBATAIRE', 0),
    ('SITUATION_FAMILIALE', 'MARIE',       1),
    ('SITUATION_FAMILIALE', 'VEUF',        2);

-- Statut adhérent
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('STATUT', 'ACTIF',    0),
    ('STATUT', 'RETRAITE', 1),
    ('STATUT', 'RADIE',    2);

-- Type adhérent détail
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('TYPE_DETAIL', 'Budget Général',          0),
    ('TYPE_DETAIL', 'Budget Communal',         1),
    ('TYPE_DETAIL', 'Protection Civile',       2),
    ('TYPE_DETAIL', 'DGST',                    3),
    ('TYPE_DETAIL', N'Agent d''autorité',      4),
    ('TYPE_DETAIL', N'Auxiliaire d''autorité', 5);

-- Grade
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('GRADE', 'Echelle 6-9',                  0),
    ('GRADE', 'Administrateur Adjoint',        1),
    ('GRADE', N'Administrateur 2ème grade',   2),
    ('GRADE', N'Caïd',                        3),
    ('GRADE', 'Khalifa',                       4),
    ('GRADE', 'Bacha',                         5),
    ('GRADE', 'Gouverneur',                    6),
    ('GRADE', 'Wali',                          7);

-- Type assurance
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('TYPE_ASSURANCE', 'MI',         0),
    ('TYPE_ASSURANCE', 'MI/FH2',     1),
    ('TYPE_ASSURANCE', N'Non assuré', 2);

-- Rôle
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('ROLE', 'AGENT',        0),
    ('ROLE', 'FONCTIONNAIRE', 1),
    ('ROLE', 'RESPONSABLE',  2),
    ('ROLE', 'DIRECTEUR',    3),
    ('ROLE', 'ADMIN',        4);

-- Statut de présence
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('STATUT_PRESENCE', 'EN_LIGNE',    0),
    ('STATUT_PRESENCE', 'EN_PAUSE',    1),
    ('STATUT_PRESENCE', 'REUNION',     2),
    ('STATUT_PRESENCE', 'CONGE',       3),
    ('STATUT_PRESENCE', 'MISSION',     4),
    ('STATUT_PRESENCE', 'HORS_LIGNE',  5);

-- Affectation (villes du Maroc)
INSERT INTO reference_items (categorie, valeur, ordre) VALUES
    ('AFFECTATION', 'Rabat',          0),
    ('AFFECTATION', N'Salé',          1),
    ('AFFECTATION', N'Témara',        2),
    ('AFFECTATION', 'Casablanca',     3),
    ('AFFECTATION', 'Mohammedia',     4),
    ('AFFECTATION', 'Berrechid',      5),
    ('AFFECTATION', 'Settat',         6),
    ('AFFECTATION', N'Médiouna',      7),
    ('AFFECTATION', 'Marrakech',      8),
    ('AFFECTATION', 'Agadir',         9),
    ('AFFECTATION', 'Inezgane',       10),
    ('AFFECTATION', N'Aït Melloul',   11),
    ('AFFECTATION', 'Tiznit',         12),
    ('AFFECTATION', 'Taroudant',      13),
    ('AFFECTATION', 'Ouarzazate',     14),
    ('AFFECTATION', 'Zagora',         15),
    ('AFFECTATION', N'Fès',           16),
    ('AFFECTATION', N'Meknès',        17),
    ('AFFECTATION', 'Ifrane',         18),
    ('AFFECTATION', 'Sefrou',         19),
    ('AFFECTATION', 'Azrou',          20),
    ('AFFECTATION', N'Khénifra',      21),
    ('AFFECTATION', 'Tanger',         22),
    ('AFFECTATION', N'Tétouan',       23),
    ('AFFECTATION', 'Chefchaouen',    24),
    ('AFFECTATION', 'Al Hoceima',     25),
    ('AFFECTATION', 'Larache',        26),
    ('AFFECTATION', 'Ksar El Kebir',  27),
    ('AFFECTATION', 'Asilah',         28),
    ('AFFECTATION', 'Oujda',          29),
    ('AFFECTATION', 'Nador',          30),
    ('AFFECTATION', 'Berkane',        31),
    ('AFFECTATION', 'Taourirt',       32),
    ('AFFECTATION', 'Guercif',        33),
    ('AFFECTATION', 'Jerada',         34),
    ('AFFECTATION', N'Kénitra',       35),
    ('AFFECTATION', N'Khémisset',     36),
    ('AFFECTATION', 'Sidi Kacem',     37),
    ('AFFECTATION', 'Sidi Slimane',   38),
    ('AFFECTATION', 'El Jadida',      39),
    ('AFFECTATION', 'Safi',           40),
    ('AFFECTATION', 'Essaouira',      41),
    ('AFFECTATION', 'Azemmour',       42),
    ('AFFECTATION', N'Béni Mellal',   43),
    ('AFFECTATION', 'Khouribga',      44),
    ('AFFECTATION', 'Fquih Ben Salah', 45),
    ('AFFECTATION', 'Azilal',         46),
    ('AFFECTATION', 'Guelmim',        47),
    ('AFFECTATION', 'Tan Tan',        48),
    ('AFFECTATION', 'Sidi Ifni',      49),
    ('AFFECTATION', 'Assa',           50),
    ('AFFECTATION', N'Laâyoune',      51),
    ('AFFECTATION', 'Boujdour',       52),
    ('AFFECTATION', 'Smara',          53),
    ('AFFECTATION', 'Dakhla',         54),
    ('AFFECTATION', 'Aousserd',       55),
    ('AFFECTATION', 'Errachidia',     56),
    ('AFFECTATION', 'Midelt',         57),
    ('AFFECTATION', 'Rich',           58),
    ('AFFECTATION', 'Taza',           59),
    ('AFFECTATION', 'Taounate',       60);

-- ─── Compte administrateur par défaut ───────────────────────────────────────
-- login: admin / password: admin (BCrypt)
INSERT INTO utilisateurs (username, nom_complet, password, role, is_chef, actif, statut_presence)
SELECT 'admin', 'Administrateur Système',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       'ADMIN', 0, 1, 'HORS_LIGNE'
WHERE NOT EXISTS (SELECT 1 FROM utilisateurs WHERE username = 'admin');

-- ─── Services initiaux ───────────────────────────────────────────────────────
-- (décommenter pour un bootstrap complet avec données de démo)
/*
INSERT INTO services (nom, description) VALUES
    ('Prestations sociales',   'Gestion des aides et prestations'),
    ('Affaires médicales',     'Suivi médical et assurance'),
    ('Formation & Culture',    'Activités culturelles et formation'),
    ('Retraite & Pension',     'Dossiers retraite et pensions'),
    ('Administration',         'Services administratifs généraux');

-- Badges : préfixe A→E, 15 badges par service (A001-A015 … E001-E015)
DECLARE @svc1 BIGINT = (SELECT id FROM services WHERE nom='Prestations sociales');
DECLARE @svc2 BIGINT = (SELECT id FROM services WHERE nom='Affaires médicales');
DECLARE @svc3 BIGINT = (SELECT id FROM services WHERE nom='Formation & Culture');
DECLARE @svc4 BIGINT = (SELECT id FROM services WHERE nom='Retraite & Pension');
DECLARE @svc5 BIGINT = (SELECT id FROM services WHERE nom='Administration');

DECLARE @i INT = 1;
WHILE @i <= 15
BEGIN
    INSERT INTO badges (code, statut, service_id) VALUES (CONCAT('A', RIGHT('000'+CAST(@i AS VARCHAR),3)), 'DISPONIBLE', @svc1);
    INSERT INTO badges (code, statut, service_id) VALUES (CONCAT('B', RIGHT('000'+CAST(@i AS VARCHAR),3)), 'DISPONIBLE', @svc2);
    INSERT INTO badges (code, statut, service_id) VALUES (CONCAT('C', RIGHT('000'+CAST(@i AS VARCHAR),3)), 'DISPONIBLE', @svc3);
    INSERT INTO badges (code, statut, service_id) VALUES (CONCAT('D', RIGHT('000'+CAST(@i AS VARCHAR),3)), 'DISPONIBLE', @svc4);
    INSERT INTO badges (code, statut, service_id) VALUES (CONCAT('E', RIGHT('000'+CAST(@i AS VARCHAR),3)), 'DISPONIBLE', @svc5);
    SET @i = @i + 1;
END;
*/
