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
        // V4: Le premier visiteur est affecté au fonctionnaire A, le deuxième au B...
        // On considère un objet de visite à affecter :
        // 1. Trouver tous les fonctionnaires libres (pas de visite EN_COURS)
        List<Utilisateur> freeStaff = affectations.stream()
                .map(AffectationFonctionnaire::getFonctionnaire)
                .filter(f -> visiteRepo.findByFonctionnaireIdAndStatut(f.getId(), StatutVisite.EN_COURS).isEmpty())
                .toList();

        if (!freeStaff.isEmpty()) {
            // Parmi les libres, on prend celui qui a la priorité la plus haute (ordre de passage)
            return freeStaff.get(0);
        }

        // 2. Si tous sont occupés, on place en file d'attente du fonctionnaire qui a la file la plus courte
        return affectations.stream()
                .map(AffectationFonctionnaire::getFonctionnaire)
                .min(Comparator.comparingInt(f -> visiteRepo.findByFonctionnaireIdAndStatut(f.getId(), StatutVisite.EN_ATTENTE).size()))
                .orElse(affectations.get(0).getFonctionnaire());
    }

    private Utilisateur appliquerAlgorithmePriorite(List<AffectationFonctionnaire> affectations) {
        // V4: Les visiteurs sont affectés en priorité au fonctionnaire A. 
        // Si A est absent ou en congé, le système affecte automatiquement au B...
        // On interprète "absent/en congé" par "occupé" ou "non actif" dans cette version simplifiée.
        
        for (AffectationFonctionnaire aff : affectations) {
            Utilisateur staff = aff.getFonctionnaire();
            if (!staff.isActif()) continue;

            boolean isBusy = !visiteRepo.findByFonctionnaireIdAndStatut(staff.getId(), StatutVisite.EN_COURS).isEmpty();
            if (!isBusy) {
                return staff;
            }
        }

        // Si tous sont occupés, on respecte la hiérarchie (priorité 1)
        return affectations.stream()
                .filter(a -> a.getFonctionnaire().isActif())
                .map(AffectationFonctionnaire::getFonctionnaire)
                .findFirst()
                .orElse(affectations.get(0).getFonctionnaire());
    }
}
