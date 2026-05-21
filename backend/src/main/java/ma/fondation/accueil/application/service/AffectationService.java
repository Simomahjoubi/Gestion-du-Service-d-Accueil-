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

        if (responsables.isEmpty()) {
            throw new RuntimeException(
                "Aucun responsable de service actif n'est configuré pour ce service."
            );
        }

        // Vérifier si au moins un responsable est disponible
        return responsables.stream()
                .filter(u -> !STATUTS_INDISPONIBLES.contains(u.getStatutPresence()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                    "Le responsable de ce service est actuellement indisponible (Congé/Réunion/Mission). " +
                    "Veuillez patienter ou essayer ultérieurement."
                ));
    }

    // ── SPECIFIQUE ───────────────────────────────────────────────────────────

    private Utilisateur appliquerSpecifique(Long motifId) {
        List<MotifAffectation> priorites = motifAffectationRepo.findByMotifIdOrderByPrioriteAsc(motifId);

        if (priorites.isEmpty()) {
            throw new RuntimeException("Aucun fonctionnaire configuré pour ce motif spécifique.");
        }

        // Parcourir p1 → p2 → p3
        for (MotifAffectation ma : priorites) {
            Utilisateur u = ma.getUtilisateur();
            if (!u.isActif()) continue;

            // Si c'est un responsable, on l'affecte même s'il est hors ligne (selon demande utilisateur)
            if (u.getRole() == RoleUtilisateur.RESPONSABLE) {
                return u;
            }

            // Pour les fonctionnaires standards, on vérifie la disponibilité
            if (!STATUTS_INDISPONIBLES.contains(u.getStatutPresence())) {
                return u;
            }
        }

        // Si on arrive ici et qu'il y avait un responsable dans la liste, il aurait été retourné.
        // Donc ici on n'a que des fonctionnaires indisponibles.
        throw new RuntimeException(
            "Tous les fonctionnaires affectés à ce motif sont actuellement indisponibles. " +
            "Veuillez attendre qu'un fonctionnaire se libère ou essayer ultérieurement."
        );
    }

    // ── ALEATOIRE ────────────────────────────────────────────────────────────

    private Utilisateur appliquerAleatoire(Long serviceId) {
        // Uniquement les FONCTIONNAIRE du service
        List<Utilisateur> fonctionnaires = utilisateurRepo
                .findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.FONCTIONNAIRE);

        if (fonctionnaires.isEmpty()) {
            throw new RuntimeException("Aucun fonctionnaire actif n'est affecté à ce service.");
        }

        List<Utilisateur> disponibles = fonctionnaires.stream()
                .filter(u -> !STATUTS_INDISPONIBLES.contains(u.getStatutPresence()))
                .toList();

        if (disponibles.isEmpty()) {
            throw new RuntimeException(
                "Tous les fonctionnaires de ce service sont actuellement indisponibles (Congé/Réunion/Mission). " +
                "Veuillez attendre qu'un fonctionnaire soit libre pour accueillir la visite."
            );
        }

        // Parmi les disponibles, prendre celui avec le moins de visites NON CLÔTURÉES
        return disponibles.stream()
                .min(Comparator.comparingLong(u -> visiteRepo.countNonCloturees(u.getId())))
                .orElse(disponibles.get(0));
    }
}
