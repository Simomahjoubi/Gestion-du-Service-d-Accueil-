# Frontend Documentation
# React 18 + TypeScript + Vite

---

## 1. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool / Dev server |
| React Router | 6.x | Client-side routing |
| shadcn/ui | latest | UI component library |
| Tailwind CSS | 3.x | Utility-first styling |
| Zustand | 4.x | Global state management |
| TanStack Query | 5.x | Server state / API data |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| SockJS + STOMP.js | latest | WebSocket client |
| html5-qrcode | 2.x | QR code scanning |
| jsPDF + jsPDF-AutoTable | 2.x | PDF export |
| PapaParse | 5.x | CSV export |
| date-fns | 3.x | Date formatting |
| Axios | 1.x | HTTP client |
| i18next | 23.x | Internationalization (FR/AR) |

---

## 2. Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Root component + routing
│   │
│   ├── assets/                       # Static files (logos, icons)
│   │
│   ├── components/                   # Atomic Design
│   │   ├── ui/                       # shadcn/ui base components (auto-generated)
│   │   ├── atoms/                    # Smallest units (Badge, StatusChip, Avatar)
│   │   │   ├── StatutBadgeChip.tsx
│   │   │   ├── StatutVisiteChip.tsx
│   │   │   ├── RoleChip.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── molecules/                # Composed components
│   │   │   ├── VisiteurCard.tsx
│   │   │   ├── VisiteCard.tsx
│   │   │   ├── BadgeStatusCard.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── QRScanner.tsx
│   │   └── organisms/                # Complex sections
│   │       ├── VisiteTable.tsx
│   │       ├── VisiteForm.tsx
│   │       ├── VisiteurSearchModal.tsx
│   │       ├── BadgeAssignmentPanel.tsx
│   │       ├── NotificationPanel.tsx
│   │       ├── StatistiquesChart.tsx
│   │       └── UserManagementTable.tsx
│   │
│   ├── pages/                        # Route-level views (one per role/feature)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── agent/
│   │   │   ├── AgentDashboard.tsx
│   │   │   ├── NouvelleVisitePage.tsx
│   │   │   └── RestitutionBadgePage.tsx
│   │   ├── fonctionnaire/
│   │   │   ├── FonctionnaireDashboard.tsx
│   │   │   └── FicheVisitePage.tsx
│   │   ├── responsable/
│   │   │   ├── ResponsableDashboard.tsx
│   │   │   └── ReaffectationPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── BadgesPage.tsx
│   │   │   └── ObjetsVisitePage.tsx
│   │   ├── directeur/
│   │   │   ├── DirecteurDashboard.tsx
│   │   │   └── RapportsPage.tsx
│   │   └── shared/
│   │       ├── NotFoundPage.tsx
│   │       └── UnauthorizedPage.tsx
│   │
│   ├── layouts/                      # Role-based layouts (sidebar + header)
│   │   ├── AgentLayout.tsx
│   │   ├── FonctionnaireLayout.tsx
│   │   ├── ResponsableLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── DirecteurLayout.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useVisites.ts
│   │   ├── useNotifications.ts
│   │   ├── useWebSocket.ts
│   │   ├── useQRScanner.ts
│   │   └── useExport.ts
│   │
│   ├── services/                     # API call layer (Axios)
│   │   ├── api.ts                    # Axios instance + interceptors
│   │   ├── authService.ts
│   │   ├── visiteService.ts
│   │   ├── visiteurService.ts
│   │   ├── badgeService.ts
│   │   ├── notificationService.ts
│   │   ├── rapportService.ts
│   │   └── adminService.ts
│   │
│   ├── stores/                       # Zustand global stores
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                        # TypeScript interfaces
│   │   ├── visite.types.ts
│   │   ├── visiteur.types.ts
│   │   ├── badge.types.ts
│   │   ├── user.types.ts
│   │   ├── notification.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                        # Pure utility functions
│   │   ├── formatDate.ts
│   │   ├── exportCsv.ts
│   │   ├── exportPdf.ts
│   │   └── statusColors.ts
│   │
│   ├── router/                       # Route definitions
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.ts
│   │
│   └── i18n/                         # Internationalization
│       ├── index.ts
│       ├── fr/
│       │   └── translation.json      # French strings
│       └── ar/
│           └── translation.json      # Arabic strings
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## 3. Routing & Role-Based Access

```tsx
// router/AppRouter.tsx
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Agent d'accueil */}
        <Route element={<ProtectedRoute roles={['AGENT']} layout={<AgentLayout />} />}>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/nouvelle-visite" element={<NouvelleVisitePage />} />
          <Route path="/agent/restitution" element={<RestitutionBadgePage />} />
        </Route>

        {/* Fonctionnaire */}
        <Route element={<ProtectedRoute roles={['FONCTIONNAIRE']} layout={<FonctionnaireLayout />} />}>
          <Route path="/fonctionnaire" element={<FonctionnaireDashboard />} />
          <Route path="/fonctionnaire/visite/:id" element={<FicheVisitePage />} />
        </Route>

        {/* Responsable de service */}
        <Route element={<ProtectedRoute roles={['RESPONSABLE']} layout={<ResponsableLayout />} />}>
          <Route path="/responsable" element={<ResponsableDashboard />} />
          <Route path="/responsable/reaffectation/:id" element={<ReaffectationPage />} />
        </Route>

        {/* Administrateur */}
        <Route element={<ProtectedRoute roles={['ADMIN']} layout={<AdminLayout />} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/utilisateurs" element={<UsersPage />} />
          <Route path="/admin/services" element={<ServicesPage />} />
          <Route path="/admin/badges" element={<BadgesPage />} />
          <Route path="/admin/objets-visite" element={<ObjetsVisitePage />} />
        </Route>

        {/* Directeur */}
        <Route element={<ProtectedRoute roles={['DIRECTEUR']} layout={<DirecteurLayout />} />}>
          <Route path="/directeur" element={<DirecteurDashboard />} />
          <Route path="/directeur/rapports" element={<RapportsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

```tsx
// router/ProtectedRoute.tsx
export const ProtectedRoute = ({ roles, layout }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return layout ? cloneElement(layout, {}, <Outlet />) : <Outlet />;
};
```

---

## 4. Key Pages by Role

### 4.1 Agent d'Accueil — `AgentDashboard`

**Displays:**
- Live list of current visitors (status, badge number, service)
- Alert panel for overdue badges
- Quick actions: New visit, Return badge

**Interactions:**
- Search bar (CIN, name, membership number)
- QR scanner input (USB keyboard wedge triggers `onScan`)
- Badge assignment modal
- Confirmation dialogs

### 4.2 Fonctionnaire — `FonctionnaireDashboard`

**Displays:**
- Personal visit queue (EN_ATTENTE visits assigned to this user)
- Current active visit (EN_COURS)
- Notification badge counter in header

**Interactions:**
- Click visit → open `FicheVisitePage`
- Mark as "Visiteur reçu" → status: EN_COURS
- "Clôturer" button → status: TERMINEE

### 4.3 Responsable — `ResponsableDashboard`

**Displays:**
- Full service visit queue (all fonctionnaires)
- Load distribution per fonctionnaire
- Filter by status

**Interactions:**
- Reassign visit to another fonctionnaire
- Close visit on behalf of fonctionnaire
- Export service report (CSV/PDF)

### 4.4 Admin — `AdminDashboard`

**Displays:**
- System stats summary (total visits today, active badges, users)
- Quick links to management pages

**Interactions:**
- CRUD users, services, badges, objets de visite
- Configure assignment algorithms per objet

### 4.5 Directeur — `DirecteurDashboard`

**Displays:**
- Consolidated charts (visits per service, per day, average duration)
- Top services by volume

**Interactions:**
- Date range filter
- Export global report (CSV/PDF)

---

## 5. QR Scanner Integration

```tsx
// hooks/useQRScanner.ts
export const useQRScanner = (onScan: (value: string) => void) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const buffer = useRef('');
  const lastKeyTime = useRef<number>(0);

  // USB keyboard-wedge scanners type fast then send Enter
  // We capture the keystrokes into a buffer and flush on Enter
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const now = Date.now();
    if (now - lastKeyTime.current > 100) buffer.current = ''; // reset if gap too large
    lastKeyTime.current = now;

    if (e.key === 'Enter' && buffer.current.length > 0) {
      onScan(buffer.current.trim());
      buffer.current = '';
      e.preventDefault();
    } else if (e.key.length === 1) {
      buffer.current += e.key;
    }
  }, [onScan]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { inputRef };
};
```

```tsx
// components/molecules/QRScanner.tsx
export const QRScanner = ({ onScan, label }: QRScannerProps) => {
  const [lastScanned, setLastScanned] = useState<string>('');

  const handleScan = (value: string) => {
    setLastScanned(value);
    onScan(value);
  };

  useQRScanner(handleScan);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{label ?? 'Scannez le badge QR'}</p>
      {lastScanned && (
        <Badge variant="outline">Dernier scan : {lastScanned}</Badge>
      )}
    </div>
  );
};
```

---

## 6. WebSocket Notifications

```tsx
// hooks/useWebSocket.ts
export const useWebSocket = () => {
  const { user, token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user || !token) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        stompClient.subscribe(
          `/user/${user.username}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            addNotification(notification);
            // Show toast
            toast.info(notification.message);
          }
        );
      },
      reconnectDelay: 5000,
    });

    stompClient.activate();
    return () => { stompClient.deactivate(); };
  }, [user, token]);
};
```

---

## 7. Form Example — Nouvelle Visite

```tsx
// pages/agent/NouvelleVisitePage.tsx
const visiteSchema = z.object({
  visiteurId: z.number().min(1, 'Visiteur requis'),
  objetVisiteId: z.number().min(1, 'Objet de visite requis'),
  notes: z.string().optional(),
});

export const NouvelleVisitePage = () => {
  const form = useForm<z.infer<typeof visiteSchema>>({
    resolver: zodResolver(visiteSchema),
  });

  const { mutate: creerVisite, isPending } = useMutation({
    mutationFn: visiteService.create,
    onSuccess: () => {
      toast.success('Visite créée et badge attribué');
      navigate('/agent');
    },
    onError: (err: ApiError) => {
      if (err.code === 'BADGE_UNAVAILABLE') {
        toast.error('Aucun badge disponible');
      } else if (err.code === 'DUPLICATE_VISITE') {
        toast.error('Ce visiteur a déjà une visite active');
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => creerVisite(data))}>
        <VisiteurSearchField control={form.control} name="visiteurId" />
        <ObjetVisiteSelect control={form.control} name="objetVisiteId" />
        <TextareaField control={form.control} name="notes" label="Notes" />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Création...' : 'Créer la visite'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## 8. Internationalization (i18n)

```ts
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr/translation.json';
import ar from './ar/translation.json';

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, ar: { translation: ar } },
  lng: 'fr',           // Default language
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
```

```json
// i18n/fr/translation.json (excerpt)
{
  "nav": {
    "dashboard": "Tableau de bord",
    "newVisit": "Nouvelle visite",
    "badgeReturn": "Restitution badge"
  },
  "visit": {
    "status": {
      "EN_ATTENTE": "En attente",
      "EN_COURS": "En cours",
      "REAFFECTEE": "Réaffectée",
      "TERMINEE": "Terminée",
      "CLOTUREE": "Clôturée"
    }
  }
}
```

```json
// i18n/ar/translation.json (excerpt)
{
  "nav": {
    "dashboard": "لوحة التحكم",
    "newVisit": "زيارة جديدة",
    "badgeReturn": "إرجاع الشارة"
  },
  "visit": {
    "status": {
      "EN_ATTENTE": "في الانتظار",
      "EN_COURS": "قيد المعالجة",
      "REAFFECTEE": "معاد تعيينها",
      "TERMINEE": "منتهية",
      "CLOTUREE": "مغلقة"
    }
  }
}
```

---

## 9. UI Design System

| Element | Specification |
|---------|--------------|
| Framework | shadcn/ui (Radix primitives + Tailwind) |
| Color mode | Light mode (institutional context) |
| Color palette | Zinc/slate neutrals + one accent (blue) |
| Typography | Geist Sans (interface) / Geist Mono (IDs, codes) |
| RTL support | `dir="rtl"` on `<html>` when `lng === 'ar'` |
| Icon library | Lucide React |
| Status colors | Green=Disponible, Orange=Occupé, Blue=En cours, Red=Retard |

---

## 10. Environment Variables

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
VITE_APP_NAME=Service d'Accueil - FH2
```
