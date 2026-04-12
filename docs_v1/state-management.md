# State Management Documentation
# Zustand + TanStack Query

---

## 1. Strategy Overview

| Type of State | Solution | Why |
|--------------|---------|-----|
| **Auth / User session** | Zustand | Persisted in localStorage, available everywhere |
| **In-app notifications** | Zustand | Real-time push via WebSocket, global access |
| **UI state** (sidebar, modals, loading) | Zustand | Lightweight, no async needed |
| **Server data** (visits, badges, stats) | TanStack Query | Caching, background refetch, stale-while-revalidate |
| **Form state** | React Hook Form | Local to form component |

---

## 2. Zustand Stores

### 2.1 `authStore` — Authentication

```ts
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: 'AGENT' | 'FONCTIONNAIRE' | 'RESPONSABLE' | 'ADMIN' | 'DIRECTEUR';
  serviceId: number | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      updateToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'fh2-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

### 2.2 `notificationStore` — Real-time Notifications

```ts
// stores/notificationStore.ts
import { create } from 'zustand';

export interface AppNotification {
  id: number;
  type: 'VISITE_ARRIVEE' | 'VISITE_REAFFECTEE' | 'VISITE_TERMINEE' | 'BADGE_ALERTE' | 'BADGE_DISPONIBLE';
  message: string;
  visiteId: number | null;
  lue: boolean;
  dateEnvoi: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setInitialNotifications: (notifications: AppNotification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + (notification.lue ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lue: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, lue: true })),
      unreadCount: 0,
    })),

  setInitialNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.lue).length,
    }),
}));
```

---

### 2.3 `uiStore` — UI State

```ts
// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
```

---

## 3. TanStack Query — Server State

### 3.1 Query Keys Convention

```ts
// All query keys are centralized to prevent typos and enable targeted invalidation
export const queryKeys = {
  visites: {
    all: ['visites'] as const,
    list: (filters: VisiteFilters) => ['visites', 'list', filters] as const,
    detail: (id: number) => ['visites', 'detail', id] as const,
    active: () => ['visites', 'active'] as const,
  },
  visiteurs: {
    all: ['visiteurs'] as const,
    search: (q: string) => ['visiteurs', 'search', q] as const,
    detail: (id: number) => ['visiteurs', 'detail', id] as const,
  },
  badges: {
    all: ['badges'] as const,
    disponibles: () => ['badges', 'disponibles'] as const,
    count: () => ['badges', 'disponibles', 'count'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
  statistiques: {
    all: ['statistiques'] as const,
    range: (dateDebut: string, dateFin: string) => ['statistiques', dateDebut, dateFin] as const,
  },
  services: ['services'] as const,
  objetsVisite: ['objets-visite'] as const,
  utilisateurs: ['utilisateurs'] as const,
} as const;
```

---

### 3.2 Custom Query Hooks

```ts
// hooks/useVisites.ts
export const useVisitesList = (filters: VisiteFilters) => {
  return useQuery({
    queryKey: queryKeys.visites.list(filters),
    queryFn: () => visiteService.list(filters),
    staleTime: 30_000,        // 30 seconds — visits update frequently
    refetchInterval: 30_000,  // Auto-refresh every 30s for live dashboard
  });
};

export const useVisiteDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.visites.detail(id),
    queryFn: () => visiteService.getById(id),
    enabled: !!id,
  });
};

export const useCreateVisite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visiteService.create,
    onSuccess: () => {
      // Invalidate all visit lists and badge count
      queryClient.invalidateQueries({ queryKey: queryKeys.visites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.count() });
    },
  });
};

export const useUpdateVisiteStatut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: StatutVisite }) =>
      visiteService.updateStatut(id, statut),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visites.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.visites.all });
    },
  });
};

export const useReaffecterVisite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visiteService.reaffecter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visites.detail(variables.visiteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.visites.all });
    },
  });
};
```

```ts
// hooks/useNotifications.ts
export const useNotificationsQuery = () => {
  const { setInitialNotifications } = useNotificationStore();
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationService.list,
    onSuccess: (data) => setInitialNotifications(data.content),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: (id) => markAsRead(id), // Optimistic update
    onError: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
};
```

---

### 3.3 Axios API Client Setup

```ts
// services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, updateToken } = useAuthStore.getState();
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        updateToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. State Flow Summary

```
WebSocket Event → notificationStore.addNotification() → NotificationPanel re-renders

User logs in → authStore.login() → ProtectedRoute allows access → TanStack Query fetches data

User changes visit status → useMutation → API call → onSuccess invalidates queries → UI refetches
```

---

## 5. Persistence Strategy

| State | Persisted? | Storage | TTL |
|-------|-----------|---------|-----|
| Auth (token, user) | ✅ Yes | localStorage | Until logout or token expiry |
| Notifications | ❌ No | Memory only | Session |
| UI state | ❌ No | Memory only | Session |
| Server data (queries) | ✅ Cached | In-memory (TanStack) | 30–60s stale time |
