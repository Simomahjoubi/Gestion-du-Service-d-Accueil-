package ma.fondation.accueil.application.service;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.response.NotificationPayload;
import ma.fondation.accueil.domain.model.Visite;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Notifie le fonctionnaire (nouvelle visite) + l'agent d'accueil (confirmation).
     */
    public void notifierArriveeVisiteur(Visite visite) {
        if (visite.getFonctionnaire() == null) return;

        NotificationPayload payload = NotificationPayload.builder()
                .visiteId(visite.getId())
                .type("NOUVELLE_VISITE")
                .visiteurNom(visite.getVisiteur().getNom() + " " + visite.getVisiteur().getPrenom())
                .motifLibelle(visite.getObjetVisite() != null ? visite.getObjetVisite().getLibelleFr() : "")
                .badgeCode(visite.getBadge() != null ? visite.getBadge().getCode() : "")
                .fonctionnaireNom(visite.getFonctionnaire().getNomComplet())
                .fonctionnaireId(String.valueOf(visite.getFonctionnaire().getId()))
                .serviceNom(visite.getService() != null ? visite.getService().getNom() : "")
                .heureArrivee(visite.getHeureArrivee() != null ? visite.getHeureArrivee().format(FMT) : "")
                .build();

        // → fonctionnaire concerné
        messagingTemplate.convertAndSendToUser(
                visite.getFonctionnaire().getUsername(),
                "/queue/notifications",
                payload
        );

        // → agent d'accueil (confirmation)
        if (visite.getAgentAccueil() != null) {
            NotificationPayload confirmation = NotificationPayload.builder()
                    .visiteId(visite.getId())
                    .type("CONFIRMATION_AGENT")
                    .visiteurNom(visite.getVisiteur().getNom() + " " + visite.getVisiteur().getPrenom())
                    .motifLibelle(visite.getObjetVisite() != null ? visite.getObjetVisite().getLibelleFr() : "")
                    .badgeCode(visite.getBadge() != null ? visite.getBadge().getCode() : "")
                    .fonctionnaireNom(visite.getFonctionnaire().getNomComplet())
                    .fonctionnaireId(String.valueOf(visite.getFonctionnaire().getId()))
                    .serviceNom(visite.getService() != null ? visite.getService().getNom() : "")
                    .heureArrivee(visite.getHeureArrivee() != null ? visite.getHeureArrivee().format(FMT) : "")
                    .build();

            messagingTemplate.convertAndSendToUser(
                    visite.getAgentAccueil().getUsername(),
                    "/queue/notifications",
                    confirmation
            );
        }
    }

    public void notifierRestitutionBadge(Visite visite) {
        messagingTemplate.convertAndSend("/topic/badges/restitution",
            "Visite terminée pour le badge " + visite.getBadge().getCode());
    }

    public void notifierRetardRestitution(Visite visite) {
        String alert = "ALERTE: Le badge " + visite.getBadge().getCode() +
                       " n'a pas été restitué (Visite n°" + visite.getId() + ")";
        messagingTemplate.convertAndSend("/topic/badges/alertes", alert);
    }
}
