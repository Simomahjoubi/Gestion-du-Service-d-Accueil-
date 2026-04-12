package ma.fondation.accueil.infrastructure.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fondation.accueil.application.service.NotificationService;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeAlertScheduler {

    private final VisiteRepository visiteRepo;
    private final NotificationService notificationService;

    /**
     * Vérifie toutes les 5 minutes s'il y a des badges non restitués
     * plus de 45 minutes après la clôture par le fonctionnaire.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void verifierBadgesNonRestitues() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(45);
        List<Visite> visitesEnRetard = visiteRepo.findVisitesAlerteBadge(limite);

        if (!visitesEnRetard.isEmpty()) {
            log.warn("{} badge(s) non restitué(s) détecté(s).", visitesEnRetard.size());
            for (Visite v : visitesEnRetard) {
                notificationService.notifierRetardRestitution(v);
            }
        }
    }
}
