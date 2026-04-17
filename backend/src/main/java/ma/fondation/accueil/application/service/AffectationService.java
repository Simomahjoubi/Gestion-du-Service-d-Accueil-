package ma.fondation.accueil.application.service;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.enums.AlgorithmeAffectation;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.AffectationFonctionnaire;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.infrastructure.persistence.repository.AffectationFonctionnaireRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AffectationService {

    private final AffectationFonctionnaireRepository affectationRepo;
    private final VisiteRepository visiteRepo;

    public Utilisateur determinerFonctionnaire(Long serviceId, AlgorithmeAffectation algo) {
        List<AffectationFonctionnaire> affectations = affectationRepo.findByServiceIdAndActifTrueOrderByPrioriteAsc(serviceId);

        if (affectations.isEmpty()) {
            throw new RuntimeException("Aucun fonctionnaire actif affecté à ce service.");
        }

        return switch (algo) {
            case SEQUENTIEL -> appliquerAlgorithmeSequentiel(affectations, serviceId);
            case PRIORITE   -> appliquerAlgorithmePriorite(affectations);
        };
    }

    private Utilisateur appliquerAlgorithmeSequentiel(List<AffectationFonctionnaire> affectations, Long serviceId) {
        // Step 1: Find all free staff (no active visits)
        List<Utilisateur> freeStaff = affectations.stream()
                .map(AffectationFonctionnaire::getFonctionnaire)
                .filter(f -> visiteRepo.findByFonctionnaireIdAndStatut(f.getId(), StatutVisite.EN_COURS).isEmpty())
                .toList();

        if (!freeStaff.isEmpty()) {
            // Find the staff who has 'done' the fewest visits today (simple sequential proxy)
            // or just the next in priority order among free staff.
            return freeStaff.get(0);
        }

        // Step 2: If everyone is busy, find the one with the smallest queue
        return affectations.stream()
                .map(AffectationFonctionnaire::getFonctionnaire)
                .min(Comparator.comparingInt(f -> visiteRepo.findByFonctionnaireIdAndStatut(f.getId(), StatutVisite.EN_ATTENTE).size()))
                .orElse(affectations.get(0).getFonctionnaire());
    }

    private Utilisateur appliquerAlgorithmePriorite(List<AffectationFonctionnaire> affectations) {
        // Priority algorithm gives EVERYTHING to Staff 1 (Priority 1) unless they are busy.
        for (AffectationFonctionnaire aff : affectations) {
            Utilisateur staff = aff.getFonctionnaire();
            boolean isBusy = !visiteRepo.findByFonctionnaireIdAndStatut(staff.getId(), StatutVisite.EN_COURS).isEmpty();
            
            if (!isBusy) {
                return staff;
            }
        }

        // If all are busy, return the one with the highest priority (lowest rank number)
        return affectations.get(0).getFonctionnaire();
    }
}
