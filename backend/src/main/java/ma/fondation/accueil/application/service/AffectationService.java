package ma.fondation.accueil.application.service;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import ma.fondation.accueil.domain.enums.TypeAffectationMotif;
import ma.fondation.accueil.domain.model.MotifAffectation;
import ma.fondation.accueil.domain.model.ObjetVisite;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.infrastructure.persistence.repository.MotifAffectationRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AffectationService {

    /** Statuts qui rendent un fonctionnaire indisponible pour recevoir des visiteurs. */
    private static final Set<String> STATUTS_INDISPONIBLES = Set.of("CONGE", "REUNION", "MISSION");

    private final MotifAffectationRepository motifAffectationRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final VisiteRepository visiteRepo;

    /**
     * Détermine le fonctionnaire à affecter.
     *
     * @param objet  motif de visite (contient typeAffectation + service)
     * @param isVip  si vrai, affecter au responsable/chef du service
     */
    public Utilisateur determinerFonctionnaire(ObjetVisite objet, boolean isVip) {
        Long serviceId = objet.getService().getId();

        // ── VIP : toujours vers le responsable (chef) du service ─────────────
        if (isVip) {
            return trouverResponsable(serviceId);
        }

        // ── SPECIFIQUE : priorité 1 → 2 → 3 dans MotifAffectation ───────────
        if (objet.getTypeAffectation() == TypeAffectationMotif.SPECIFIQUE) {
            return appliquerSpecifique(objet.getId());
        }

        // ── ALEATOIRE (défaut) : moins de visites EN_ATTENTE, disponible ─────
        return appliquerAleatoire(serviceId);
    }

    // ── VIP ──────────────────────────────────────────────────────────────────

    private Utilisateur trouverResponsable(Long serviceId) {
        // Chercher un utilisateur avec rôle RESPONSABLE dans ce service
        List<Utilisateur> responsables = utilisateurRepo
                .findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.RESPONSABLE);

        if (!responsables.isEmpty()) {
            // Préférer disponible, sinon prendre le premier quand même (VIP ne peut pas attendre)
            return responsables.stream()
                    .filter(u -> !STATUTS_INDISPONIBLES.contains(u.getStatutPresence()))
                    .findFirst()
                    .orElse(responsables.get(0));
        }

        // Aucun RESPONSABLE configuré → erreur explicite, pas de fallback
        throw new RuntimeException(
            "Aucun responsable de service actif n'est configuré pour ce service. " +
            "Veuillez créer un utilisateur avec le rôle RESPONSABLE."
        );
    }

    // ── SPECIFIQUE ───────────────────────────────────────────────────────────

    private Utilisateur appliquerSpecifique(Long motifId) {
        List<MotifAffectation> priorites = motifAffectationRepo.findByMotifIdOrderByPrioriteAsc(motifId)
                .stream()
                .filter(ma -> ma.getUtilisateur().getRole() != RoleUtilisateur.RESPONSABLE)
                .toList();

        if (priorites.isEmpty()) {
            throw new RuntimeException("Aucun fonctionnaire configuré pour ce motif (SPECIFIQUE).");
        }

        // Parcourir p1 → p2 → p3 ; sauter les indisponibles
        for (MotifAffectation ma : priorites) {
            Utilisateur u = ma.getUtilisateur();
            if (u.isActif() && !STATUTS_INDISPONIBLES.contains(u.getStatutPresence())) {
                return u;
            }
        }

        // Tous indisponibles → préférer REUNION (sera disponible bientôt) sinon p1
        return priorites.stream()
                .map(MotifAffectation::getUtilisateur)
                .filter(u -> "REUNION".equals(u.getStatutPresence()))
                .findFirst()
                .orElse(priorites.get(0).getUtilisateur());
    }

    // ── ALEATOIRE ────────────────────────────────────────────────────────────

    private Utilisateur appliquerAleatoire(Long serviceId) {
        // Uniquement les FONCTIONNAIRE du service (pas le responsable — réservé aux VIP)
        List<Utilisateur> fonctionnaires = utilisateurRepo
                .findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.FONCTIONNAIRE);

        if (fonctionnaires.isEmpty()) {
            throw new RuntimeException("Aucun fonctionnaire actif affecté à ce service.");
        }

        List<Utilisateur> disponibles = fonctionnaires.stream()
                .filter(u -> !STATUTS_INDISPONIBLES.contains(u.getStatutPresence()))
                .toList();

        List<Utilisateur> candidats = disponibles.isEmpty() ? fonctionnaires : disponibles;

        // Parmi les candidats, prendre celui avec le moins de visites NON CLÔTURÉES
        return candidats.stream()
                .min(Comparator.comparingLong(u -> visiteRepo.countNonCloturees(u.getId())))
                .orElse(candidats.get(0));
    }
}
