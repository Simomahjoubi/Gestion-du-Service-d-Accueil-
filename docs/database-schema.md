# Database Schema
# Service d'Accueil — Microsoft SQL Server

---

## 1. Overview

The application uses **two SQL Server databases**:

| Database | Purpose |
|----------|---------|
| `FH2_MEMBERS_DB` | Existing database — read-only access to member records (adhérents, conjoints, enfants, médecins, partenaires) |
| `FH2_ACCUEIL_DB` | New application database — visits, badges, users, services, notifications, audit logs |

> The application connects to both databases. All write operations target `FH2_ACCUEIL_DB` only.

---

## 2. FH2_ACCUEIL_DB — Entity Relationship Diagram

```
UTILISATEUR ──────────────── SERVICE
     │                          │
     │ (fonctionnaire)          │ (appartient_à)
     │                          │
AFFECTATION ◄──── VISITE ─────► BADGE
                    │
                    │
               POINTAGE (entrée / sortie)
               NOTIFICATION
               HISTORIQUE_STATUT
```

---

## 3. Tables

### 3.1 `utilisateur`
Stores all internal system users (synchronized from Active Directory).

```sql
CREATE TABLE utilisateur (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    username            NVARCHAR(100)   NOT NULL UNIQUE,       -- AD login
    nom                 NVARCHAR(100)   NOT NULL,
    prenom              NVARCHAR(100)   NOT NULL,
    email               NVARCHAR(150)   NOT NULL UNIQUE,
    role                NVARCHAR(50)    NOT NULL,              -- AGENT, FONCTIONNAIRE, RESPONSABLE, ADMIN, DIRECTEUR
    service_id          BIGINT          NULL REFERENCES service(id),
    actif               BIT             NOT NULL DEFAULT 1,
    date_creation       DATETIME2       NOT NULL DEFAULT GETDATE(),
    date_modification   DATETIME2       NULL
);

CREATE INDEX idx_utilisateur_username ON utilisateur(username);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_utilisateur_service ON utilisateur(service_id);
```

---

### 3.2 `service`
Represents internal departments/services of the Fondation.

```sql
CREATE TABLE service (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    code                NVARCHAR(20)    NOT NULL UNIQUE,
    nom_fr              NVARCHAR(150)   NOT NULL,
    nom_ar              NVARCHAR(150)   NULL,
    description         NVARCHAR(500)   NULL,
    actif               BIT             NOT NULL DEFAULT 1,
    date_creation       DATETIME2       NOT NULL DEFAULT GETDATE()
);
```

---

### 3.3 `badge`
Physical pre-printed QR code badges. Fixed QR value per badge (permanent).

```sql
CREATE TABLE badge (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    numero              NVARCHAR(50)    NOT NULL UNIQUE,       -- Badge number (encoded in QR)
    qr_code             NVARCHAR(255)   NOT NULL UNIQUE,       -- QR code value
    statut              NVARCHAR(30)    NOT NULL DEFAULT 'DISPONIBLE',
                                        -- DISPONIBLE | OCCUPE | PRET_A_RESTITUER | RESTITUE
    visite_courante_id  BIGINT          NULL,                  -- FK set on assignment
    date_creation       DATETIME2       NOT NULL DEFAULT GETDATE(),
    date_modification   DATETIME2       NULL,
    actif               BIT             NOT NULL DEFAULT 1,

    CONSTRAINT chk_badge_statut CHECK (statut IN ('DISPONIBLE', 'OCCUPE', 'PRET_A_RESTITUER', 'RESTITUE'))
);

CREATE INDEX idx_badge_statut ON badge(statut);
CREATE INDEX idx_badge_qr ON badge(qr_code);
```

---

### 3.4 `visiteur`
Stores visitor profile data. For known members, links to FH2_MEMBERS_DB via `membre_id`.

```sql
CREATE TABLE visiteur (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    type_visiteur       NVARCHAR(30)    NOT NULL,
                                        -- ADHERENT | CONJOINT | ENFANT | PARTENAIRE | MEDECIN | VIP | EXTERNE
    nom                 NVARCHAR(100)   NOT NULL,
    prenom              NVARCHAR(100)   NOT NULL,
    cin                 NVARCHAR(30)    NULL,
    numero_adhesion     NVARCHAR(50)    NULL,
    telephone           NVARCHAR(20)    NULL,
    membre_id           BIGINT          NULL,                  -- Reference to FH2_MEMBERS_DB (nullable for EXTERNE)
    date_creation       DATETIME2       NOT NULL DEFAULT GETDATE(),
    date_modification   DATETIME2       NULL,

    CONSTRAINT chk_visiteur_type CHECK (type_visiteur IN ('ADHERENT', 'CONJOINT', 'ENFANT', 'PARTENAIRE', 'MEDECIN', 'VIP', 'EXTERNE'))
);

CREATE INDEX idx_visiteur_cin ON visiteur(cin);
CREATE INDEX idx_visiteur_adhesion ON visiteur(numero_adhesion);
CREATE INDEX idx_visiteur_type ON visiteur(type_visiteur);
```

---

### 3.5 `objet_visite`
Defines the reasons/purposes for a visit. Each objet is linked to a service and an assignment algorithm.

```sql
CREATE TABLE objet_visite (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    code                NVARCHAR(50)    NOT NULL UNIQUE,
    libelle_fr          NVARCHAR(200)   NOT NULL,
    libelle_ar          NVARCHAR(200)   NULL,
    service_id          BIGINT          NOT NULL REFERENCES service(id),
    algorithme          NVARCHAR(30)    NOT NULL DEFAULT 'SEQUENTIEL',
                                        -- SEQUENTIEL | PRIORITE
    actif               BIT             NOT NULL DEFAULT 1,

    CONSTRAINT chk_objet_algorithme CHECK (algorithme IN ('SEQUENTIEL', 'PRIORITE'))
);

CREATE INDEX idx_objet_service ON objet_visite(service_id);
```

---

### 3.6 `visite`
Core entity representing a visit from arrival to archive.

```sql
CREATE TABLE visite (
    id                      BIGINT          IDENTITY(1,1) PRIMARY KEY,
    visiteur_id             BIGINT          NOT NULL REFERENCES visiteur(id),
    objet_visite_id         BIGINT          NOT NULL REFERENCES objet_visite(id),
    service_id              BIGINT          NOT NULL REFERENCES service(id),
    fonctionnaire_id        BIGINT          NULL REFERENCES utilisateur(id),
    responsable_id          BIGINT          NULL REFERENCES utilisateur(id),
    badge_id                BIGINT          NULL REFERENCES badge(id),
    agent_accueil_id        BIGINT          NOT NULL REFERENCES utilisateur(id),
    statut                  NVARCHAR(30)    NOT NULL DEFAULT 'EN_ATTENTE',
                                            -- EN_ATTENTE | EN_COURS | REAFFECTEE | TERMINEE | CLOTUREE
    heure_arrivee           DATETIME2       NOT NULL DEFAULT GETDATE(),
    heure_entree            DATETIME2       NULL,              -- Set on badge scan entry
    heure_sortie            DATETIME2       NULL,              -- Set on badge scan exit
    heure_cloture           DATETIME2       NULL,
    notes                   NVARCHAR(1000)  NULL,
    date_creation           DATETIME2       NOT NULL DEFAULT GETDATE(),
    date_modification       DATETIME2       NULL,

    CONSTRAINT chk_visite_statut CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'REAFFECTEE', 'TERMINEE', 'CLOTUREE'))
);

CREATE INDEX idx_visite_statut ON visite(statut);
CREATE INDEX idx_visite_visiteur ON visite(visiteur_id);
CREATE INDEX idx_visite_fonctionnaire ON visite(fonctionnaire_id);
CREATE INDEX idx_visite_service ON visite(service_id);
CREATE INDEX idx_visite_badge ON visite(badge_id);
CREATE INDEX idx_visite_date ON visite(heure_arrivee);
-- Prevent duplicate: same visitor cannot have two active visits simultaneously
CREATE UNIQUE INDEX uq_visite_active ON visite(visiteur_id)
    WHERE statut NOT IN ('TERMINEE', 'CLOTUREE');
```

---

### 3.7 `historique_statut_visite`
Immutable audit trail of every status change on a visit.

```sql
CREATE TABLE historique_statut_visite (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    visite_id           BIGINT          NOT NULL REFERENCES visite(id),
    statut_avant        NVARCHAR(30)    NOT NULL,
    statut_apres        NVARCHAR(30)    NOT NULL,
    modifie_par_id      BIGINT          NOT NULL REFERENCES utilisateur(id),
    commentaire         NVARCHAR(500)   NULL,
    date_modification   DATETIME2       NOT NULL DEFAULT GETDATE()
);

CREATE INDEX idx_historique_visite ON historique_statut_visite(visite_id);
```

---

### 3.8 `notification`
Stores all in-app notifications sent to users.

```sql
CREATE TABLE notification (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    destinataire_id     BIGINT          NOT NULL REFERENCES utilisateur(id),
    visite_id           BIGINT          NULL REFERENCES visite(id),
    type                NVARCHAR(50)    NOT NULL,
                                        -- VISITE_ARRIVEE | VISITE_REAFFECTEE | VISITE_TERMINEE | BADGE_ALERTE | BADGE_DISPONIBLE
    message             NVARCHAR(500)   NOT NULL,
    lue                 BIT             NOT NULL DEFAULT 0,
    date_envoi          DATETIME2       NOT NULL DEFAULT GETDATE(),
    date_lecture        DATETIME2       NULL
);

CREATE INDEX idx_notification_destinataire ON notification(destinataire_id);
CREATE INDEX idx_notification_lue ON notification(destinataire_id, lue);
CREATE INDEX idx_notification_visite ON notification(visite_id);
```

---

### 3.9 `affectation_fonctionnaire`
Defines the priority order of fonctionnaires per objet_visite (used by assignment algorithms).

```sql
CREATE TABLE affectation_fonctionnaire (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    objet_visite_id     BIGINT          NOT NULL REFERENCES objet_visite(id),
    fonctionnaire_id    BIGINT          NOT NULL REFERENCES utilisateur(id),
    priorite            INT             NOT NULL DEFAULT 1,    -- Lower = higher priority
    actif               BIT             NOT NULL DEFAULT 1,

    CONSTRAINT uq_affectation UNIQUE (objet_visite_id, fonctionnaire_id)
);

CREATE INDEX idx_affectation_objet ON affectation_fonctionnaire(objet_visite_id);
```

---

### 3.10 `audit_log`
System-wide audit log for security and traceability.

```sql
CREATE TABLE audit_log (
    id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id      BIGINT          NULL REFERENCES utilisateur(id),
    action              NVARCHAR(100)   NOT NULL,              -- e.g., BADGE_ASSIGNED, VISIT_CLOSED
    entite              NVARCHAR(50)    NOT NULL,              -- e.g., visite, badge
    entite_id           BIGINT          NULL,
    details             NVARCHAR(MAX)   NULL,                  -- JSON payload
    ip_address          NVARCHAR(50)    NULL,
    date_action         DATETIME2       NOT NULL DEFAULT GETDATE()
);

CREATE INDEX idx_audit_utilisateur ON audit_log(utilisateur_id);
CREATE INDEX idx_audit_entite ON audit_log(entite, entite_id);
CREATE INDEX idx_audit_date ON audit_log(date_action);
```

---

## 4. FH2_MEMBERS_DB — Read-Only Reference Tables

> These tables are read via a **linked server** or **separate DataSource** in Spring Boot. No writes are performed.

### 4.1 `adherent` (existing)
```sql
-- Read-only reference
SELECT id, numero_adhesion, nom, prenom, cin, type, actif
FROM FH2_MEMBERS_DB.dbo.adherent
WHERE cin = ? OR numero_adhesion = ?
```

### 4.2 `conjoint` (existing)
```sql
SELECT id, adherent_id, nom, prenom, cin
FROM FH2_MEMBERS_DB.dbo.conjoint
WHERE cin = ? OR adherent_id = ?
```

### 4.3 `enfant` (existing)
```sql
SELECT id, adherent_id, nom, prenom, date_naissance
FROM FH2_MEMBERS_DB.dbo.enfant
WHERE adherent_id = ?
```

---

## 5. Key Relationships Summary

```
service (1) ────────── (N) utilisateur
service (1) ────────── (N) objet_visite
objet_visite (1) ────── (N) affectation_fonctionnaire
objet_visite (1) ────── (N) visite
visiteur (1) ──────────(N) visite
visite (N) ─────────── (1) badge
visite (1) ─────────── (N) historique_statut_visite
visite (1) ─────────── (N) notification
utilisateur (1) ─────── (N) notification [destinataire]
utilisateur (1) ─────── (N) visite [fonctionnaire_id]
utilisateur (1) ─────── (N) visite [responsable_id]
utilisateur (1) ─────── (N) visite [agent_accueil_id]
```

---

## 6. Naming Conventions

| Convention | Rule |
|-----------|------|
| Table names | `snake_case`, singular noun |
| Column names | `snake_case` |
| Primary keys | `id BIGINT IDENTITY` |
| Foreign keys | `<table>_id` |
| Indexes | `idx_<table>_<column>` |
| Unique indexes | `uq_<table>_<column>` |
| Status columns | `NVARCHAR`, validated with `CHECK` constraint |
| Timestamps | `DATETIME2`, default `GETDATE()` |

---

## 7. Enums Reference

### Badge Status (`badge.statut`)
| Value | Description |
|-------|-------------|
| `DISPONIBLE` | Free and ready |
| `OCCUPE` | Assigned to active visit |
| `PRET_A_RESTITUER` | Visit closed, awaiting physical return |
| `RESTITUE` | Physically returned (auto-resets to DISPONIBLE) |

### Visit Status (`visite.statut`)
| Value | Description |
|-------|-------------|
| `EN_ATTENTE` | Registered, not yet received |
| `EN_COURS` | Being processed |
| `REAFFECTEE` | Transferred |
| `TERMINEE` | Processing done, badge not returned |
| `CLOTUREE` | Fully complete, badge returned, archived |

### User Role (`utilisateur.role`)
| Value | Description |
|-------|-------------|
| `AGENT` | Agent d'accueil |
| `FONCTIONNAIRE` | Civil servant / Employee |
| `RESPONSABLE` | Chef de service |
| `ADMIN` | System administrator |
| `DIRECTEUR` | Director |
