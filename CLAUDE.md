# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DRMS** (Digital Reception Management System) — a full-stack visitor management system for Fondation Hassan II des Œuvres Sociales. Automates visitor check-in, badge assignment, and real-time notifications across 5 role-based user types.

## Commands

### Backend (Spring Boot 3, from `backend/`)
```bash
mvn clean package          # Build JAR
mvn spring-boot:run        # Run locally (http://localhost:8080/api)
mvn test                   # Run all tests
mvn test -Dtest=ClassName  # Run a single test class
```
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Frontend (React + Vite, from `frontend/`)
```bash
npm install       # Install dependencies
npm run dev       # Dev server (http://localhost:5173)
npm run build     # Production build
npm run lint      # ESLint
```

### Full Stack (from project root)
```bash
docker-compose up --build   # Start all services (frontend:80, backend:8080, db:1433)
docker-compose down         # Stop all services
docker-compose logs backend # View backend logs
```

## Architecture

### Backend — Clean Architecture (strict one-way dependency)

```
presentation/  →  application/  →  domain/  ←  infrastructure/
(Controllers)     (Services,DTOs)  (Entities,  (JPA Repos, Security,
                                   Enums)       Schedulers, WebSocket)
```

Package root: `ma.fondation.accueil`

- **domain/** — Pure Java, no Spring. Entities: `Visite`, `Visiteur`, `Badge`, `Utilisateur`, `Service`, `Notification`, `AuditLog`. Enums: `StatutBadge`, `StatutVisite`, `RoleUtilisateur`, `AlgorithmeAffectation`.
- **application/service/** — Business logic: `VisiteService`, `BadgeService`, `AffectationService`, `NotificationService`, `RapportService`.
- **infrastructure/** — Spring integration: JPA repositories, JWT+LDAP security, STOMP WebSocket config, `BadgeAlertScheduler`.
- **presentation/controller/** — REST endpoints: `AdminController`, `VisiteController`, `VisiteurController`, `ServiceController`.

### Frontend — Feature/Role-based structure

- **pages/** — Views per role: `Agent/`, `Fonctionnaire/`, `Responsable/`, `Admin/`, `Directeur/`
- **services/** — Axios API clients per domain (visiteService, badgeService, etc.)
- **stores/** — Zustand global state: `authStore` (JWT token), `notificationStore`
- **hooks/** — `useAuth`, `useVisites`, `useWebSocket`
- **components/** — Atomic Design: `ui/` (shadcn), `atoms/`, `molecules/`, `organisms/`

### Real-time Flow
WebSocket STOMP over SockJS. Frontend subscribes to `/topic/notifications`. Backend pushes on visit/badge status changes.

### Auth Flow
LDAP credentials → JWT token → `Authorization: Bearer <token>` on all API calls. Roles: `Agent`, `Fonctionnaire`, `Responsable`, `Administrateur`, `Directeur`.

## Key Configuration

**Backend** (`backend/src/main/resources/application.yml`):
- API context path: `/api`
- Hibernate `ddl-auto: update` (auto-manages schema in dev)
- Flyway is **disabled** (`spring.flyway.enabled: false`) — schema managed by Hibernate

**Frontend** — create `frontend/.env.local` for local dev:
```
VITE_API_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080
```

**Docker Compose env vars** (SQL Server):
- `SPRING_DATASOURCE_URL=jdbc:sqlserver://db:1433;databaseName=FH2_ACCUEIL_DB;encrypt=true;trustServerCertificate=true`
- `SPRING_DATASOURCE_USERNAME=sa` / `SPRING_DATASOURCE_PASSWORD=YourStrong@Passw0rd`

## Domain Concepts

| Entity | Lifecycle / States |
|--------|--------------------|
| `Visite` | `ENREGISTRÉE → EN_COURS → CLÔTURÉE` |
| `Badge` | `LIBRE → OCCUPÉ → RETOURNÉ → ENDOMMAGÉ` |
| `AlgorithmeAffectation` | Sequential or Priority-based visitor-to-agent routing |

**5 roles** control page access and API authorization (`@PreAuthorize` annotations on controllers). Each role has a dedicated layout in `frontend/src/layouts/`.

## Tech Stack

| Layer | Key Technologies |
|-------|-----------------|
| Backend | Java 17, Spring Boot 3.2.4, Spring Security + JWT, Spring Data JPA, SQL Server |
| Frontend | React 18, TypeScript, Vite, Zustand, TanStack Query, shadcn/ui, Tailwind CSS |
| Real-time | STOMP + SockJS (in-memory broker, no external MQ) |
| Infrastructure | Docker Compose, Nginx (SPA routing), SQL Server 2022 |
| Utilities | Lombok, MapStruct, SpringDoc OpenAPI |
