# Service d'Accueil Digital
### Fondation Hassan II des Œuvres Sociales — Rabat

A web-based visitor management system that replaces manual reception procedures with a centralized, real-time digital solution.

---

## Architecture

```
service-acceuil/
├── backend/          # Spring Boot 3 (Java 17) — REST API + WebSocket
├── frontend/         # React 18 + Vite + TypeScript
├── nginx/            # Reverse proxy configuration
├── docs/             # All project documentation
├── docker-compose.yml
└── .env.example
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3, Spring Security + LDAP, Spring Data JPA |
| Database | Microsoft SQL Server |
| Authentication | Active Directory / LDAP + JWT |
| Real-time | Spring WebSocket (STOMP) + SockJS |
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand + TanStack Query |
| Deployment | Docker + Docker Compose + Nginx |

---

## Prerequisites

- Docker & Docker Compose
- Access to SQL Server instance (FH2_ACCUEIL_DB + FH2_MEMBERS_DB)
- Access to Active Directory / LDAP server
- Node.js 20+ (for local frontend dev)
- Java 17+ & Maven 3.9+ (for local backend dev)

---

## Quick Start (Docker)

```bash
# 1. Configure environment
cp .env.example .env.production
# Edit .env.production with your SQL Server, LDAP, and JWT settings

# 2. Build and start all services
docker-compose --env-file .env.production up -d --build

# 3. Access the application
# Frontend: http://localhost (via Nginx)
# Backend API: http://localhost/api
# Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## Local Development

### Backend

```bash
cd backend
cp .env.example .env.local
# Fill in DB and LDAP connection details
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# API available at: http://localhost:8080/api
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:8080
npm run dev
# App available at: http://localhost:5173
```

---

## Documentation

| Document | Description |
|---------|-------------|
| [docs/prd.md](docs/prd.md) | Product Requirements Document |
| [docs/backend.md](docs/backend.md) | Spring Boot architecture & patterns |
| [docs/frontend.md](docs/frontend.md) | React architecture & components |
| [docs/database-schema.md](docs/database-schema.md) | SQL Server schema & relationships |
| [docs/api.md](docs/api.md) | REST API endpoints reference |
| [docs/user-flow.md](docs/user-flow.md) | Mermaid user flow diagrams |
| [docs/state-management.md](docs/state-management.md) | Zustand + TanStack Query patterns |
| [docs/devops.md](docs/devops.md) | Docker deployment guide |
| [docs/testing-plan.md](docs/testing-plan.md) | Testing strategy & examples |
| [docs/performance-optimization.md](docs/performance-optimization.md) | Performance patterns |
| [docs/code-documentation.md](docs/code-documentation.md) | Javadoc/JSDoc standards |
| [docs/third-party-libraries.md](docs/third-party-libraries.md) | All dependencies with versions |

---

## User Roles

| Role | Access |
|------|--------|
| Agent d'accueil | Visitor registration, badge assignment/restitution |
| Fonctionnaire | Visit processing and closure |
| Responsable de service | Reassignment, service dashboard, reports |
| Administrateur | Full system configuration |
| Directeur | Global statistics and consolidated reports |

---

## Running Tests

```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm run test

# E2E
cd frontend && npm run test:e2e
```

---

## Contact

**FH2 Service Informatique** — si@fh2.ma
