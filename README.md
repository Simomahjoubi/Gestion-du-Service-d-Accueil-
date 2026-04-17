# Digital Reception Management System (DRMS)
### Solution Digitale pour la Gestion du Service d’Accueil — Fondation Hassan II

This repository contains the full documentation and source code for the Digital Reception Management System. The project aims to automate visitor tracking, badge management, and service assignments through a secure, role-based web platform.

## 📂 Project Structure

- `/backend`: Spring Boot 3 application (Java 17, SQL Server, LDAP).
- `/frontend`: React 18 application (TypeScript, Vite, Tailwind CSS).
- `/docs`: Full technical specifications and architectural blueprints.

## 📖 Technical Documentation

| Document | Description |
| :--- | :--- |
| [PRD](./docs/prd.md) | Product Requirements & Feature Priorities. |
| [Frontend](./docs/frontend.md) | React architecture, UI components, and state management. |
| [Backend](./docs/backend.md) | Spring Boot Clean Architecture and package structure. |
| [API Documentation](./docs/api.md) | RESTful endpoints and WebSocket specifications. |
| [Database Schema](./docs/database-schema.md) | SQL Server entities and relationships. |
| [User Flow](./docs/user-flow.md) | Mermaid diagrams for visitor and staff journeys. |
| [Third-Party Libraries](./docs/third-party-libraries.md) | Full list of dependencies and licenses. |
| [DevOps](./docs/devops.md) | CI/CD, hosting, and monitoring strategy. |
| [Testing Plan](./docs/testing-plan.md) | Unit, integration, and E2E testing strategy. |

## 🚀 Getting Started

### Prerequisites
- Java 17 LTS
- Node.js 18+
- Microsoft SQL Server
- LDAP/Active Directory Access

### Backend Setup
1. Navigate to `/backend`.
2. Configure `src/main/resources/application-dev.yml` with your database and LDAP credentials.
3. Run `./mvnw spring-boot:run`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Run `npm install`.
3. Configure `.env.local` with the API URL.
4. Run `npm run dev`.

## 🛠 Features Included
- **Role-Based Access Control (RBAC):** Agent, Fonctionnaire, Responsable, Admin, Directeur.
- **Smart Assignment:** Sequential and Priority algorithms for visitor flow.
- **Real-time Notifications:** WebSocket-based alerts for staff members.
- **Badge Tracking:** Automated lifecycle management for physical QR badges.
- **Reporting:** Exportable statistics (PDF/CSV) for executive review.
