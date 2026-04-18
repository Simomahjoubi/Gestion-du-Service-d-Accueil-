package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Payload envoyé via WebSocket pour notifier une nouvelle visite.
 * Reçu par le fonctionnaire ET par l'agent (confirmation).
 */
@Data
@Builder
public class NotificationPayload {
    private Long    visiteId;
    private String  type;          // "NOUVELLE_VISITE" | "CONFIRMATION_AGENT"
    private String  visiteurNom;
    private String  motifLibelle;
    private String  badgeCode;
    private String  fonctionnaireNom;
    private String  fonctionnaireId;
    private String  serviceNom;
    private String  heureArrivee;  // ISO string
}
