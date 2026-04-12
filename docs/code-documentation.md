# Code Documentation Standards
# Service d'Accueil

---

## 1. Backend — Javadoc Standards

### 1.1 Service Methods — Document Every Public Method

```java
/**
 * Creates a new visit record, assigns an available badge, and notifies
 * the designated fonctionnaire and service manager.
 *
 * <p>Business rules enforced:
 * <ul>
 *   <li>A visitor cannot have two active visits simultaneously.</li>
 *   <li>A badge must be available before the visit can be created.</li>
 *   <li>Fonctionnaire is determined by the configured assignment algorithm.</li>
 * </ul>
 *
 * @param request DTO containing visiteurId, objetVisiteId, and optional notes
 * @param agent   The authenticated agent d'accueil initiating the visit
 * @return        The created visit with badge and assignment details
 * @throws DuplicateVisiteException  if visitor already has an active visit
 * @throws BadgeUnavailableException if no badge is currently available
 */
public VisiteResponse creerVisite(CreateVisiteRequest request, Utilisateur agent) { ... }
```

### 1.2 Repository Methods — Document Custom Queries

```java
/**
 * Finds the currently active visit (not TERMINEE or CLOTUREE) for a given visitor.
 * Used to enforce the no-duplicate-visit business rule.
 *
 * @param visiteurId the visitor's ID
 * @return an Optional containing the active visit, or empty if none exists
 */
@Query("SELECT v FROM Visite v WHERE v.visiteur.id = :visiteurId AND v.statut NOT IN ('TERMINEE', 'CLOTUREE')")
Optional<Visite> findActiveByVisiteurId(@Param("visiteurId") Long visiteurId);
```

### 1.3 Complex Algorithm Logic — Inline Comments

```java
private Utilisateur getFonctionnaireWithShortestQueue(List<AffectationFonctionnaire> affectations) {
    // When all fonctionnaires are busy, assign to the one with the fewest pending visitors.
    // This prevents one fonctionnaire from being overwhelmed while others have shorter queues.
    return affectations.stream()
        .map(AffectationFonctionnaire::getFonctionnaire)
        .min(Comparator.comparingLong(f ->
            visiteRepository.countByFonctionnaireIdAndStatut(f.getId(), StatutVisite.EN_ATTENTE)
        ))
        .orElseThrow();
}
```

---

## 2. Frontend — JSDoc Standards

```ts
/**
 * Custom hook that listens for USB keyboard-wedge QR scanner input.
 * The scanner emits characters rapidly followed by an Enter key.
 * This hook buffers keystrokes and fires onScan when Enter is received.
 *
 * @param onScan - Callback fired with the scanned QR code value
 * @example
 * const { } = useQRScanner((code) => console.log('Scanned:', code));
 */
export const useQRScanner = (onScan: (value: string) => void): void => { ... }
```

```ts
/**
 * Determines the Tailwind CSS color class for a given visit status.
 *
 * @param statut - The visit status enum value
 * @returns A Tailwind CSS class string for the corresponding status badge color
 */
export const getStatutVisiteColor = (statut: StatutVisite): string => { ... }
```

---

## 3. API Documentation — Swagger / OpenAPI

### Configuration

```java
// SwaggerConfig.java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Service d'Accueil API")
                .description("API REST pour la gestion digitale du service d'accueil — Fondation Hassan II")
                .version("1.0.0")
                .contact(new Contact()
                    .name("FH2 Service Informatique")
                    .email("si@fh2.ma")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                )
            );
    }
}
```

### Controller Annotations

```java
@RestController
@RequestMapping("/visites")
@Tag(name = "Visites", description = "Gestion du cycle de vie des visites")
@RequiredArgsConstructor
public class VisiteController {

    @Operation(
        summary = "Créer une nouvelle visite",
        description = "Enregistre une visite, attribue un badge disponible et notifie le fonctionnaire désigné."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Visite créée avec succès"),
        @ApiResponse(responseCode = "409", description = "Badge indisponible ou visite dupliquée",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Accès refusé — rôle AGENT requis")
    })
    @PostMapping
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<VisiteResponse> creerVisite(...) { ... }
}
```

**Swagger UI available at:** `http://localhost:8080/swagger-ui.html`

---

## 4. README Standards

Every sub-project has a `README.md` with:

```markdown
# Service d'Accueil — Backend

## Prerequisites
- Java 17+
- Maven 3.9+
- SQL Server (see database-schema.md)
- Active Directory accessible on network

## Setup
1. Copy `.env.example` to `.env.local` and fill in values
2. Run: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

## Running Tests
mvn test

## API Docs
Available at: http://localhost:8080/swagger-ui.html
```

---

## 5. Git Commit Conventions

Follow **Conventional Commits**:

```
feat(visite): add badge overdue alert scheduler
fix(auth): handle LDAP connection timeout gracefully
refactor(affectation): extract algorithm strategy to separate classes
docs(api): add OpenAPI annotations to PointageController
test(visite): add unit test for duplicate visit detection
chore(docker): update nginx config for WebSocket upgrade headers
```

---

## 6. What NOT to Comment

- Do not add comments explaining what the code does if the code is self-explanatory
- Do not add TODO comments — create a task instead
- Do not comment out dead code — delete it

```java
// BAD — obvious from the code
badge.setStatut(StatutBadge.DISPONIBLE); // Set badge status to DISPONIBLE

// GOOD — explains the non-obvious business rule
badge.setStatut(StatutBadge.DISPONIBLE); // Auto-reset: physical return confirms availability for next visitor
```
