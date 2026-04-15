package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.response.VisiteurResponse;
import ma.fondation.accueil.domain.enums.TypeVisiteur;
import ma.fondation.accueil.domain.model.Visiteur;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/visiteurs")
@RequiredArgsConstructor
public class VisiteurController {

    private final VisiteurRepository visiteurRepo;

    @GetMapping("/recherche/cin/{cin}")
    public ResponseEntity<VisiteurResponse> rechercherParCin(@PathVariable String cin) {
        return visiteurRepo.findByCin(cin)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recherche/adhesion/{numAdhesion}")
    public ResponseEntity<VisiteurResponse> rechercherParNumAdhesion(@PathVariable String numAdhesion) {
        return visiteurRepo.findByNumAdhesion(numAdhesion)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recherche/nom")
    public ResponseEntity<List<VisiteurResponse>> rechercherParNom(@RequestParam String query) {
        List<VisiteurResponse> visiteurs = visiteurRepo.search(query, null, null, null, null, null)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visiteurs);
    }

    /** Dossier complet : visiteur + adhérent parent (si conjoint/enfant) + famille */
    @GetMapping("/{id}/dossier")
    public ResponseEntity<Map<String, Object>> getDossier(@PathVariable Long id) {
        return visiteurRepo.findById(id).map(visiteur -> {
            Map<String, Object> dossier = new HashMap<>();
            dossier.put("visiteur", mapToResponse(visiteur));

            Visiteur adherent = (visiteur.getType() == TypeVisiteur.ADHERENT)
                    ? visiteur
                    : visiteur.getParent();

            if (adherent != null) {
                dossier.put("adherent", mapToResponse(adherent));
                dossier.put("famille", visiteurRepo.findByParentId(adherent.getId())
                        .stream().map(this::mapToResponse).toList());
            }
            return ResponseEntity.ok(dossier);
        }).orElse(ResponseEntity.notFound().build());
    }

    private VisiteurResponse mapToResponse(Visiteur v) {
        return VisiteurResponse.builder()
                .id(v.getId())
                .cin(v.getCin())
                .numAdhesion(v.getNumAdhesion())
                .nom(v.getNom())
                .prenom(v.getPrenom())
                .type(v.getType())
                .lienParente(v.getLienParente())
                .statutAdherent(v.getStatutAdherent())
                .typeAdherentDetail(v.getTypeAdherentDetail())
                .grade(v.getGrade())
                .typeAssurance(v.getTypeAssurance())
                .affectation(v.getAffectation())
                .parentNom(v.getParent() != null ? v.getParent().getNom() + " " + v.getParent().getPrenom() : null)
                .parentCin(v.getParent() != null ? v.getParent().getCin() : null)
                .build();
    }
}
