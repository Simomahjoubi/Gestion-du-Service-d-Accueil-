# API Documentation
# REST API — Spring Boot Backend

---

## 1. General Conventions

| Convention | Value |
|-----------|-------|
| Base URL | `http://<host>:8080/api` |
| Format | JSON (`application/json`) |
| Authentication | `Authorization: Bearer <JWT>` |
| Date format | ISO 8601 — `YYYY-MM-DDTHH:mm:ss` |
| Pagination | `?page=0&size=20&sort=dateCreation,desc` |
| Error format | `{ "code": "ERROR_CODE", "message": "..." }` |

---

## 2. Authentication

### `POST /auth/login`
Authenticate user via LDAP and receive JWT tokens.

**Request:**
```json
{
  "username": "omar.benali",
  "password": "motdepasse"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "username": "omar.benali",
    "nom": "Benali",
    "prenom": "Omar",
    "role": "AGENT",
    "serviceId": null
  }
}
```

**Errors:** `401 INVALID_CREDENTIALS`, `403 ACCOUNT_DISABLED`

---

### `POST /auth/refresh`
Refresh access token.

**Request:** `{ "refreshToken": "eyJhbGci..." }`

**Response `200`:** `{ "accessToken": "...", "expiresIn": 28800 }`

---

### `POST /auth/logout`
Invalidate refresh token.

**Response `204`:** No content.

---

## 3. Visiteurs

### `GET /visiteurs/search`
Search visitors (members DB + local DB).

**Query params:** `q` (CIN, name, membership number), `type` (optional)

**Response `200`:**
```json
{
  "results": [
    {
      "id": 42,
      "type": "ADHERENT",
      "nom": "Alami",
      "prenom": "Hassan",
      "cin": "AB123456",
      "numeroAdhesion": "FH2-0042",
      "source": "MEMBERS_DB"
    }
  ]
}
```

**Roles:** AGENT, ADMIN

---

### `POST /visiteurs`
Create a new visitor profile (for EXTERNE type not found in DB).

**Request:**
```json
{
  "typeVisiteur": "EXTERNE",
  "nom": "Dupont",
  "prenom": "Jean",
  "cin": "XY987654",
  "telephone": "0600000000"
}
```

**Response `201`:** Visitor object with `id`.

**Roles:** AGENT

---

### `GET /visiteurs/{id}`
Get visitor details.

**Response `200`:** Full visitor object.

**Roles:** AGENT, FONCTIONNAIRE, RESPONSABLE, ADMIN

---

## 4. Visites

### `POST /visites`
Create a new visit and auto-assign a badge.

**Request:**
```json
{
  "visiteurId": 42,
  "objetVisiteId": 3,
  "notes": "Rendez-vous avec M. Tazi"
}
```

**Response `201`:**
```json
{
  "id": 101,
  "visiteur": { "id": 42, "nom": "Alami", "prenom": "Hassan", "type": "ADHERENT" },
  "objetVisite": { "id": 3, "libelleFr": "Dossier retraite", "service": { "id": 2, "nomFr": "Service Retraite" } },
  "fonctionnaire": { "id": 15, "nom": "Tazi", "prenom": "Mohammed" },
  "badge": { "id": 7, "numero": "B-007", "statut": "OCCUPE" },
  "statut": "EN_ATTENTE",
  "heureArrivee": "2025-08-15T09:32:00",
  "heureEntree": null,
  "heureSortie": null
}
```

**Errors:** `409 DUPLICATE_VISITE`, `409 BADGE_UNAVAILABLE`

**Roles:** AGENT

---

### `GET /visites`
List visits with filters.

**Query params:**
- `statut` — EN_ATTENTE | EN_COURS | REAFFECTEE | TERMINEE | CLOTUREE
- `serviceId` — filter by service
- `fonctionnaireId` — filter by fonctionnaire
- `dateDebut` / `dateFin` — date range
- `page`, `size`, `sort`

**Response `200`:**
```json
{
  "content": [ { ...visite } ],
  "totalElements": 45,
  "totalPages": 3,
  "page": 0,
  "size": 20
}
```

**Roles:** AGENT (today only), FONCTIONNAIRE (own), RESPONSABLE (service), ADMIN/DIRECTEUR (all)

---

### `GET /visites/{id}`
Get full visit details with history.

**Response `200`:** Full visite object including `historiqueStatuts[]`.

---

### `PATCH /visites/{id}/statut`
Update visit status.

**Request:**
```json
{ "statut": "EN_COURS" }
```

**Valid transitions:**
- `EN_ATTENTE → EN_COURS` (FONCTIONNAIRE, RESPONSABLE)
- `EN_COURS → TERMINEE` (FONCTIONNAIRE, RESPONSABLE)
- `EN_COURS → REAFFECTEE` (RESPONSABLE only)
- `TERMINEE → CLOTUREE` (AGENT)

**Errors:** `400 INVALID_TRANSITION`, `403 FORBIDDEN`

---

### `PATCH /visites/{id}/reaffecter`
Reassign visit to another fonctionnaire.

**Request:**
```json
{
  "nouveauFonctionnaireId": 18,
  "commentaire": "Spécialiste requis"
}
```

**Response `200`:** Updated visite.

**Roles:** RESPONSABLE

---

## 5. Pointage (Check-in / Check-out)

### `POST /pointage/entree`
Record entry time when badge is scanned at entrance.

**Request:**
```json
{ "badgeQrCode": "B-007" }
```

**Response `200`:**
```json
{
  "visiteId": 101,
  "heureEntree": "2025-08-15T09:35:12",
  "message": "Pointage entrée enregistré"
}
```

**Errors:** `404 BADGE_NOT_FOUND`, `409 BADGE_INVALID_OR_DUPLICATE`

**Roles:** Public (called from BadgeReader terminal — authenticated via machine token)

---

### `POST /pointage/sortie`
Record exit time when badge is scanned at exit.

**Request:**
```json
{ "badgeQrCode": "B-007" }
```

**Response `200`:**
```json
{
  "visiteId": 101,
  "heureSortie": "2025-08-15T11:22:45",
  "message": "Pointage sortie enregistré"
}
```

---

## 6. Badges

### `GET /badges`
List all badges.

**Query params:** `statut` (optional filter)

**Response `200`:**
```json
{
  "content": [
    { "id": 1, "numero": "B-001", "qrCode": "B-001", "statut": "DISPONIBLE" },
    { "id": 2, "numero": "B-002", "qrCode": "B-002", "statut": "OCCUPE", "visiteId": 101 }
  ]
}
```

**Roles:** AGENT, ADMIN

---

### `GET /badges/disponibles/count`
Get count of available badges.

**Response `200`:** `{ "count": 12 }`

---

### `POST /badges`
Register a new badge.

**Request:** `{ "numero": "B-025", "qrCode": "B-025" }`

**Response `201`:** Badge object.

**Roles:** ADMIN

---

### `POST /badges/{id}/restituer`
Mark badge as returned (physically handed back to agent).

**Request:** `{ "visiteId": 101 }`

**Response `200`:** `{ "badgeId": 7, "statut": "DISPONIBLE" }`

**Roles:** AGENT

---

## 7. Notifications

### `GET /notifications`
Get notifications for the authenticated user.

**Query params:** `lue` (true/false), `page`, `size`

**Response `200`:**
```json
{
  "content": [
    {
      "id": 55,
      "type": "VISITE_ARRIVEE",
      "message": "Nouveau visiteur : Hassan Alami (Badge B-007)",
      "visiteId": 101,
      "lue": false,
      "dateEnvoi": "2025-08-15T09:32:05"
    }
  ],
  "unreadCount": 3
}
```

---

### `PATCH /notifications/{id}/lire`
Mark notification as read.

**Response `204`:** No content.

---

### `PATCH /notifications/lire-tout`
Mark all notifications as read.

**Response `204`:** No content.

---

## 8. Statistiques & Rapports

### `GET /rapports/statistiques`
Get consolidated visit statistics.

**Query params:** `dateDebut`, `dateFin`, `serviceId` (optional)

**Response `200`:**
```json
{
  "totalVisites": 234,
  "visitesDuJour": 18,
  "visitesEnCours": 4,
  "dureeMoyenneMinutes": 22,
  "parService": [
    { "serviceId": 1, "nomFr": "Service RH", "total": 45, "enCours": 2 }
  ],
  "parJour": [
    { "date": "2025-08-15", "total": 18 }
  ],
  "parTypeVisiteur": [
    { "type": "ADHERENT", "total": 180 }
  ]
}
```

**Roles:** ADMIN, DIRECTEUR, RESPONSABLE (service scope only)

---

### `GET /rapports/export/csv`
Export visit history as CSV.

**Query params:** `dateDebut`, `dateFin`, `serviceId`

**Response:** `text/csv` file download.

**Roles:** AGENT (day only), RESPONSABLE (service), ADMIN, DIRECTEUR

---

### `GET /rapports/export/pdf`
Export visit report as PDF.

**Response:** `application/pdf` file download.

**Roles:** RESPONSABLE, ADMIN, DIRECTEUR

---

## 9. Administration

### `GET /admin/utilisateurs`
List all users.

**Roles:** ADMIN

---

### `POST /admin/utilisateurs`
Create user account (must match AD account).

**Request:**
```json
{
  "username": "sara.idrissi",
  "nom": "Idrissi",
  "prenom": "Sara",
  "email": "s.idrissi@fh2.ma",
  "role": "FONCTIONNAIRE",
  "serviceId": 3
}
```

**Response `201`:** User object.

---

### `PUT /admin/utilisateurs/{id}`
Update user (role, service, active status).

---

### `DELETE /admin/utilisateurs/{id}`
Soft-delete user (sets `actif = false`).

**Response `204`:** No content.

---

### `GET /admin/services`
List all services. **Roles:** ADMIN

### `POST /admin/services`
Create service. **Roles:** ADMIN

### `PUT /admin/services/{id}`
Update service. **Roles:** ADMIN

---

### `GET /admin/objets-visite`
List all visit objects with their algorithm configuration.

### `POST /admin/objets-visite`
Create visit object.

**Request:**
```json
{
  "code": "RETRAITE",
  "libelleFr": "Dossier retraite",
  "libelleAr": "ملف التقاعد",
  "serviceId": 2,
  "algorithme": "SEQUENTIEL"
}
```

### `PUT /admin/objets-visite/{id}/algorithme`
Change assignment algorithm for a visit object.

**Request:** `{ "algorithme": "PRIORITE" }`

---

### `PUT /admin/objets-visite/{id}/affectations`
Set fonctionnaire priority order for a visit object.

**Request:**
```json
{
  "affectations": [
    { "fonctionnaireId": 15, "priorite": 1 },
    { "fonctionnaireId": 16, "priorite": 2 },
    { "fonctionnaireId": 17, "priorite": 3 }
  ]
}
```

---

## 10. Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `TOKEN_EXPIRED` | 401 | JWT has expired |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `VISITE_NOT_FOUND` | 404 | Visit ID doesn't exist |
| `BADGE_NOT_FOUND` | 404 | Badge QR not found |
| `VISITEUR_NOT_FOUND` | 404 | Visitor ID not found |
| `DUPLICATE_VISITE` | 409 | Visitor already has active visit |
| `BADGE_UNAVAILABLE` | 409 | No badges available |
| `BADGE_INVALID_OR_DUPLICATE` | 409 | Badge scan rejected (invalid/already used) |
| `INVALID_TRANSITION` | 400 | Invalid visit status transition |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
