package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.response.*;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import ma.fondation.accueil.domain.enums.StatutBadge;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.Badge;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.infrastructure.persistence.repository.BadgeRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ObjetVisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/responsable")
@RequiredArgsConstructor
public class ResponsableController {

    private static final Set<String> STATUTS_PRESENTS = Set.of("EN_LIGNE", "EN_PAUSE", "REUNION");
    private static final long ALERTE_MINUTES = 45;

    private final VisiteRepository visiteRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final BadgeRepository badgeRepo;
    private final ObjetVisiteRepository objetVisiteRepo;

    // ── Stats dashboard ──────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/stats")
    public ResponseEntity<ServiceStatsResponse> getStats(@PathVariable Long serviceId) {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime limite45 = LocalDateTime.now().minusMinutes(ALERTE_MINUTES);

        List<Visite> actives = visiteRepo.findActiveByServiceId(serviceId);
        long enAttente = actives.stream().filter(v -> v.getStatut() == StatutVisite.EN_ATTENTE).count();
        long enCours   = actives.stream().filter(v -> v.getStatut() == StatutVisite.EN_COURS).count();

        List<Badge> badges = badgeRepo.findByServiceIdOrderByCodeAsc(serviceId);
        long disponibles    = badges.stream().filter(b -> b.getStatut() == StatutBadge.DISPONIBLE).count();
        long occupes        = badges.stream().filter(b -> b.getStatut() == StatutBadge.OCCUPE).count();
        long pretARestituer = badges.stream().filter(b -> b.getStatut() == StatutBadge.PRET_A_RESTITUER).count();

        List<Utilisateur> fonctionnaires = utilisateurRepo.findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.FONCTIONNAIRE);
        long presents = fonctionnaires.stream().filter(u -> STATUTS_PRESENTS.contains(u.getStatutPresence())).count();

        return ResponseEntity.ok(ServiceStatsResponse.builder()
                .visitesEnAttente(enAttente)
                .visitesEnCours(enCours)
                .visitesTraiteesAujourdhui(visiteRepo.countTraiteesService(serviceId, debutJour))
                .alertes45Min(visiteRepo.countAlertesService(serviceId, limite45))
                .badgesDisponibles(disponibles)
                .badgesOccupes(occupes)
                .badgesPretARestituer(pretARestituer)
                .totalBadges(badges.size())
                .fonctionnairesPresents(presents)
                .totalFonctionnaires(fonctionnaires.size())
                .build());
    }

    // ── Flux réel ────────────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/flux")
    public ResponseEntity<List<FluxVisiteItem>> getFlux(@PathVariable Long serviceId) {
        LocalDateTime limite45 = LocalDateTime.now().minusMinutes(ALERTE_MINUTES);
        List<Visite> actives = visiteRepo.findActiveByServiceId(serviceId).stream()
                .filter(v -> v.getFonctionnaire() == null || v.getFonctionnaire().getRole() != RoleUtilisateur.RESPONSABLE)
                .collect(Collectors.toList());

        List<FluxVisiteItem> flux = actives.stream().map(v -> {
            long minutes = Duration.between(v.getHeureArrivee(), LocalDateTime.now()).toMinutes();
            return FluxVisiteItem.builder()
                    .visiteId(v.getId())
                    .visiteurNom(v.getVisiteur().getNom() + " " + v.getVisiteur().getPrenom())
                    .fonctionnaireId(v.getFonctionnaire() != null ? v.getFonctionnaire().getId() : null)
                    .fonctionnaireNom(v.getFonctionnaire() != null ? v.getFonctionnaire().getNomComplet() : "—")
                    .statut(v.getStatut().name())
                    .minutesAttente(minutes)
                    .alerte(v.getStatut() == StatutVisite.EN_ATTENTE && v.getHeureArrivee().isBefore(limite45))
                    .badgeCode(v.getBadge() != null ? v.getBadge().getCode() : "—")
                    .motif(v.getObjetVisite() != null ? v.getObjetVisite().getLibelleFr() : "—")
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(flux);
    }

    // ── File d'attente ───────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/file-attente")
    public ResponseEntity<List<VisiteResponse>> getFileAttente(@PathVariable Long serviceId) {
        List<Visite> visites = visiteRepo.findActiveByServiceId(serviceId);
        return ResponseEntity.ok(visites.stream().map(this::mapToVisiteResponse).collect(Collectors.toList()));
    }

    // ── Statut des badges ────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/badges")
    public ResponseEntity<List<Map<String, Object>>> getBadges(@PathVariable Long serviceId) {
        List<Badge> badges = badgeRepo.findByServiceIdOrderByCodeAsc(serviceId);
        List<Map<String, Object>> result = badges.stream().map(b -> Map.<String, Object>of(
                "id",     b.getId(),
                "code",   b.getCode(),
                "statut", b.getStatut().name()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ── Rendement fonctionnaires ─────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/rendement")
    public ResponseEntity<List<RendementFonctionnaireItem>> getRendement(@PathVariable Long serviceId) {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        List<Utilisateur> fonctionnaires = utilisateurRepo.findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.FONCTIONNAIRE);

        List<RendementFonctionnaireItem> rendement = fonctionnaires.stream().map(u -> {
            long enAttente = visiteRepo.findByFonctionnaireIdAndStatut(u.getId(), StatutVisite.EN_ATTENTE).size();
            long enCours   = visiteRepo.findByFonctionnaireIdAndStatut(u.getId(), StatutVisite.EN_COURS).size();
            List<Visite> traitees = visiteRepo.findTraiteesParFonctionnaire(u.getId(), debutJour);

            double tempsMoyen = traitees.stream()
                    .filter(v -> v.getHeureEntree() != null && v.getHeureSortie() != null)
                    .mapToDouble(v -> Duration.between(v.getHeureEntree(), v.getHeureSortie()).toSeconds() / 60.0)
                    .average().orElse(0);

            long totalAujourdhui = traitees.size() + enAttente + enCours;
            double taux = totalAujourdhui > 0 ? (double) traitees.size() / totalAujourdhui * 100 : 0;

            return RendementFonctionnaireItem.builder()
                    .fonctionnaireId(u.getId())
                    .nomComplet(u.getNomComplet())
                    .statutPresence(u.getStatutPresence())
                    .visitesEnAttente(enAttente)
                    .visitesEnCours(enCours)
                    .visitesTraiteesAujourdhui(traitees.size())
                    .tempsTraitementMoyen(Math.round(tempsMoyen * 10.0) / 10.0)
                    .tauxOccupation(Math.round(taux * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(rendement);
    }

    // ── Réaffecter une visite ────────────────────────────────────────────────

    @PostMapping("/visites/{visiteId}/reaffecter")
    public ResponseEntity<String> reaffecter(@PathVariable Long visiteId, @RequestParam Long fonctionnaireId) {
        Visite visite = visiteRepo.findById(visiteId)
                .orElseThrow(() -> new RuntimeException("Visite introuvable."));
        Utilisateur nouveau = utilisateurRepo.findById(fonctionnaireId)
                .orElseThrow(() -> new RuntimeException("Fonctionnaire introuvable."));

        visite.setFonctionnaire(nouveau);
        visite.setStatut(StatutVisite.EN_ATTENTE);
        visiteRepo.save(visite);

        return ResponseEntity.ok("Visite réaffectée à " + nouveau.getNomComplet());
    }

    // ── Rapport ──────────────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/rapport")
    public ResponseEntity<RapportResponse> getRapport(
            @PathVariable Long serviceId,
            @RequestParam(defaultValue = "JOUR") String periode) {

        LocalDateTime debut;
        LocalDateTime fin = LocalDateTime.now();

        switch (periode.toUpperCase()) {
            case "MOIS"  -> debut = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
            case "ANNEE" -> debut = LocalDate.now().with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
            default      -> debut = LocalDate.now().atStartOfDay();
        }

        List<Visite> visites = visiteRepo.findByServiceIdBetween(serviceId, debut, fin);

        long terminees  = visites.stream().filter(v -> v.getStatut() == StatutVisite.TERMINEE || v.getStatut() == StatutVisite.CLOTUREE).count();
        long enCours    = visites.stream().filter(v -> v.getStatut() == StatutVisite.EN_COURS).count();
        long enAttente  = visites.stream().filter(v -> v.getStatut() == StatutVisite.EN_ATTENTE).count();

        double tempsAttenteMoyen = visites.stream()
                .filter(v -> v.getHeureAcceptation() != null)
                .mapToDouble(v -> Duration.between(v.getHeureArrivee(), v.getHeureAcceptation()).toSeconds() / 60.0)
                .average().orElse(0);

        double tempsTraitementMoyen = visites.stream()
                .filter(v -> v.getHeureEntree() != null && v.getHeureSortie() != null)
                .mapToDouble(v -> Duration.between(v.getHeureEntree(), v.getHeureSortie()).toSeconds() / 60.0)
                .average().orElse(0);

        // Rendement par fonctionnaire sur la période
        List<Utilisateur> fonctionnaires = utilisateurRepo.findByServiceIdAndRoleAndActifTrue(serviceId, RoleUtilisateur.FONCTIONNAIRE);
        Map<Long, List<Visite>> parFonctionnaire = visites.stream()
                .filter(v -> v.getFonctionnaire() != null)
                .collect(Collectors.groupingBy(v -> v.getFonctionnaire().getId()));

        List<RendementFonctionnaireItem> rendement = fonctionnaires.stream().map(u -> {
            List<Visite> fctVisites = parFonctionnaire.getOrDefault(u.getId(), List.of());
            long fctTerminees = fctVisites.stream().filter(v -> v.getStatut() == StatutVisite.TERMINEE || v.getStatut() == StatutVisite.CLOTUREE).count();
            double fctTempsMoyen = fctVisites.stream()
                    .filter(v -> v.getHeureEntree() != null && v.getHeureSortie() != null)
                    .mapToDouble(v -> Duration.between(v.getHeureEntree(), v.getHeureSortie()).toSeconds() / 60.0)
                    .average().orElse(0);
            double fctTaux = fctVisites.isEmpty() ? 0 : (double) fctTerminees / fctVisites.size() * 100;
            return RendementFonctionnaireItem.builder()
                    .fonctionnaireId(u.getId())
                    .nomComplet(u.getNomComplet())
                    .statutPresence(u.getStatutPresence())
                    .visitesEnAttente(fctVisites.stream().filter(v -> v.getStatut() == StatutVisite.EN_ATTENTE).count())
                    .visitesEnCours(fctVisites.stream().filter(v -> v.getStatut() == StatutVisite.EN_COURS).count())
                    .visitesTraiteesAujourdhui(fctTerminees)
                    .tempsTraitementMoyen(Math.round(fctTempsMoyen * 10.0) / 10.0)
                    .tauxOccupation(Math.round(fctTaux * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(RapportResponse.builder()
                .periode(periode.toUpperCase())
                .debut(debut)
                .fin(fin)
                .totalVisites(visites.size())
                .visitesTerminees(terminees)
                .visitesEnCours(enCours)
                .visitesEnAttente(enAttente)
                .tempsAttenteMoyen(Math.round(tempsAttenteMoyen * 10.0) / 10.0)
                .tempsTraitementMoyen(Math.round(tempsTraitementMoyen * 10.0) / 10.0)
                .rendementParFonctionnaire(rendement)
                .visites(visites.stream().map(this::mapToVisiteResponse).collect(Collectors.toList()))
                .build());
    }

    // ── Visites par jour (30 derniers jours) ─────────────────────────────────

    @GetMapping("/service/{serviceId}/visites-par-jour")
    public ResponseEntity<List<Map<String, Object>>> getVisitesParJour(@PathVariable Long serviceId) {
        LocalDateTime debut = LocalDate.now().minusDays(29).atStartOfDay();
        LocalDateTime fin   = LocalDateTime.now();
        List<Visite> visites = visiteRepo.findByServiceIdBetween(serviceId, debut, fin);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        Map<String, Long> parJour = visites.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getHeureArrivee().toLocalDate().format(fmt),
                        Collectors.counting()
                ));

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            String label = LocalDate.now().minusDays(i).format(fmt);
            result.add(Map.of("jour", label, "visites", parJour.getOrDefault(label, 0L)));
        }
        return ResponseEntity.ok(result);
    }

    // ── Top motifs ───────────────────────────────────────────────────────────

    @GetMapping("/service/{serviceId}/top-motifs")
    public ResponseEntity<List<Map<String, Object>>> getTopMotifs(@PathVariable Long serviceId) {
        LocalDateTime debut = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        List<Visite> visites = visiteRepo.findByServiceIdBetween(serviceId, debut, LocalDateTime.now());

        Map<String, Long> parMotif = visites.stream()
                .filter(v -> v.getObjetVisite() != null)
                .collect(Collectors.groupingBy(
                        v -> v.getObjetVisite().getLibelleFr(),
                        Collectors.counting()
                ));

        // Inclure tous les motifs actifs du service, même ceux sans visites ce mois
        List<Map<String, Object>> result = objetVisiteRepo.findByServiceIdAndActifTrue(serviceId).stream()
                .map(m -> Map.<String, Object>of(
                        "motif", m.getLibelleFr(),
                        "count", parMotif.getOrDefault(m.getLibelleFr(), 0L)
                ))
                .sorted(Comparator.<Map<String, Object>, Long>comparing(
                        e -> (Long) e.get("count")).reversed())
                .limit(8)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private VisiteResponse mapToVisiteResponse(Visite v) {
        return VisiteResponse.builder()
                .id(v.getId())
                .visiteurId(v.getVisiteur().getId())
                .visiteurNom(v.getVisiteur().getNom() + " " + v.getVisiteur().getPrenom())
                .typeVisiteur(v.getVisiteur().getType().name())
                .fonctionnaireId(v.getFonctionnaire() != null ? v.getFonctionnaire().getId() : null)
                .fonctionnaireNom(v.getFonctionnaire() != null ? v.getFonctionnaire().getNomComplet() : "—")
                .badgeCode(v.getBadge() != null ? v.getBadge().getCode() : "—")
                .statut(v.getStatut())
                .heureArrivee(v.getHeureArrivee())
                .heureAcceptation(v.getHeureAcceptation())
                .heureEntree(v.getHeureEntree())
                .heureSortie(v.getHeureSortie())
                .heureCloture(v.getHeureCloture())
                .heureRestitutionBadge(v.getHeureRestitutionBadge())
                .motifLibelle(v.getObjetVisite() != null ? v.getObjetVisite().getLibelleFr() : "—")
                .serviceNom(v.getService() != null ? v.getService().getNom() : "—")
                .build();
    }
}
