package ma.fondation.accueil.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.request.CreateVisiteRequest;
import ma.fondation.accueil.application.dto.response.DashboardStatsResponse;
import ma.fondation.accueil.application.dto.response.VisiteResponse;
import ma.fondation.accueil.application.service.VisiteService;
import ma.fondation.accueil.domain.enums.StatutBadge;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.domain.model.Visiteur;
import ma.fondation.accueil.infrastructure.persistence.repository.BadgeRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/visites")
@RequiredArgsConstructor
public class VisiteController {

    private final VisiteService visiteService;
    private final VisiteurRepository visiteurRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final BadgeRepository badgeRepo;
    private final VisiteRepository visiteRepo;

    @GetMapping("/today")
    public ResponseEntity<List<VisiteResponse>> getVisitesToday() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        List<Visite> visites = visiteRepo.findAllToday(debutJour);
        
        return ResponseEntity.ok(visites.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/fonctionnaire/{id}/active")
    public ResponseEntity<List<VisiteResponse>> getVisitesActiveByFonctionnaire(@PathVariable Long id) {
        List<Visite> visitesEnAttente = visiteRepo.findByFonctionnaireIdAndStatut(id, StatutVisite.EN_ATTENTE);
        List<Visite> visitesEnCours = visiteRepo.findByFonctionnaireIdAndStatut(id, StatutVisite.EN_COURS);
        
        List<VisiteResponse> response = new java.util.ArrayList<>();
        visitesEnAttente.forEach(v -> response.add(mapToResponse(v)));
        visitesEnCours.forEach(v -> response.add(mapToResponse(v)));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/today")
    public ResponseEntity<DashboardStatsResponse> getStatsToday() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        
        return ResponseEntity.ok(DashboardStatsResponse.builder()
                .visitesEnAttente(visiteRepo.countEnAttente(debutJour))
                .badgesOccupes(badgeRepo.countByStatut(StatutBadge.OCCUPE) + badgeRepo.countByStatut(StatutBadge.PRET_A_RESTITUER))
                .badgesLibres(badgeRepo.countByStatut(StatutBadge.DISPONIBLE))
                .totalVisitesAujourdhui(visiteRepo.countTotalToday(debutJour))
                .build());
    }

    @PostMapping("/enregistrer")
    public ResponseEntity<VisiteResponse> enregistrerVisite(@Valid @RequestBody CreateVisiteRequest request) {
        Visiteur visiteur = visiteurRepo.findById(request.getVisiteurId())
                .orElseThrow(() -> new RuntimeException("Visiteur introuvable."));

        // TODO: Get current agent from SecurityContext
        // For now, take any agent for testing
        Utilisateur agent = utilisateurRepo.findAll().stream()
                .filter(u -> u.getRole().name().equals("AGENT"))
                .findFirst()
                .orElse(null);

        Visite visite = visiteService.creerVisite(
                visiteur,
                request.getObjetVisiteId(),
                request.getNotes(),
                agent
        );

        return ResponseEntity.ok(mapToResponse(visite));
    }

    private VisiteResponse mapToResponse(Visite visite) {
        Visiteur v = visite.getVisiteur();
        return VisiteResponse.builder()
                .id(visite.getId())
                .visiteurNom(v.getNom() + " " + v.getPrenom())
                .typeVisiteur(v.getType().name())
                .lienParente(v.getLienParente())
                .statutAdherent(v.getStatutAdherent() != null ? v.getStatutAdherent().name() : null)
                .typeAdherentDetail(v.getTypeAdherentDetail())
                .grade(v.getGrade())
                .typeAssurance(v.getTypeAssurance())
                .fonctionnaireNom(visite.getFonctionnaire() != null ? visite.getFonctionnaire().getNomComplet() : "Non assigné")
                .badgeCode(visite.getBadge().getCode())
                .statut(visite.getStatut())
                .heureArrivee(visite.getHeureArrivee())
                .motifLibelle(visite.getObjetVisite().getLibelleFr())
                .serviceNom(visite.getService().getNom())
                .build();
    }

    @PostMapping("/{id}/recevoir")
    public ResponseEntity<String> recevoirVisiteur(@PathVariable Long id) {
        visiteService.recevoirVisiteur(id);
        return ResponseEntity.ok("Visiteur en cours de réception.");
    }

    @PostMapping("/{id}/cloturer")
    public ResponseEntity<String> cloturerVisite(@PathVariable Long id) {
        visiteService.cloturerVisite(id);
        return ResponseEntity.ok("Visite terminée. Badge en attente de restitution.");
    }

    @PostMapping("/restituer-badge")
    public ResponseEntity<String> restituerBadge(@RequestParam String code) {
        visiteService.restituerBadge(code);
        return ResponseEntity.ok("Badge restitué et disponible.");
    }
}
