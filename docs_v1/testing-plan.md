# Testing Plan
# Service d'Accueil — Backend + Frontend

---

## 1. Testing Strategy

| Layer | Type | Tool | Coverage Target |
|-------|------|------|----------------|
| Backend — Domain/Service | Unit tests | JUnit 5 + Mockito | 80%+ |
| Backend — Repository | Integration tests | Spring Boot Test + H2/SQL Server | Key queries |
| Backend — API | Integration tests | MockMvc + SpringBootTest | All endpoints |
| Frontend — Components | Unit tests | Vitest + React Testing Library | Key components |
| Frontend — Hooks/Stores | Unit tests | Vitest | All custom hooks |
| E2E | End-to-End | Playwright | Critical user flows |

---

## 2. Backend Testing

### 2.1 Unit Tests — Service Layer

```java
// VisiteServiceTest.java
@ExtendWith(MockitoExtension.class)
class VisiteServiceTest {

    @Mock private VisiteRepository visiteRepository;
    @Mock private BadgeService badgeService;
    @Mock private AffectationService affectationService;
    @Mock private NotificationService notificationService;

    @InjectMocks private VisiteService visiteService;

    @Test
    @DisplayName("Doit créer une visite et attribuer un badge")
    void creerVisite_shouldCreateVisitAndAssignBadge() {
        // Arrange
        Utilisateur agent = buildAgent();
        Visiteur visiteur = buildVisiteur();
        Badge badge = buildBadge(StatutBadge.DISPONIBLE);
        Utilisateur fonctionnaire = buildFonctionnaire();

        CreateVisiteRequest request = new CreateVisiteRequest(visiteur.getId(), 1L, null);

        when(visiteRepository.findActiveByVisiteurId(visiteur.getId())).thenReturn(Optional.empty());
        when(affectationService.determinerFonctionnaire(1L)).thenReturn(fonctionnaire);
        when(badgeService.assignerBadgeDisponible()).thenReturn(badge);
        when(visiteRepository.save(any(Visite.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        VisiteResponse result = visiteService.creerVisite(request, agent);

        // Assert
        assertThat(result).isNotNull();
        verify(notificationService).notifierArriveeVisiteur(any(Visite.class));
        verify(badgeService).assignerBadgeDisponible();
    }

    @Test
    @DisplayName("Doit lever DuplicateVisiteException si visiteur a déjà une visite active")
    void creerVisite_shouldThrowWhenDuplicateVisiteExists() {
        // Arrange
        Visiteur visiteur = buildVisiteur();
        Visite existingVisite = buildVisite(StatutVisite.EN_COURS);
        when(visiteRepository.findActiveByVisiteurId(visiteur.getId()))
            .thenReturn(Optional.of(existingVisite));

        CreateVisiteRequest request = new CreateVisiteRequest(visiteur.getId(), 1L, null);

        // Act + Assert
        assertThatThrownBy(() -> visiteService.creerVisite(request, buildAgent()))
            .isInstanceOf(DuplicateVisiteException.class);

        verify(badgeService, never()).assignerBadgeDisponible();
    }

    @Test
    @DisplayName("Doit clôturer une visite et passer le badge en PRET_A_RESTITUER")
    void cloturerVisite_shouldUpdateVisitAndBadgeStatus() {
        Visite visite = buildVisite(StatutVisite.EN_COURS);
        Badge badge = buildBadge(StatutBadge.OCCUPE);
        visite.setBadge(badge);

        when(visiteRepository.findById(visite.getId())).thenReturn(Optional.of(visite));
        when(visiteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        visiteService.cloturerVisite(visite.getId(), visite.getFonctionnaire());

        assertThat(visite.getStatut()).isEqualTo(StatutVisite.TERMINEE);
        assertThat(badge.getStatut()).isEqualTo(StatutBadge.PRET_A_RESTITUER);
        verify(notificationService).notifierRestitutionBadge(visite);
    }
}
```

---

### 2.2 Unit Tests — Assignment Algorithms

```java
@ExtendWith(MockitoExtension.class)
class AffectationServiceTest {

    @Mock private ObjetVisiteRepository objetVisiteRepository;
    @Mock private AffectationFonctionnaireRepository affectationRepo;
    @Mock private VisiteRepository visiteRepository;

    @InjectMocks private AffectationService affectationService;

    @Test
    @DisplayName("Algorithme séquentiel: doit affecter au premier fonctionnaire libre")
    void sequentiel_shouldAssignFirstFreeFonctionnaire() {
        ObjetVisite objet = buildObjetVisite(AlgorithmeAffectation.SEQUENTIEL);
        Utilisateur fa = buildFonctionnaire("FA");
        Utilisateur fb = buildFonctionnaire("FB");

        List<AffectationFonctionnaire> affectations = List.of(
            buildAffectation(objet, fa, 1),
            buildAffectation(objet, fb, 2)
        );

        when(objetVisiteRepository.findById(objet.getId())).thenReturn(Optional.of(objet));
        when(affectationRepo.findByObjetVisiteIdOrderByPriorite(objet.getId())).thenReturn(affectations);
        when(visiteRepository.hasActiveVisite(fa.getId())).thenReturn(false);

        Utilisateur result = affectationService.determinerFonctionnaire(objet.getId());
        assertThat(result.getUsername()).isEqualTo("FA");
    }

    @Test
    @DisplayName("Algorithme séquentiel: doit affecter au suivant si le premier est occupé")
    void sequentiel_shouldSkipBusyFonctionnaire() {
        ObjetVisite objet = buildObjetVisite(AlgorithmeAffectation.SEQUENTIEL);
        Utilisateur fa = buildFonctionnaire("FA");
        Utilisateur fb = buildFonctionnaire("FB");

        List<AffectationFonctionnaire> affectations = List.of(
            buildAffectation(objet, fa, 1),
            buildAffectation(objet, fb, 2)
        );

        when(objetVisiteRepository.findById(objet.getId())).thenReturn(Optional.of(objet));
        when(affectationRepo.findByObjetVisiteIdOrderByPriorite(objet.getId())).thenReturn(affectations);
        when(visiteRepository.hasActiveVisite(fa.getId())).thenReturn(true);  // FA is busy
        when(visiteRepository.hasActiveVisite(fb.getId())).thenReturn(false); // FB is free

        Utilisateur result = affectationService.determinerFonctionnaire(objet.getId());
        assertThat(result.getUsername()).isEqualTo("FB");
    }
}
```

---

### 2.3 Integration Tests — API Endpoints

```java
// VisiteControllerIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
class VisiteControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "AGENT")
    @DisplayName("POST /visites - doit créer une visite avec badge")
    void createVisite_shouldReturn201() throws Exception {
        CreateVisiteRequest request = new CreateVisiteRequest(1L, 1L, null);

        mockMvc.perform(post("/api/visites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.statut").value("EN_ATTENTE"))
            .andExpect(jsonPath("$.badge.statut").value("OCCUPE"));
    }

    @Test
    @WithMockUser(roles = "FONCTIONNAIRE")
    @DisplayName("POST /visites - doit retourner 403 pour un fonctionnaire")
    void createVisite_shouldReturn403ForFonctionnaire() throws Exception {
        mockMvc.perform(post("/api/visites")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "AGENT")
    @DisplayName("POST /pointage/entree - doit enregistrer l'heure d'entrée")
    void pointageEntree_shouldRecordEntryTime() throws Exception {
        PointageRequest request = new PointageRequest("B-001");

        mockMvc.perform(post("/api/pointage/entree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.heureEntree").isNotEmpty());
    }
}
```

---

## 3. Frontend Testing

### 3.1 Component Tests

```tsx
// components/molecules/VisiteurCard.test.tsx
import { render, screen } from '@testing-library/react';
import { VisiteurCard } from './VisiteurCard';

describe('VisiteurCard', () => {
  const visiteur = {
    id: 1,
    nom: 'Alami',
    prenom: 'Hassan',
    cin: 'AB123456',
    type: 'ADHERENT' as const,
    numeroAdhesion: 'FH2-0042',
  };

  it('renders visitor name and CIN', () => {
    render(<VisiteurCard visiteur={visiteur} />);
    expect(screen.getByText('Hassan Alami')).toBeInTheDocument();
    expect(screen.getByText('AB123456')).toBeInTheDocument();
  });

  it('displays correct type badge', () => {
    render(<VisiteurCard visiteur={visiteur} />);
    expect(screen.getByText('Adhérent')).toBeInTheDocument();
  });
});
```

### 3.2 Store Tests

```ts
// stores/notificationStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useNotificationStore } from './notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  it('adds notification and increments unread count', () => {
    const { result } = renderHook(() => useNotificationStore());
    const notification = { id: 1, type: 'VISITE_ARRIVEE', message: 'Test', lue: false, dateEnvoi: '2025-08-15T09:00:00', visiteId: 1 };

    act(() => result.current.addNotification(notification));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAllAsRead sets unreadCount to 0', () => {
    useNotificationStore.setState({ unreadCount: 5 });
    const { result } = renderHook(() => useNotificationStore());

    act(() => result.current.markAllAsRead());

    expect(result.current.unreadCount).toBe(0);
  });
});
```

---

## 4. End-to-End Tests — Playwright

### 4.1 Critical Flows Covered

```ts
// e2e/visit-lifecycle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visit lifecycle — Agent d\'accueil', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=username]', 'agent.test');
    await page.fill('[name=password]', 'password');
    await page.click('[type=submit]');
    await expect(page).toHaveURL('/agent');
  });

  test('should create a new visit and assign a badge', async ({ page }) => {
    await page.click('text=Nouvelle visite');
    // Search visitor
    await page.fill('[data-testid=visiteur-search]', 'Alami');
    await page.click('[data-testid=visiteur-result-0]');
    // Select objet de visite
    await page.selectOption('[data-testid=objet-visite-select]', { label: 'Dossier retraite' });
    await page.click('[type=submit]');

    // Verify success
    await expect(page.locator('[data-testid=success-toast]')).toBeVisible();
    await expect(page.locator('[data-testid=badge-assigned]')).toContainText('B-');
  });

  test('should show error when no badge is available', async ({ page }) => {
    // Mock: all badges occupied (test data setup required)
    await page.goto('/agent/nouvelle-visite?mock=no-badges');
    await page.click('[type=submit]');
    await expect(page.locator('[data-testid=error-toast]')).toContainText('badge disponible');
  });
});
```

### 4.2 E2E Test Matrix

| Flow | Roles Tested | Priority |
|------|-------------|---------|
| Login / Logout | All | High |
| Create visit + badge assignment | Agent | High |
| Entry badge scan | Agent | High |
| Fonctionnaire receives notification | Fonctionnaire | High |
| Mark visit received + close | Fonctionnaire | High |
| Reassign visit | Responsable | Medium |
| Badge restitution | Agent | High |
| Export CSV report | Responsable, Admin | Medium |
| Admin create user | Admin | Medium |
| Director view statistics | Directeur | Low |

---

## 5. Test Data Setup

```sql
-- test-data.sql (run before integration tests)
INSERT INTO service (code, nom_fr) VALUES ('RH', 'Service Ressources Humaines');
INSERT INTO utilisateur (username, nom, prenom, email, role, service_id)
  VALUES ('agent.test', 'Test', 'Agent', 'agent@fh2.ma', 'AGENT', NULL);
INSERT INTO badge (numero, qr_code, statut) VALUES ('B-001', 'B-001', 'DISPONIBLE');
INSERT INTO objet_visite (code, libelle_fr, service_id, algorithme)
  VALUES ('RETRAITE', 'Dossier retraite', 1, 'SEQUENTIEL');
```

---

## 6. Running Tests

```bash
# Backend unit + integration tests
cd backend
mvn test

# Backend with coverage report
mvn verify jacoco:report
# Report at: target/site/jacoco/index.html

# Frontend unit tests
cd frontend
npm run test

# Frontend with coverage
npm run test:coverage

# E2E tests (requires running app)
npm run test:e2e

# E2E tests headed (visual)
npm run test:e2e -- --headed
```
