# Product Requirements Document (PRD)
# Solution Digitale — Gestion du Service d'Accueil
### Fondation Hassan II des Œuvres Sociales — Rabat

---

## 1. App Overview

| Field | Value |
|-------|-------|
| **Project Name** | Service d'Accueil Digital |
| **Organization** | Fondation Hassan II des Œuvres Sociales des Agents d'Autorité et des Fonctionnaires du Ministère de l'Intérieur |
| **Version** | 1.0 |
| **Date** | 2025 |
| **Language** | French (primary) + Arabic (text support) |

### Description

A web-based visitor management system that digitalizes and centralizes the entire reception process at the Fondation — from visitor identification and badge assignment, through service notification and visit processing, to badge restitution and archiving.

### Tagline

> *"De l'accueil à la clôture — une gestion traçable, sécurisée et en temps réel."*

### Problem Statement

The current reception process is entirely manual:
- Visitor information is collected by hand
- No systematic traceability of visits
- Service notifications are made verbally
- No real-time visibility on visitor flows
- High risk of human error (missed entries, duplicate records)

---

## 2. Target Audience & User Personas

### Persona 1 — Agent d'Accueil
- **Profile:** Reception desk staff, 1–2 people on duty
- **Goals:** Quickly identify visitors, assign badges, route them to the right service
- **Pain points:** Manual lookup is slow; no alert when a badge isn't returned
- **Technical level:** Basic computer user

### Persona 2 — Fonctionnaire (Civil Servant / Employee)
- **Profile:** ~30 employees across 6 services, desk-based
- **Goals:** Know when a visitor is assigned to them, process the request, close the visit
- **Pain points:** Currently notified verbally, can miss arrivals
- **Technical level:** Basic to intermediate

### Persona 3 — Responsable de Service (Service Manager)
- **Profile:** 6 service heads, supervise their team's visit queue
- **Goals:** Monitor visits, reassign if needed, close visits on behalf of agents
- **Pain points:** No dashboard visibility; can't see their service's workload at a glance
- **Technical level:** Intermediate

### Persona 4 — Administrateur Système
- **Profile:** 1 IT administrator
- **Goals:** Manage users, roles, badges, services, system configuration
- **Pain points:** No centralized admin panel currently
- **Technical level:** Advanced

### Persona 5 — Directeur
- **Profile:** 1 director, executive access
- **Goals:** View consolidated statistics, export reports, monitor service performance
- **Pain points:** No data visibility, no reports
- **Technical level:** Basic (read-only dashboard)

---

## 3. Key Features (Prioritized)

### Priority 1 — Core (MVP)

| # | Feature | Description |
|---|---------|-------------|
| F01 | **Authentication** | LDAP/Active Directory login with role-based access |
| F02 | **Visitor Identification** | Search by CIN, membership number, name, or QR code |
| F03 | **Visit Registration** | Create visit record with visitor identity, motif, and service |
| F04 | **Badge Assignment** | Assign a pre-printed QR badge; update badge status to Occupé |
| F05 | **Entry Check-in** | Scan badge at entry; record exact entry timestamp |
| F06 | **Real-time Notifications** | Push in-app WebSocket alerts to fonctionnaire and chef de service |
| F07 | **Visit Processing** | Fonctionnaire marks visit as received, processes, closes |
| F08 | **Visit Reassignment** | Chef de service reassigns visitor to another fonctionnaire/service |
| F09 | **Exit Check-out** | Scan badge at exit; record exact exit timestamp |
| F10 | **Badge Restitution** | Agent scans returned badge; status → Disponible; visit archived |

### Priority 2 — Important

| # | Feature | Description |
|---|---------|-------------|
| F11 | **Badge Overdue Alert** | Alert sent to agent and admin if badge not returned 45 min after closure |
| F12 | **Visitor Queue Dashboard** | Live view of all active visits per service |
| F13 | **Statistics & Reports** | Aggregated visit data: counts, durations, service load |
| F14 | **CSV / PDF Export** | Export visit history and statistics |
| F15 | **Assignment Algorithms** | Sequential (round-robin) and Priority modes per visit object |

### Priority 3 — Nice to Have

| # | Feature | Description |
|---|---------|-------------|
| F16 | **System Configuration** | Admin manages services, badges, users, roles |
| F17 | **Backup & Restore** | Admin-triggered database backup |
| F18 | **Audit Log** | Track all status changes and user actions |

---

## 4. Visitor Types

| Type | Identification Method |
|------|-----------------------|
| Adhérent | CIN or membership card (numéro d'adhésion) |
| Conjoint | CIN or membership number of principal member |
| Enfant | CIN or membership number of principal member |
| Partenaire | Direct search in database |
| Médecin | Direct search in database |
| VIP | Direct search in database (adhérent with VIP flag) |
| Externe | Manual data entry by agent |

---

## 5. Badge Lifecycle

```
Disponible → [Agent assigns] → Occupé → [Fonctionnaire closes] → Prêt à restituer → [Agent scans return] → Restitué → Disponible
```

| Status | Description | Triggered By |
|--------|-------------|-------------|
| `DISPONIBLE` | Free, ready to assign | System (initial / after restitution) |
| `OCCUPE` | Assigned to active visit | Agent d'accueil |
| `PRET_A_RESTITUER` | Visit closed, awaiting physical return | Fonctionnaire / Chef de service |
| `RESTITUE` | Physically returned; auto-resets to DISPONIBLE | Agent d'accueil |

---

## 6. Visit Lifecycle

```
En attente → En cours → Terminée → Clôturée
                ↓
           Réaffectée → En attente (new assignment)
```

| Status | Description | Triggered By |
|--------|-------------|-------------|
| `EN_ATTENTE` | Visitor arrived, in queue | Agent d'accueil |
| `EN_COURS` | Being processed by fonctionnaire | Fonctionnaire |
| `REAFFECTEE` | Transferred to another fonctionnaire/service | Responsable de service |
| `TERMINEE` | Processing done, badge not yet returned | Fonctionnaire |
| `CLOTUREE` | Badge returned, visit archived | Agent d'accueil |

---

## 7. Assignment Algorithms

### Sequential (Round-Robin)
- Visitors distributed evenly across available fonctionnaires
- If all are busy, assigned to the fonctionnaire with the shortest queue
- Configurable per visit object type

### Priority
- Each service defines a ranked list of fonctionnaires
- If Fonctionnaire A is absent/unavailable, falls back to B, then C
- Respects specialization and hierarchy

> Both algorithms are configurable per `objetVisite` by the Administrator.

---

## 8. User Roles & Permissions Summary

| Permission | Agent | Fonctionnaire | Responsable | Admin | Directeur |
|-----------|-------|---------------|-------------|-------|-----------|
| Search visitor | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create/edit visit | ✅ | ❌ | ❌ | ✅ | ❌ |
| Assign/restitute badge | ✅ | ❌ | ❌ | ✅ | ❌ |
| View own service queue | ❌ | ✅ | ✅ | ✅ | ❌ |
| Mark visit received/closed | ❌ | ✅ | ✅ | ✅ | ❌ |
| Reassign visit | ❌ | ❌ | ✅ | ✅ | ❌ |
| View global stats | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export reports | ❌ (day only) | ❌ | ✅ (service) | ✅ | ✅ |
| Manage users/services | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 9. Business Rules

1. **No duplicate visits** — a visitor cannot have two active visits at the same time
2. **Badge exclusivity** — one badge = one visitor at a time
3. **Auto-alert** — badge not returned within 45 min of closure → alert to agent + admin
4. **Notification on registration** — simultaneous push to chef de service + fonctionnaire
5. **Algorithm exclusivity** — each `objetVisite` uses exactly one algorithm at a time
6. **Badge reset** — badge status returns to `DISPONIBLE` only after physical restitution by agent

---

## 10. Platform & Constraints

| Constraint | Detail |
|-----------|--------|
| Platform | Web only (desktop browser) |
| Hosting | On-premise (Fondation internal servers) |
| Authentication | Active Directory / LDAP |
| Database | Microsoft SQL Server |
| Badge Technology | Pre-printed QR codes (USB keyboard-wedge scanner) |
| Language | French (primary), Arabic (text support, RTL where needed) |
| Concurrent Users | ~40 (2 agents, 30 fonctionnaires, 6 chefs, 1 admin, 1 directeur) |

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Visit registration time | < 2 minutes per visitor |
| Notification delivery time | < 3 seconds after badge assignment |
| Badge overdue detection | 100% of cases within 45 min |
| Zero paper-based records | From day 1 of deployment |
| System availability | 99%+ during working hours |
| Export generation time | < 10 seconds for daily report |

---

## 12. Assumptions

- All workstations have a modern browser (Chrome/Edge)
- QR scanners are USB HID (keyboard-wedge) devices, already procured
- Active Directory is accessible from the application server
- SQL Server instance is accessible on the internal network
- Fonctionnaires keep the application open during working hours

---

## 13. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LDAP connectivity issue | Medium | High | Fallback local admin account |
| Badge not scanned at entry | Medium | Medium | Manual entry timestamp override by agent |
| SQL Server access permissions | Low | High | DBA coordination before dev starts |
| User resistance to new system | Medium | Medium | Training sessions + intuitive UI |
| Badge inventory shortage | Low | High | Alert when < 5 badges available |
