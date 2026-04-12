# Third-Party Libraries
# Service d'Accueil — Backend + Frontend

---

## 1. Backend Libraries (Maven / Spring Boot)

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **spring-boot-starter-web** | 3.x | REST API, embedded Tomcat | Apache 2.0 |
| **spring-boot-starter-security** | 3.x | Authentication & authorization | Apache 2.0 |
| **spring-boot-starter-data-jpa** | 3.x | JPA / Hibernate ORM | Apache 2.0 |
| **spring-boot-starter-websocket** | 3.x | WebSocket / STOMP for notifications | Apache 2.0 |
| **spring-boot-starter-validation** | 3.x | Bean validation (@Valid, @NotNull) | Apache 2.0 |
| **spring-boot-starter-actuator** | 3.x | Health checks, metrics | Apache 2.0 |
| **spring-ldap-core** | 3.x | LDAP / Active Directory integration | Apache 2.0 |
| **spring-security-ldap** | 6.x | LDAP authentication provider | Apache 2.0 |
| **mssql-jdbc** | 12.x | Microsoft SQL Server JDBC driver | MIT |
| **lombok** | 1.18.x | Boilerplate reduction (@Getter, @Builder) | MIT |
| **mapstruct** | 1.5.x | Compile-time DTO ↔ Entity mapping | Apache 2.0 |
| **springdoc-openapi-starter-webmvc-ui** | 2.x | Swagger UI / OpenAPI 3 docs | Apache 2.0 |
| **jjwt-api / jjwt-impl / jjwt-jackson** | 0.12.x | JWT token creation and validation | Apache 2.0 |
| **flyway-core** | 9.x | Database schema migrations | Apache 2.0 |
| **flyway-sqlserver** | 9.x | SQL Server dialect for Flyway | Apache 2.0 |

### Testing Libraries (Backend)

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **spring-boot-starter-test** | 3.x | JUnit 5, MockMvc, Spring context | Apache 2.0 |
| **mockito-core** | 5.x | Mocking for unit tests | MIT |
| **h2** | 2.x | In-memory DB for integration tests | EPL 2.0 |
| **assertj-core** | 3.x | Fluent assertion library | Apache 2.0 |

### `pom.xml` Dependencies Excerpt

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- LDAP -->
    <dependency>
        <groupId>org.springframework.ldap</groupId>
        <artifactId>spring-ldap-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-ldap</artifactId>
    </dependency>

    <!-- SQL Server -->
    <dependency>
        <groupId>com.microsoft.sqlserver</groupId>
        <artifactId>mssql-jdbc</artifactId>
        <version>12.4.2.jre17</version>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok + MapStruct -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>

    <!-- Flyway -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-sqlserver</artifactId>
    </dependency>

    <!-- OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 2. Frontend Libraries (npm)

### Core

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **react** | 18.x | UI framework | MIT |
| **react-dom** | 18.x | DOM rendering | MIT |
| **typescript** | 5.x | Type safety | Apache 2.0 |
| **vite** | 5.x | Build tool & dev server | MIT |

### UI & Styling

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **tailwindcss** | 3.x | Utility-first CSS | MIT |
| **@shadcn/ui** (components) | latest | Design system (Radix + Tailwind) | MIT |
| **@radix-ui/react-*** | latest | Accessible UI primitives (used by shadcn) | MIT |
| **lucide-react** | latest | Icon library | ISC |
| **class-variance-authority** | latest | Component variant styling | Apache 2.0 |
| **clsx** | latest | Conditional CSS class merging | MIT |
| **tailwind-merge** | latest | Tailwind class conflict resolution | MIT |

### Routing & State

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **react-router-dom** | 6.x | Client-side routing | MIT |
| **zustand** | 4.x | Global state management | MIT |
| **@tanstack/react-query** | 5.x | Server state + caching | MIT |

### Forms & Validation

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **react-hook-form** | 7.x | Form state management | MIT |
| **zod** | 3.x | Schema validation | MIT |
| **@hookform/resolvers** | 3.x | Zod adapter for React Hook Form | MIT |

### HTTP & WebSocket

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **axios** | 1.x | HTTP client with interceptors | MIT |
| **sockjs-client** | 1.x | WebSocket with fallback | MIT |
| **@stomp/stompjs** | 7.x | STOMP protocol over WebSocket | Apache 2.0 |

### Utilities

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **html5-qrcode** | 2.x | QR scanner (USB keyboard-wedge hook) | Apache 2.0 |
| **jspdf** | 2.x | Client-side PDF generation | MIT |
| **jspdf-autotable** | 3.x | Table support for jsPDF | MIT |
| **papaparse** | 5.x | CSV parsing and generation | MIT |
| **date-fns** | 3.x | Date formatting and manipulation | MIT |
| **recharts** | 2.x | Charts for statistics dashboard | MIT |
| **i18next** | 23.x | Internationalization framework | MIT |
| **react-i18next** | 13.x | React bindings for i18next | MIT |
| **sonner** | latest | Toast notification system | MIT |
| **@tanstack/react-virtual** | 3.x | List virtualization | MIT |

### Testing

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| **vitest** | 1.x | Unit test runner | MIT |
| **@testing-library/react** | 14.x | React component testing | MIT |
| **@testing-library/user-event** | 14.x | User interaction simulation | MIT |
| **@testing-library/jest-dom** | 6.x | DOM assertion matchers | MIT |
| **playwright** | 1.x | End-to-end testing | Apache 2.0 |
| **msw** | 2.x | API mocking for tests | MIT |

### `package.json` Dependencies Excerpt

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.350.0",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.0",
    "html5-qrcode": "^2.3.0",
    "jspdf": "^2.5.0",
    "jspdf-autotable": "^3.8.0",
    "papaparse": "^5.4.0",
    "date-fns": "^3.3.0",
    "recharts": "^2.12.0",
    "i18next": "^23.10.0",
    "react-i18next": "^14.1.0",
    "sonner": "^1.4.0",
    "@tanstack/react-virtual": "^3.2.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@playwright/test": "^1.42.0",
    "msw": "^2.2.0"
  }
}
```
