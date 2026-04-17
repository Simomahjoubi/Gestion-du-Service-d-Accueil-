# DevOps Documentation
# On-Premise Deployment — Docker + Docker Compose + Nginx

---

## 1. Infrastructure Overview

```
┌────────────────────────────────────────────────────────┐
│                   On-Premise Server                    │
│                                                        │
│  ┌──────────┐     ┌───────────┐     ┌───────────────┐ │
│  │  Nginx   │────►│  React    │     │  Spring Boot  │ │
│  │ :80/:443 │     │  (Vite)   │     │    :8080      │ │
│  │          │────►│  :3000    │     │               │ │
│  │ Reverse  │     └───────────┘     └───────┬───────┘ │
│  │  Proxy   │                               │         │
│  │          │◄──────────────────────────────┘         │
│  └──────────┘                                         │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │          Microsoft SQL Server (existing)       │   │
│  │   FH2_ACCUEIL_DB    |    FH2_MEMBERS_DB        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │        Active Directory / LDAP Server          │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure for Deployment

```
service-accueil/
├── backend/                    # Spring Boot project
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                   # React + Vite project
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.production
```

---

## 3. Dockerfiles

### 3.1 Backend — `backend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

---

### 3.2 Frontend — `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Nginx Configuration

### `nginx/nginx.conf` — Main reverse proxy

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    upstream backend {
        server backend:8080;
        keepalive 32;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name accueil.fh2.ma;

        # Redirect HTTP to HTTPS in production
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name accueil.fh2.ma;

        ssl_certificate     /etc/nginx/certs/fh2.crt;
        ssl_certificate_key /etc/nginx/certs/fh2.key;
        ssl_protocols       TLSv1.2 TLSv1.3;

        # API routes → Spring Boot
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 60s;
            proxy_connect_timeout 10s;
        }

        # WebSocket → Spring Boot (STOMP/SockJS)
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 3600s;
        }

        # Frontend (React SPA)
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

---

## 5. Docker Compose

### `docker-compose.yml` — Development

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_USER_READONLY=${DB_USER_READONLY}
      - DB_PASSWORD_READONLY=${DB_PASSWORD_READONLY}
      - LDAP_HOST=${LDAP_HOST}
      - LDAP_BASE_DN=${LDAP_BASE_DN}
      - LDAP_DOMAIN=${LDAP_DOMAIN}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - accueil-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8080
        VITE_WS_BASE_URL: http://localhost:8080
    ports:
      - "3000:80"
    networks:
      - accueil-network
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - backend
      - frontend
    networks:
      - accueil-network
    restart: unless-stopped

networks:
  accueil-network:
    driver: bridge
```

---

## 6. Environment Variables

### `.env.production`

```env
# Database — FH2_ACCUEIL_DB
DB_HOST=192.168.1.100
DB_USER=sa_accueil
DB_PASSWORD=<strong_password>

# Database — FH2_MEMBERS_DB (read-only)
DB_USER_READONLY=sa_members_ro
DB_PASSWORD_READONLY=<strong_password>

# LDAP / Active Directory
LDAP_HOST=192.168.1.10
LDAP_BASE_DN=DC=fh2,DC=ma
LDAP_DOMAIN=fh2.ma

# JWT
JWT_SECRET=<random_256bit_base64_string>

# Frontend build
VITE_API_BASE_URL=https://accueil.fh2.ma
VITE_WS_BASE_URL=https://accueil.fh2.ma
```

> **Never commit `.env.production` to version control.** Use `.env.example` as a template.

---

## 7. Deployment Steps

### First Deployment

```bash
# 1. Clone repository on server
git clone <repo-url> service-accueil
cd service-accueil

# 2. Copy and configure environment file
cp .env.example .env.production
nano .env.production   # Fill in all values

# 3. Build and start containers
docker-compose -f docker-compose.yml --env-file .env.production up -d --build

# 4. Verify containers are running
docker-compose ps

# 5. Check backend health
curl http://localhost:8080/actuator/health

# 6. Check logs
docker-compose logs -f backend
```

### Update / Redeploy

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (zero-downtime: backend first, then frontend)
docker-compose -f docker-compose.yml --env-file .env.production up -d --build --no-deps backend
docker-compose -f docker-compose.yml --env-file .env.production up -d --build --no-deps frontend
```

---

## 8. Monitoring

### Spring Boot Actuator Endpoints

| Endpoint | Purpose |
|---------|---------|
| `/actuator/health` | Service health (DB, LDAP) |
| `/actuator/metrics` | JVM metrics, HTTP request counts |
| `/actuator/info` | App version, build info |

> Actuator endpoints are accessible only from `localhost` in production (Nginx does not proxy `/actuator`).

### Log Management

```yaml
# application-prod.yml
logging:
  level:
    root: WARN
    ma.fondation.accueil: INFO
    org.springframework.security: WARN
  file:
    name: /app/logs/accueil.log
  logback:
    rollingpolicy:
      max-file-size: 50MB
      max-history: 30
```

---

## 9. Database Backup

```bash
# Automated daily backup script (SQL Server)
# /opt/scripts/backup-accueil.sh
sqlcmd -S $DB_HOST -U $DB_USER -P $DB_PASSWORD \
  -Q "BACKUP DATABASE FH2_ACCUEIL_DB TO DISK='/backups/accueil_$(date +%Y%m%d).bak'"

# Schedule via cron (every day at 2:00 AM)
# crontab -e
0 2 * * * /opt/scripts/backup-accueil.sh
```

---

## 10. Security Checklist

- [ ] HTTPS enforced (TLS 1.2+) with internal certificate
- [ ] `.env.production` not in version control
- [ ] SQL Server users have minimum required permissions
- [ ] Actuator endpoints blocked from external access
- [ ] JWT secret is a strong random string (256-bit+)
- [ ] Docker containers run as non-root user
- [ ] Nginx hides server version headers
- [ ] CORS restricted to internal domain only
