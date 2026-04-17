# User Flow Documentation
# Service d'Accueil — Mermaid Diagrams

---

## 1. Authentication Flow

```mermaid
flowchart TD
    A([Utilisateur ouvre l'app]) --> B[Page de connexion]
    B --> C[Saisit username + mot de passe]
    C --> D{LDAP valide?}
    D -- Non --> E[Affiche erreur 'Identifiants invalides']
    E --> B
    D -- Oui --> F{Compte actif?}
    F -- Non --> G[Affiche 'Compte désactivé']
    F -- Oui --> H[JWT émis]
    H --> I{Rôle?}
    I -- AGENT --> J[/agent Dashboard]
    I -- FONCTIONNAIRE --> K[/fonctionnaire Dashboard]
    I -- RESPONSABLE --> L[/responsable Dashboard]
    I -- ADMIN --> M[/admin Dashboard]
    I -- DIRECTEUR --> N[/directeur Dashboard]
```

---

## 2. Core Visit Lifecycle — Full Flow

```mermaid
flowchart TD
    V([Visiteur se présente]) --> A1

    subgraph ACCUEIL ["Agent d'accueil"]
        A1[Recherche visiteur CIN / nom / adhésion] --> A2{Trouvé?}
        A2 -- Oui --> A3[Affiche fiche visiteur]
        A2 -- Non --> A4[Saisie manuelle visiteur EXTERNE]
        A4 --> A3
        A3 --> A5[Sélectionne objet de visite]
        A5 --> A6[Système détermine fonctionnaire\nvia algorithme]
        A6 --> A7{Badge disponible?}
        A7 -- Non --> A8[Alerte: aucun badge disponible]
        A7 -- Oui --> A9[Badge attribué → statut OCCUPE]
        A9 --> A10[Notification envoyée au\nfonctionnaire + chef]
        A10 --> A11[Visite créée → statut EN_ATTENTE]
    end

    A11 --> B1

    subgraph POINTAGE_ENTREE ["Entrée — BadgeReader"]
        B1[Visiteur scanne badge à l'entrée] --> B2{Badge valide?}
        B2 -- Non --> B3[Rejet + message erreur\nVisiteur va à l'accueil]
        B2 -- Oui --> B4[Heure d'entrée enregistrée]
        B4 --> B5[Confirmation à l'agent d'accueil]
    end

    B4 --> C1

    subgraph SERVICE ["Fonctionnaire / Responsable"]
        C1[Fonctionnaire reçoit notification] --> C2[Consulte fiche visiteur]
        C2 --> C3[Marque 'Visiteur reçu'\nStatut → EN_COURS]
        C3 --> C4[Traite la demande]
        C4 --> C5{Issue?}
        C5 -- Clôture --> C6[Marque 'Terminé'\nStatut → TERMINEE\nBadge → PRET_A_RESTITUER]
        C5 -- Réaffectation --> C7[Responsable sélectionne\nnouvel agent]
        C7 --> C8[Nouveau fonctionnaire notifié\nStatut → REAFFECTEE]
        C8 --> C1
    end

    C6 --> D1
    C6 --> D2[Notification restitution\nenvoyée à l'agent]

    subgraph SORTIE ["Sortie — BadgeReader + Agent"]
        D1[Visiteur scanne badge à la sortie] --> D3[Heure de sortie enregistrée]
        D3 --> D4[Visiteur remet badge physiquement\nà l'agent d'accueil]
        D4 --> D5[Agent scanne badge retourné]
        D5 --> D6[Badge → DISPONIBLE\nVisite → CLOTUREE]
        D6 --> D7[Visite archivée]
    end
```

---

## 3. Badge Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DISPONIBLE : Création / Restitution

    DISPONIBLE --> OCCUPE : Agent attribue badge\nà nouveau visiteur

    OCCUPE --> PRET_A_RESTITUER : Fonctionnaire / Responsable\nclôture la visite

    PRET_A_RESTITUER --> RESTITUE : Agent scanne badge\nphysiquement rendu

    RESTITUE --> DISPONIBLE : Auto-reset immédiat

    OCCUPE --> OCCUPE : Badge scanné à l'entrée\n(heure enregistrée, statut inchangé)
```

---

## 4. Visit Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> EN_ATTENTE : Visite créée\n(badge attribué)

    EN_ATTENTE --> EN_COURS : Fonctionnaire marque\n'Visiteur reçu'

    EN_COURS --> TERMINEE : Fonctionnaire / Responsable\nclôture le traitement

    EN_COURS --> REAFFECTEE : Responsable réaffecte\nà un autre fonctionnaire

    REAFFECTEE --> EN_ATTENTE : Nouveau fonctionnaire\nprend en charge

    TERMINEE --> CLOTUREE : Agent restitue le badge

    CLOTUREE --> [*] : Archivée
```

---

## 5. Visitor Assignment Algorithm — Sequential

```mermaid
flowchart TD
    Start([Objet de visite sélectionné]) --> Q1[Récupérer liste fonctionnaires\nordonnée par priorité]
    Q1 --> Q2[Fonctionnaire A libre?]
    Q2 -- Oui --> R1[Affecter à A]
    Q2 -- Non --> Q3[Fonctionnaire B libre?]
    Q3 -- Oui --> R2[Affecter à B]
    Q3 -- Non --> Q4[Fonctionnaire C libre?]
    Q4 -- Oui --> R3[Affecter à C]
    Q4 -- Non --> Q5[Tous occupés\nAffecter au file\nla plus courte]
    Q5 --> R4[Affecter au fonctionnaire\navec le moins de visiteurs\nen attente]
    R1 & R2 & R3 & R4 --> End([Fonctionnaire déterminé])
```

---

## 6. Visitor Assignment Algorithm — Priority

```mermaid
flowchart TD
    Start([Objet de visite sélectionné]) --> P1[Fonctionnaire A\npriorité 1]
    P1 --> P2{A disponible\net actif?}
    P2 -- Oui --> R1[Affecter à A]
    P2 -- Non --> P3[Fonctionnaire B\npriorité 2]
    P3 --> P4{B disponible\net actif?}
    P4 -- Oui --> R2[Affecter à B]
    P4 -- Non --> P5[Fonctionnaire C\npriorité 3]
    P5 --> P6{C disponible\net actif?}
    P6 -- Oui --> R3[Affecter à C]
    P6 -- Non --> ERR[Erreur: Aucun fonctionnaire\ndisponible]
    R1 & R2 & R3 --> End([Fonctionnaire déterminé])
```

---

## 7. Badge Overdue Alert Flow

```mermaid
flowchart TD
    Sch([Scheduler toutes les 5 min]) --> Q[Chercher visites avec statut\nTERMINEE > 45 min]
    Q --> Check{Visites trouvées?}
    Check -- Non --> End([Fin])
    Check -- Oui --> Loop[Pour chaque visite en retard]
    Loop --> N1[Envoyer notification\nà l'agent d'accueil]
    Loop --> N2[Envoyer notification\nà l'administrateur]
    N1 & N2 --> End
```

---

## 8. User Onboarding Flow (Admin)

```mermaid
flowchart TD
    A([Admin crée un compte utilisateur]) --> B[Saisit username AD\nnom, prénom, email, rôle, service]
    B --> C{Username existe\ndans AD?}
    C -- Non --> D[Erreur: Compte AD introuvable]
    C -- Oui --> E[Compte créé dans FH2_ACCUEIL_DB]
    E --> F[Utilisateur reçoit email\nde bienvenue]
    F --> G[Utilisateur se connecte\nvia AD credentials]
    G --> H[Accès rôle-based activé]
```

---

## 9. Notification Flow (WebSocket)

```mermaid
sequenceDiagram
    participant A as Agent d'accueil
    participant S as Backend (Spring)
    participant DB as SQL Server
    participant WS as WebSocket Broker
    participant F as Fonctionnaire (browser)
    participant R as Responsable (browser)

    A->>S: POST /visites (visiteurId, objetVisiteId)
    S->>DB: INSERT visite
    S->>DB: UPDATE badge.statut = OCCUPE
    S->>DB: INSERT notification (fonctionnaire)
    S->>DB: INSERT notification (responsable)
    S->>WS: convertAndSendToUser(fonctionnaire, /queue/notifications, payload)
    S->>WS: convertAndSendToUser(responsable, /queue/notifications, payload)
    WS-->>F: Push notification (toast + badge count)
    WS-->>R: Push notification (toast + badge count)
    S-->>A: 201 Created (visite + badge info)
```

---

## 10. Error Handling During User Flows

| Scenario | User-Facing Message | Recovery |
|---------|---------------------|---------|
| Badge unavailable | "Aucun badge disponible. Veuillez attendre." | Agent waits for a badge to be returned |
| Duplicate visit | "Ce visiteur a déjà une visite active." | Agent finds and closes existing visit first |
| Badge scan invalid | "Badge invalide ou déjà utilisé." | Visitor redirected to reception desk |
| LDAP connection failure | "Erreur d'authentification. Contactez l'admin." | Fallback local admin account |
| Session expired | Redirect to login page | User re-authenticates |
| Network error | Toast: "Erreur réseau. Veuillez réessayer." | Retry button shown |

---

## 11. Alternative Flows

### Guest / Walk-in Visitor (EXTERNE)
```mermaid
flowchart TD
    A([Visiteur sans dossier]) --> B[Agent recherche dans DB]
    B --> C{Trouvé?}
    C -- Non --> D[Agent crée profil EXTERNE\nnom, CIN, téléphone]
    D --> E[Continue flux normal]
    C -- Oui --> E
```

### Visit Reassignment Mid-Flow
```mermaid
flowchart TD
    A([Visite EN_COURS]) --> B[Responsable constate\nmauvaise affectation]
    B --> C[Sélectionne nouveau fonctionnaire]
    C --> D[Statut → REAFFECTEE]
    D --> E[Ancien fonctionnaire notifié\nde la réaffectation]
    D --> F[Nouveau fonctionnaire notifié\nde l'arrivée]
    F --> G[Statut → EN_ATTENTE\npour nouveau fonctionnaire]
```
