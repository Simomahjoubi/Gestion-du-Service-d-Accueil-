# Performance Optimization
# Service d'Accueil — Frontend + Backend

---

## 1. Frontend Optimizations

### 1.1 Code Splitting & Lazy Loading

```tsx
// router/AppRouter.tsx — Lazy load each page/role bundle
const AgentDashboard    = lazy(() => import('@/pages/agent/AgentDashboard'));
const FonctionnaireDashboard = lazy(() => import('@/pages/fonctionnaire/FonctionnaireDashboard'));
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'));
const DirecteurDashboard = lazy(() => import('@/pages/directeur/DirecteurDashboard'));
const RapportsPage      = lazy(() => import('@/pages/directeur/RapportsPage'));

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

**Benefit:** Each role loads only its own bundle. An Agent never downloads the Director's chart libraries.

---

### 1.2 TanStack Query Caching

```ts
// QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,         // Data fresh for 30s — no refetch on focus
      gcTime: 5 * 60_000,        // Keep in cache 5 min after unmount
      retry: 2,                  // Retry failed requests twice
      refetchOnWindowFocus: false, // Prevent refetch on tab switch
    },
  },
});
```

**Per-query tuning:**
```ts
// Badge count — critical, refresh frequently
useQuery({ queryKey: queryKeys.badges.count(), staleTime: 10_000, refetchInterval: 15_000 });

// Statistics — expensive, cache longer
useQuery({ queryKey: queryKeys.statistiques.range(...), staleTime: 5 * 60_000 });

// Visit list on agent dashboard — semi-live
useQuery({ queryKey: queryKeys.visites.all, staleTime: 30_000, refetchInterval: 30_000 });
```

---

### 1.3 List Virtualization

For large visit history tables (hundreds of rows):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Only renders visible rows — prevents DOM bloat
const virtualizer = useVirtualizer({
  count: visites.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 56, // Row height in px
  overscan: 5,
});
```

---

### 1.4 Memoization

```tsx
// Prevent re-renders on parent state changes
const VisiteCard = memo(({ visite }: { visite: Visite }) => {
  return <Card>...</Card>;
});

// Stable callback references
const handleScan = useCallback((qrCode: string) => {
  pointageMutation.mutate({ badgeQrCode: qrCode });
}, [pointageMutation]);

// Expensive derived values
const sortedVisites = useMemo(
  () => [...visites].sort((a, b) => new Date(b.heureArrivee).getTime() - new Date(a.heureArrivee).getTime()),
  [visites]
);
```

---

### 1.5 Vite Build Optimizations

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],        // Only loaded on Stats pages
          'vendor-export': ['jspdf', 'papaparse'], // Only loaded on export actions
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
```

---

## 2. Backend Optimizations

### 2.1 Database Query Optimization

**Use projections for list views (avoid N+1):**

```java
// Instead of fetching full entities for list views, use projections
@Query("""
    SELECT v.id, v.statut, v.heureArrivee,
           vt.nom, vt.prenom, vt.typeVisiteur,
           b.numero AS badgeNumero,
           u.nom AS fonctionnaireNom,
           ov.libelleFr AS objetVisite
    FROM Visite v
    JOIN v.visiteur vt
    JOIN v.badge b
    LEFT JOIN v.fonctionnaire u
    JOIN v.objetVisite ov
    WHERE v.service.id = :serviceId
      AND v.statut IN :statuts
    ORDER BY v.heureArrivee DESC
    """)
Page<VisiteListProjection> findByServiceAndStatuts(
    Long serviceId,
    List<StatutVisite> statuts,
    Pageable pageable
);
```

**Use `@BatchSize` to prevent N+1 on collections:**

```java
@Entity
public class Service {
    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<Utilisateur> utilisateurs;
}
```

---

### 2.2 Connection Pool Configuration

```yaml
# application.yml — HikariCP settings
spring:
  datasource:
    accueil:
      hikari:
        maximum-pool-size: 10       # Max connections (sized for 40 users)
        minimum-idle: 3             # Keep 3 connections warm
        idle-timeout: 300000        # 5 min idle before close
        connection-timeout: 30000   # 30s wait for connection
        max-lifetime: 1800000       # 30 min max connection age
```

---

### 2.3 Pagination — Enforce on All List Endpoints

```java
// Always paginate — never return unbounded lists
@GetMapping("/visites")
public ResponseEntity<Page<VisiteResponse>> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "heureArrivee,desc") String sort
) {
    Pageable pageable = PageRequest.of(page, Math.min(size, 100), parseSort(sort));
    return ResponseEntity.ok(visiteService.list(pageable));
}
```

---

### 2.4 Scheduled Job Efficiency

```java
// BadgeOverdueScheduler — only query visits that haven't been alerted yet
@Query("""
    SELECT v FROM Visite v
    WHERE v.statut = 'TERMINEE'
      AND v.heureCloture < :limite
      AND NOT EXISTS (
        SELECT n FROM Notification n
        WHERE n.visite = v AND n.type = 'BADGE_ALERTE'
      )
    """)
List<Visite> findBadgesEnRetardNonAlertes(LocalDateTime limite);
```

---

### 2.5 Statistics Query — Aggregation in DB, Not in Java

```java
// Run aggregation in SQL, return summary DTO directly
@Query("""
    SELECT
        COUNT(v.id) as totalVisites,
        AVG(DATEDIFF(MINUTE, v.heureEntree, v.heureSortie)) as dureeMoyenneMinutes,
        SUM(CASE WHEN v.statut IN ('EN_ATTENTE', 'EN_COURS') THEN 1 ELSE 0 END) as visitesActives
    FROM Visite v
    WHERE v.heureArrivee BETWEEN :debut AND :fin
      AND (:serviceId IS NULL OR v.service.id = :serviceId)
    """)
StatistiquesProjection getStatistiques(LocalDateTime debut, LocalDateTime fin, Long serviceId);
```

---

## 3. Network Performance

### 3.1 Nginx Compression

Already configured in `devops.md` — gzip enabled for JSON and JS responses.

### 3.2 Response Payload Minimization

- List endpoints return **projections** (not full entities) — no unnecessary fields
- Pagination default size: 20 rows
- Avatar/photos: none in this system (text-only, fast by default)

### 3.3 WebSocket — Targeted Messages

```java
// Send only to affected user, not broadcast to all
messagingTemplate.convertAndSendToUser(
    username,
    "/queue/notifications",
    payload
);
// NOT: messagingTemplate.convertAndSend("/topic/all", payload)
```

---

## 4. Performance Targets

| Metric | Target | How Achieved |
|--------|--------|-------------|
| Page initial load | < 2s | Code splitting, lazy loading |
| Visit list render (20 rows) | < 200ms | TanStack Query cache + projections |
| Badge assignment API | < 500ms | DB index on badge.statut |
| Notification delivery | < 1s | WebSocket push (no polling) |
| Statistics dashboard load | < 3s | Aggregation in SQL + caching |
| PDF export generation | < 5s | Client-side jsPDF (no server roundtrip) |
| CSV export (1000 rows) | < 2s | Server-side streaming response |
