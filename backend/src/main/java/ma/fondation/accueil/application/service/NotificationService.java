package ma.fondation.accueil.application.service;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.model.Visite;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifierArriveeVisiteur(Visite visite) {
        // Notification pour le fonctionnaire assigné
        if (visite.getFonctionnaire() != null) {
            String username = visite.getFonctionnaire().getUsername();
            String message = "Un nouveau visiteur vous est assigné : " + 
                             visite.getVisiteur().getNom() + " " + visite.getVisiteur().getPrenom();
            
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/notifications",
                    message
            );
        }

        // Optionnel: Notifier le chef de service (Responsable)
        // String topicService = "/topic/service/" + visite.getService().getId();
        // messagingTemplate.convertAndSend(topicService, "Nouveau visiteur dans le service");
    }

    public void notifierRestitutionBadge(Visite visite) {
        // Notification pour l'agent d'accueil : le badge est prêt à être restitué
        messagingTemplate.convertAndSend("/topic/badges/restitution", 
            "Visite terminée pour le badge " + visite.getBadge().getCode());
    }

    public void notifierRetardRestitution(Visite visite) {
        // Alerte pour l'agent d'accueil et l'admin : badge non restitué après 45 min
        String alert = "ALERTE: Le badge " + visite.getBadge().getCode() + " n'a pas été restitué (Visite n°" + visite.getId() + ")";
        messagingTemplate.convertAndSend("/topic/badges/alertes", alert);
    }
}
