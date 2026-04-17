# Backend Documentation
# Spring Boot 3 — Clean Architecture

---

## 1. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17 LTS | Language |
| Spring Boot | 3.x | Application framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring LDAP | 3.x | Active Directory integration |
| Spring Data JPA | 3.x | ORM / Database access |
| Hibernate | 6.x | JPA implementation |
| Spring WebSocket | 3.x | Real-time notifications (STOMP) |
| Microsoft SQL Server JDBC | 12.x | SQL Server driver |
| Lombok | 1.18.x | Boilerplate reduction |
| MapStruct | 1.5.x | DTO ↔ Entity mapping |
| SpringDoc OpenAPI | 2.x | Swagger UI / API docs |
| Maven | 3.9.x | Build tool |
| Docker | latest | Containerization |

---

## 2. Clean Architecture Overview

The backend follows a **Layered Clean Architecture** with strict dependency direction:

```
┌────────────────────────────────────────────────┐
│               Presentation Layer                │
│        (REST Controllers, WebSocket)            │
├────────────────────────────────────────────────┤
│               Application Layer                 │
│         (Service classes, Use Cases)            │
├────────────────────────────────────────────────┤
│               Domain Layer                      │
│      (Entities, Enums, Business Rules)          │
├────────────────────────────────────────────────┤
│            Infrastructure Layer                 │
│   (Repositories, LDAP, WebSocket, Scheduler)   │
└────────────────────────────────────────────────┘
```

**Dependency Rule:** Outer layers depend on inner layers. Domain has zero dependencies on Spring or infrastructure.

---

## 3. Package Structure

```
backend/
└── src/
    └── main/
        ├── java/
        │   └── ma/fondation/accueil/
        │       ├── AccueilApplication.java          # Spring Boot entry point
        │       │
        │       ├── domain/                          # Domain Layer (pure Java, no Spring)
        │       │   ├── model/
        │       │   │   ├── Visite.java
        │       │   │   ├── Visiteur.java
        │       │   │   ├── Badge.java
        │       │   │   ├── Utilisateur.java
        │       │   │   ├── Service.java
        │       │   │   ├── ObjetVisite.java
        │       │   │   ├── Notification.java
        │       │   │   ├── AffectationFonctionnaire.java
        │       │   │   └── AuditLog.java
        │       │   ├── enums/
        │       │   │   ├── StatutBadge.java
        │       │   │   ├── StatutVisite.java
        │       │   │   ├── TypeVisiteur.java
        │       │   │   ├── RoleUtilisateur.java
        │       │   │   └── AlgorithmeAffectation.java
        │       │   └── exception/
        │       │       ├── VisiteNotFoundException.java
        │       │       ├── BadgeNotFoundException.java
        │       │       ├── BadgeUnavailableException.java
        │       │       ├── DuplicateVisiteException.java
        │       │       └── UnauthorizedActionException.java
        │       │
        │       ├── application/                     # Application Layer
        │       │   ├── service/
        │       │   │   ├── VisiteService.java
        │       │   │   ├── VisiteurService.java
        │       │   │   ├── BadgeService.java
        │       │   │   ├── NotificationService.java
        │       │   │   ├── AffectationService.java
        │       │   │   ├── RapportService.java
        │       │   │   └── UtilisateurService.java
        │       │   ├── dto/
        │       │   │   ├── request/
        │       │   │   │   ├── CreateVisiteRequest.java
        │       │   │   │   ├── UpdateVisiteStatutRequest.java
        │       │   │   │   ├── ReaffecterVisiteRequest.java
        │       │   │   │   ├── PointageRequest.java
        │       │   │   │   └── CreateUtilisateurRequest.java
        │       │   │   └── response/
        │       │   │       ├── VisiteResponse.java
        │       │   │       ├── VisiteurResponse.java
        │       │   │       ├── BadgeResponse.java
        │       │   │       ├── NotificationResponse.java
        │       │   │       ├── StatistiquesResponse.java
        │       │   │       └── PageResponse.java
        │       │   └── mapper/
        │       │       ├── VisiteMapper.java
        │       │       ├── VisiteurMapper.java
        │       │       ├── BadgeMapper.java
        │       │       └── NotificationMapper.java
        │       │
        │       ├── infrastructure/                  # Infrastructure Layer
        │       │   ├── persistence/
        │       │   │   ├── repository/
        │       │   │   │   ├── VisiteRepository.java
        │       │   │   │   ├── VisiteurRepository.java
        │       │   │   │   ├── BadgeRepository.java
        │       │   │   │   ├── UtilisateurRepository.java
        │       │   │   │   ├── ServiceRepository.java
        │       │   │   │   ├── ObjetVisiteRepository.java
        │       │   │   │   ├── NotificationRepository.java
        │       │   │   │   └── AffectationFonctionnaireRepository.java
        │       │   │   └── member/                  # Read-only FH2_MEMBERS_DB
        │       │   │       ├── AdherentRepository.java
        │       │   │       └── MembreSearchRepository.java
        │       │   ├── websocket/
        │       │   │   ├── WebSocketConfig.java
        │       │   │   ├── NotificationWebSocketController.java
        │       │   │   └── WebSocketEventListener.java
        │       │   └── scheduler/
        │       │       └── BadgeOverdueScheduler.java
        │       │
        │       └── presentation/                    # Presentation Layer
        │           ├── controller/
        │           │   ├── AuthController.java
        │           │   ├── VisiteController.java
        │           │   ├── VisiteurController.java
        │           │   ├── BadgeController.java
        │           │   ├── PointageController.java
        │           │   ├── NotificationController.java
        │           │   ├── ServiceController.java
        │           │   ├── ObjetVisiteController.java
        │           │   ├── UtilisateurController.java
        │           │   └── RapportController.java
        │           ├── security/
        │           │   ├── SecurityConfig.java
        │           │   ├── LdapAuthProvider.java
        │           │   ├── JwtTokenProvider.java
        │           │   ├── JwtAuthFilter.java
        │           │   └── UserDetailsServiceImpl.java
        │           └── exception/
        │               └── GlobalExceptionHandler.java
│
└── resources/
    ├── application.yml                              # Base config
    ├── application-dev.yml                          # Dev overrides
    ├── application-prod.yml                         # Production overrides
    └── db/
        └── migration/                               # Flyway migrations
            ├── V1__create_schema.sql
            ├── V2__seed_services.sql
            └── V3__seed_badges.sql
```

---

## 4. Domain Layer

### 4.1 Enums

```java
// StatutBadge.java
public enum StatutBadge {
    DISPONIBLE, OCCUPE, PRET_A_RESTITUER, RESTITUE
}

// StatutVisite.java
public enum StatutVisite {
    EN_ATTENTE, EN_COURS, REAFFECTEE, TERMINEE, CLOTUREE
}

// RoleUtilisateur.java
public enum RoleUtilisateur {
    AGENT, FONCTIONNAIRE, RESPONSABLE, ADMIN, DIRECTEUR
}

// TypeVisiteur.java
public enum TypeVisiteur {
    ADHERENT, CONJOINT, ENFANT, PARTENAIRE, MEDECIN, VIP, EXTERNE
}

// AlgorithmeAffectation.java
public enum AlgorithmeAffectation {
    SEQUENTIEL, PRIORITE
}
```

### 4.2 Key Entity Example — `Visite`

```java
@Entity
@Table(name = "visite")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor
public class Visite {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "visiteur_id", nullable = false)
    private Visiteur visiteur;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "objet_visite_id", nullable = false)
    private ObjetVisite objetVisite;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fonctionnaire_id")
    private Utilisateur fonctionnaire;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "responsable_id")
    private Utilisateur responsable;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "badge_id")
    private Badge badge;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "agent_accueil_id", nullable = false)
    private Utilisateur agentAccueil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutVisite statut = StatutVisite.EN_ATTENTE;

    @Column(nullable = false)
    private LocalDateTime heureArrivee = LocalDateTime.now();

    private LocalDateTime heureEntree;
    private LocalDateTime heureSortie;
    private LocalDateTime heureCloture;

    @Column(length = 1000)
    private String notes;

    @CreatedDate private LocalDateTime dateCreation;
    @LastModifiedDate private LocalDateTime dateModification;
}
```

---

## 5. Application Layer — Service Patterns

### 5.1 VisiteService (core business logic)

```java
@Service
@Transactional
@RequiredArgsConstructor
public class VisiteService {

    private final VisiteRepository visiteRepository;
    private final BadgeService badgeService;
    private final AffectationService affectationService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    /**
     * Creates a visit, assigns a badge, notifies the fonctionnaire.
     * Throws DuplicateVisiteException if visitor already has an active visit.
     */
    public VisiteResponse creerVisite(CreateVisiteRequest request, Utilisateur agent) {
        // 1. Check no active visit exists for this visitor
        visiteRepository.findActiveByVisiteurId(request.getVisiteurId())
            .ifPresent(v -> { throw new DuplicateVisiteException(v.getId()); });

        // 2. Determine fonctionnaire via algorithm
        Utilisateur fonctionnaire = affectationService.determinerFonctionnaire(
            request.getObjetVisiteId()
        );

        // 3. Assign badge
        Badge badge = badgeService.assignerBadgeDisponible();

        // 4. Persist visit
        Visite visite = buildVisite(request, badge, fonctionnaire, agent);
        visite = visiteRepository.save(visite);

        // 5. Notify fonctionnaire and responsable
        notificationService.notifierArriveeVisiteur(visite);

        // 6. Audit
        auditService.log("VISITE_CREATED", "visite", visite.getId(), agent);

        return visiteMapper.toResponse(visite);
    }

    public VisiteResponse cloturerVisite(Long visiteId, Utilisateur fonctionnaire) {
        Visite visite = findOrThrow(visiteId);
        validateCanClose(visite, fonctionnaire);

        visite.setStatut(StatutVisite.TERMINEE);
        visite.setHeureCloture(LocalDateTime.now());
        visite.getBadge().setStatut(StatutBadge.PRET_A_RESTITUER);

        notificationService.notifierRestitutionBadge(visite);
        auditService.log("VISITE_CLOSED", "visite", visiteId, fonctionnaire);

        return visiteMapper.toResponse(visiteRepository.save(visite));
    }

    public VisiteResponse restituerBadge(Long visiteId, Utilisateur agent) {
        Visite visite = findOrThrow(visiteId);
        Badge badge = visite.getBadge();

        badge.setStatut(StatutBadge.DISPONIBLE);
        badge.setVisiteCouranteId(null);
        visite.setStatut(StatutVisite.CLOTUREE);

        auditService.log("BADGE_RETURNED", "badge", badge.getId(), agent);
        return visiteMapper.toResponse(visiteRepository.save(visite));
    }
}
```

### 5.2 AffectationService (assignment algorithms)

```java
@Service
@RequiredArgsConstructor
public class AffectationService {

    private final ObjetVisiteRepository objetVisiteRepository;
    private final AffectationFonctionnaireRepository affectationRepo;
    private final VisiteRepository visiteRepository;

    public Utilisateur determinerFonctionnaire(Long objetVisiteId) {
        ObjetVisite objet = objetVisiteRepository.findById(objetVisiteId).orElseThrow();

        return switch (objet.getAlgorithme()) {
            case SEQUENTIEL -> appliquerAlgorithmeSequentiel(objet);
            case PRIORITE   -> appliquerAlgorithmePriorite(objet);
        };
    }

    private Utilisateur appliquerAlgorithmeSequentiel(ObjetVisite objet) {
        List<AffectationFonctionnaire> affectations =
            affectationRepo.findByObjetVisiteIdOrderByPriorite(objet.getId());

        // Find first free fonctionnaire
        return affectations.stream()
            .map(AffectationFonctionnaire::getFonctionnaire)
            .filter(f -> !visiteRepository.hasActiveVisite(f.getId()))
            .findFirst()
            .orElseGet(() -> getFonctionnaireWithShortestQueue(affectations));
    }

    private Utilisateur appliquerAlgorithmePriorite(ObjetVisite objet) {
        return affectationRepo.findByObjetVisiteIdOrderByPriorite(objet.getId()).stream()
            .map(AffectationFonctionnaire::getFonctionnaire)
            .filter(Utilisateur::isActif)
            .filter(f -> !visiteRepository.hasActiveVisite(f.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No available fonctionnaire"));
    }
}
```

---

## 6. Security — LDAP / Active Directory

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final LdapAuthProvider ldapAuthProvider;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/rapports/**").hasAnyRole("ADMIN", "DIRECTEUR", "RESPONSABLE")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}

// LdapAuthProvider.java
@Component
@RequiredArgsConstructor
public class LdapAuthProvider implements AuthenticationProvider {

    @Value("${ldap.url}")
    private String ldapUrl;

    @Value("${ldap.base-dn}")
    private String baseDn;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        try {
            LdapContextSource ctx = new LdapContextSource();
            ctx.setUrl(ldapUrl);
            ctx.setUserDn("cn=" + username + "," + baseDn);
            ctx.setPassword(password);
            ctx.afterPropertiesSet();
            ctx.getContext("cn=" + username + "," + baseDn, password);
            // Authentication succeeded — load user from local DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid LDAP credentials");
        }
    }
}
```

### JWT Token Strategy

- On successful LDAP auth → issue a **JWT** (access token: 8h, refresh token: 24h)
- JWT contains: `sub` (username), `role`, `serviceId`, `exp`
- All subsequent API calls use `Authorization: Bearer <token>`
- Stateless — no server-side session storage

---

## 7. Real-Time Notifications — WebSocket (STOMP)

```java
// WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}

// NotificationService.java — push to specific user
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public void notifierArriveeVisiteur(Visite visite) {
        // Notify fonctionnaire
        Notification notifFonctionnaire = createNotification(
            visite.getFonctionnaire(),
            visite,
            "VISITE_ARRIVEE",
            "Nouveau visiteur : " + visite.getVisiteur().getNomComplet()
        );
        notificationRepository.save(notifFonctionnaire);
        messagingTemplate.convertAndSendToUser(
            visite.getFonctionnaire().getUsername(),
            "/queue/notifications",
            NotificationMapper.toResponse(notifFonctionnaire)
        );

        // Notify responsable
        Notification notifResponsable = createNotification(
            visite.getResponsable(), visite, "VISITE_ARRIVEE",
            "Arrivée visiteur pour " + visite.getFonctionnaire().getNomComplet()
        );
        notificationRepository.save(notifResponsable);
        messagingTemplate.convertAndSendToUser(
            visite.getResponsable().getUsername(),
            "/queue/notifications",
            NotificationMapper.toResponse(notifResponsable)
        );
    }
}
```

---

## 8. Scheduled Jobs

```java
// BadgeOverdueScheduler.java
@Component
@RequiredArgsConstructor
public class BadgeOverdueScheduler {

    private final VisiteRepository visiteRepository;
    private final NotificationService notificationService;

    // Runs every 5 minutes
    @Scheduled(fixedRate = 300_000)
    public void verifierBadgesEnRetard() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(45);
        List<Visite> enRetard = visiteRepository.findBadgesEnRetard(limite);

        enRetard.forEach(visite -> {
            notificationService.notifierBadgeEnRetard(visite);
        });
    }
}
```

---

## 9. Global Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VisiteNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVisiteNotFound(VisiteNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("VISITE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(BadgeUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleBadgeUnavailable(BadgeUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("BADGE_UNAVAILABLE", "Aucun badge disponible"));
    }

    @ExceptionHandler(DuplicateVisiteException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateVisiteException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DUPLICATE_VISITE", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("FORBIDDEN", "Action non autorisée"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("INTERNAL_ERROR", "Une erreur interne est survenue"));
    }
}
```

---

## 10. Configuration Files

### `application.yml`
```yaml
spring:
  application:
    name: service-accueil-backend

  datasource:
    accueil:
      url: jdbc:sqlserver://${DB_HOST}:1433;databaseName=FH2_ACCUEIL_DB;encrypt=true;trustServerCertificate=true
      username: ${DB_USER}
      password: ${DB_PASSWORD}
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
    members:
      url: jdbc:sqlserver://${DB_HOST}:1433;databaseName=FH2_MEMBERS_DB;encrypt=true;trustServerCertificate=true
      username: ${DB_USER_READONLY}
      password: ${DB_PASSWORD_READONLY}
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    database-platform: org.hibernate.dialect.SQLServerDialect

  flyway:
    enabled: true
    locations: classpath:db/migration

ldap:
  url: ldap://${LDAP_HOST}:389
  base-dn: ${LDAP_BASE_DN}
  domain: ${LDAP_DOMAIN}

jwt:
  secret: ${JWT_SECRET}
  expiration-ms: 28800000       # 8 hours
  refresh-expiration-ms: 86400000 # 24 hours

server:
  port: 8080
  servlet:
    context-path: /api

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

## 11. Design Patterns Applied

| Pattern | Where Used | Purpose |
|---------|-----------|---------|
| **Repository Pattern** | All data access | Abstraction over JPA/SQL |
| **Service Layer Pattern** | Business logic classes | Separation of concerns |
| **DTO Pattern** | Request/Response objects | Decouple API from domain |
| **Mapper Pattern (MapStruct)** | DTO ↔ Entity conversion | Type-safe, compile-time mapping |
| **Strategy Pattern** | Assignment algorithms | Swappable SEQUENTIEL / PRIORITE |
| **Observer Pattern** | Notification system | Decouple event creation from delivery |
| **Global Exception Handler** | `@RestControllerAdvice` | Consistent error responses |
| **Scheduler Pattern** | Badge overdue check | Background job isolation |
| **Audit Log Pattern** | All state mutations | Full traceability |

---

## 12. Method-Level Security

```java
// On service methods
@PreAuthorize("hasRole('AGENT')")
public VisiteResponse creerVisite(...) {}

@PreAuthorize("hasAnyRole('FONCTIONNAIRE', 'RESPONSABLE')")
public VisiteResponse cloturerVisite(...) {}

@PreAuthorize("hasRole('RESPONSABLE')")
public VisiteResponse reaffecterVisite(...) {}

@PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
public StatistiquesResponse getStatistiquesGlobales(...) {}

@PreAuthorize("hasRole('ADMIN')")
public void gererUtilisateurs(...) {}
```
