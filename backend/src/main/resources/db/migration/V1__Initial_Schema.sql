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
    date_creation DATETIME2 NULL,
    date_modification DATETIME2 NULL
);

CREATE TABLE objet_visite (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(255) NOT NULL UNIQUE,
    libelle_fr NVARCHAR(255) NOT NULL,
    libelle_ar NVARCHAR(255) NULL,
    algorithme NVARCHAR(255) NULL CHECK (algorithme IN ('SEQUENTIEL','PRIORITE')),
    service_id BIGINT NOT NULL REFERENCES services(id),
    actif BIT NOT NULL DEFAULT 1
);

CREATE TABLE utilisateur_motifs (
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    motif_id BIGINT NOT NULL REFERENCES objet_visite(id),
    PRIMARY KEY (utilisateur_id, motif_id)
);

CREATE TABLE badges (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(255) NOT NULL UNIQUE,
    statut NVARCHAR(255) NOT NULL DEFAULT 'DISPONIBLE' CHECK (statut IN ('DISPONIBLE','OCCUPE','PRET_A_RESTITUER','RESTITUE')),
    visite_courante_id BIGINT NULL
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
    heure_entree DATETIME2 NULL,
    heure_sortie DATETIME2 NULL,
    heure_cloture DATETIME2 NULL,
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
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    objet_visite_id BIGINT NOT NULL REFERENCES objet_visite(id),
    fonctionnaire_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    type_affectation NVARCHAR(50) NULL,
    priorite INT NOT NULL DEFAULT 1,
    actif BIT NOT NULL DEFAULT 1
);
