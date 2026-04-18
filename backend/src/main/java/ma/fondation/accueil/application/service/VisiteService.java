package ma.fondation.accueil.application.service;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.enums.StatutBadge;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.Badge;
import ma.fondation.accueil.domain.model.ObjetVisite;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.domain.model.Visiteur;
import ma.fondation.accueil.infrastructure.persistence.repository.BadgeRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ObjetVisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisiteService {

    private final VisiteRepository visiteRepo;
    private final BadgeRepository badgeRepo;
    private final ObjetVisiteRepository objetVisiteRepo;
    private final AffectationService affectationService;
    private final NotificationService notificationService;

    @Transactional
    public Visite creerVisite(Visiteur visiteur, Long objetVisiteId, String notes, boolean isVip, Utilisateur agent) {
        // 1. Charger le motif
        ObjetVisite objet = objetVisiteRepo.findById(objetVisiteId)
                .orElseThrow(() -> new RuntimeException("Motif de visite introuvable."));

        // 2. Vérifier s'il y a déjà une visite active
        visiteRepo.findActiveByVisiteurId(visiteur.getId())
                .ifPresent(v -> { throw new RuntimeException("Le visiteur a déjà une visite active."); });

        // 3. Assigner un badge disponible du même service que le motif
        Long serviceId = objet.getService().getId();
        Badge badge = badgeRepo.findFirstByServiceIdAndStatut(serviceId, StatutBadge.DISPONIBLE)
                .orElseGet(() -> badgeRepo.findFirstByStatut(StatutBadge.DISPONIBLE)
                        .orElseThrow(() -> new RuntimeException("Aucun badge disponible.")));

        // 4. Déterminer le fonctionnaire via l'algorithme
        Utilisateur fonctionnaire = affectationService.determinerFonctionnaire(objet, isVip);

        // 5. Créer la visite
        Visite visite = Visite.builder()
                .visiteur(visiteur)
                .objetVisite(objet)
                .badge(badge)
                .fonctionnaire(fonctionnaire)
                .service(objet.getService())
                .agentAccueil(agent)
                .statut(StatutVisite.EN_ATTENTE)
                .heureArrivee(LocalDateTime.now())
                .notes(notes)
                .build();

        visite = visiteRepo.save(visite);

        // 6. Mettre à jour le badge
        badge.setStatut(StatutBadge.OCCUPE);
        badge.setVisiteCouranteId(visite.getId());
        badgeRepo.save(badge);

        // 7. Notifier le fonctionnaire (et l'agent) via WebSocket
        notificationService.notifierArriveeVisiteur(visite);

        return visite;
    }

    @Transactional
    public void recevoirVisiteur(Long visiteId) {
        Visite visite = visiteRepo.findById(visiteId)
                .orElseThrow(() -> new RuntimeException("Visite introuvable."));

        LocalDateTime now = LocalDateTime.now();
        visite.setStatut(StatutVisite.EN_COURS);
        visite.setHeureAcceptation(now);
        visite.setHeureEntree(now);
        visiteRepo.save(visite);
    }

    @Transactional
    public void cloturerVisite(Long visiteId) {
        Visite visite = visiteRepo.findById(visiteId)
                .orElseThrow(() -> new RuntimeException("Visite introuvable."));

        visite.setStatut(StatutVisite.TERMINEE);
        visite.setHeureSortie(LocalDateTime.now());
        visite.setHeureCloture(LocalDateTime.now());

        visite.getBadge().setStatut(StatutBadge.PRET_A_RESTITUER);

        visiteRepo.save(visite);
        badgeRepo.save(visite.getBadge());
    }

    @Transactional
    public void restituerBadge(String badgeCode) {
        Badge badge = badgeRepo.findByCode(badgeCode)
                .orElseThrow(() -> new RuntimeException("Badge introuvable."));

        if (badge.getVisiteCouranteId() != null) {
            Visite visite = visiteRepo.findById(badge.getVisiteCouranteId())
                    .orElseThrow(() -> new RuntimeException("Visite associée introuvable."));

            visite.setStatut(StatutVisite.CLOTUREE);
            visiteRepo.save(visite);
        }

        visite.setHeureRestitutionBadge(LocalDateTime.now());
        visiteRepo.save(visite);

        badge.setStatut(StatutBadge.DISPONIBLE);
        badge.setVisiteCouranteId(null);
        badgeRepo.save(badge);
    }
}
