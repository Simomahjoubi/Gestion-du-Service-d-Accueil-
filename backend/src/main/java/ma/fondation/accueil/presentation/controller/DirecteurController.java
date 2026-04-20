package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.response.*;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.ServiceEntity;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.infrastructure.persistence.repository.ServiceRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/directeur")
@RequiredArgsConstructor
public class DirecteurController {

    private final VisiteRepository visiteRepo;
    private final ServiceRepository serviceRepo;
    private final UtilisateurRepository utilisateurRepo;

    // ── KPIs globaux ─────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<DirecteurGlobalStatsResponse> getGlobalStats(
            @RequestParam(defaultValue = "MOIS") String periode) {

        Periode p = resolvePeriode(periode);
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(p.debut, p.fin);

        long terminees = visites.stream()
                .filter(v -> v.getStatut() == StatutVisite.TERMINEE || v.getStatut() == StatutVisite.CLOTUREE)
                .count();
        long enCours   = visites.stream().filter(v -> v.getStatut() == StatutVisite.EN_COURS).count();
        long enAttente = visites.stream().filter(v -> v.getStatut() == StatutVisite.EN_ATTENTE).count();
        long visiteursUniques = visites.stream()
                .filter(v -> v.getVisiteur() != null)
                .map(v -> v.getVisiteur().getId())
                .distinct().count();

        double tempsAttenteMoyen = visites.stream()
                .filter(v -> v.getHeureAcceptation() != null)
                .mapToDouble(v -> Duration.between(v.getHeureArrivee(), v.getHeureAcceptation()).toSeconds() / 60.0)
                .average().orElse(0);

        double tempsTraitementMoyen = visites.stream()
                .filter(v -> v.getHeureEntree() != null && v.getHeureSortie() != null)
                .mapToDouble(v -> Duration.between(v.getHeureEntree(), v.getHeureSortie()).toSeconds() / 60.0)
                .average().orElse(0);

        double taux = visites.isEmpty() ? 0 : (double) terminees / visites.size() * 100;

        long totalFonctionnaires = utilisateurRepo.findAll().stream()
                .filter(u -> u.getRole() == RoleUtilisateur.FONCTIONNAIRE && u.isActif())
                .count();

        return ResponseEntity.ok(DirecteurGlobalStatsResponse.builder()
                .periode(periode.toUpperCase())
                .totalVisites(visites.size())
                .visitesTerminees(terminees)
                .visitesEnCours(enCours)
                .visitesEnAttente(enAttente)
                .visiteursUniques(visiteursUniques)
                .totalServices(serviceRepo.count())
                .totalFonctionnaires(totalFonctionnaires)
                .tempsAttenteMoyen(round1(tempsAttenteMoyen))
                .tempsTraitementMoyen(round1(tempsTraitementMoyen))
                .tauxTraitement(round1(taux))
                .build());
    }

    // ── Stats par service ────────────────────────────────────────────────────

    @GetMapping("/services-stats")
    public ResponseEntity<List<ServiceStatItem>> getServicesStats(
            @RequestParam(defaultValue = "MOIS") String periode) {

        Periode p = resolvePeriode(periode);
        List<ServiceEntity> services = serviceRepo.findAllByOrderByIdAsc();
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(p.debut, p.fin);

        Map<Long, List<Visite>> parService = visites.stream()
                .filter(v -> v.getService() != null)
                .collect(Collectors.groupingBy(v -> v.getService().getId()));

        List<ServiceStatItem> items = services.stream().map(s -> {
            List<Visite> svcVisites = parService.getOrDefault(s.getId(), List.of());
            long terminees = svcVisites.stream()
                    .filter(v -> v.getStatut() == StatutVisite.TERMINEE || v.getStatut() == StatutVisite.CLOTUREE)
                    .count();
            long enCours   = svcVisites.stream().filter(v -> v.getStatut() == StatutVisite.EN_COURS).count();
            long enAttente = svcVisites.stream().filter(v -> v.getStatut() == StatutVisite.EN_ATTENTE).count();
            double tempsMoyen = svcVisites.stream()
                    .filter(v -> v.getHeureEntree() != null && v.getHeureSortie() != null)
                    .mapToDouble(v -> Duration.between(v.getHeureEntree(), v.getHeureSortie()).toSeconds() / 60.0)
                    .average().orElse(0);
            double taux = svcVisites.isEmpty() ? 0 : (double) terminees / svcVisites.size() * 100;
            long fctCount = utilisateurRepo.findByServiceIdAndRoleAndActifTrue(s.getId(), RoleUtilisateur.FONCTIONNAIRE).size();

            return ServiceStatItem.builder()
                    .serviceId(s.getId())
                    .serviceNom(s.getNom())
                    .totalVisites(svcVisites.size())
                    .visitesTerminees(terminees)
                    .visitesEnCours(enCours)
                    .visitesEnAttente(enAttente)
                    .tempsTraitementMoyen(round1(tempsMoyen))
                    .tauxTraitement(round1(taux))
                    .fonctionnairesCount(fctCount)
                    .build();
        })
        .sorted(Comparator.comparing(ServiceStatItem::getTotalVisites).reversed())
        .collect(Collectors.toList());

        return ResponseEntity.ok(items);
    }

    // ── Top motifs (tous services) ───────────────────────────────────────────

    @GetMapping("/top-motifs")
    public ResponseEntity<List<MotifStatItem>> getTopMotifs(
            @RequestParam(defaultValue = "MOIS") String periode,
            @RequestParam(defaultValue = "10") int limit) {

        Periode p = resolvePeriode(periode);
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(p.debut, p.fin);

        Map<String, long[]> counts = new HashMap<>();
        Map<String, String[]> labels = new HashMap<>();
        for (Visite v : visites) {
            if (v.getObjetVisite() == null) continue;
            String motif = v.getObjetVisite().getLibelleFr();
            String svc   = v.getService() != null ? v.getService().getNom() : "—";
            String key   = motif + "||" + svc;
            counts.computeIfAbsent(key, k -> new long[]{0})[0]++;
            labels.putIfAbsent(key, new String[]{motif, svc});
        }

        List<MotifStatItem> result = counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(limit)
                .map(e -> {
                    String[] l = labels.get(e.getKey());
                    return MotifStatItem.builder()
                            .motif(l[0])
                            .serviceNom(l[1])
                            .count(e.getValue()[0])
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Adhérents récurrents ─────────────────────────────────────────────────

    @GetMapping("/adherents-recurrents")
    public ResponseEntity<List<AdherentRecurrentItem>> getAdherentsRecurrents(
            @RequestParam(defaultValue = "MOIS") String periode,
            @RequestParam(defaultValue = "10") int limit) {

        Periode p = resolvePeriode(periode);
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(p.debut, p.fin);

        Map<Long, List<Visite>> parVisiteur = visites.stream()
                .filter(v -> v.getVisiteur() != null)
                .collect(Collectors.groupingBy(v -> v.getVisiteur().getId()));

        List<AdherentRecurrentItem> result = parVisiteur.entrySet().stream()
                .filter(e -> e.getValue().size() >= 2)
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(limit)
                .map(e -> {
                    var v = e.getValue().get(0).getVisiteur();
                    List<String> services = e.getValue().stream()
                            .filter(x -> x.getService() != null)
                            .map(x -> x.getService().getNom())
                            .distinct().collect(Collectors.toList());
                    List<String> motifs = e.getValue().stream()
                            .filter(x -> x.getObjetVisite() != null)
                            .map(x -> x.getObjetVisite().getLibelleFr())
                            .distinct().collect(Collectors.toList());
                    return AdherentRecurrentItem.builder()
                            .visiteurId(v.getId())
                            .nomComplet(v.getNom() + " " + v.getPrenom())
                            .cin(v.getCin())
                            .typeVisiteur(v.getType() != null ? v.getType().name() : "—")
                            .totalVisites(e.getValue().size())
                            .services(services)
                            .motifs(motifs)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Évolution mensuelle (12 derniers mois) ───────────────────────────────

    @GetMapping("/evolution")
    public ResponseEntity<List<EvolutionPointItem>> getEvolution() {
        YearMonth current = YearMonth.now();
        LocalDateTime debut = current.minusMonths(11).atDay(1).atStartOfDay();
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(debut, LocalDateTime.now());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yy");
        Map<String, Long> parMois = visites.stream()
                .collect(Collectors.groupingBy(
                        v -> YearMonth.from(v.getHeureArrivee()).format(fmt),
                        Collectors.counting()
                ));

        List<EvolutionPointItem> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            String label = current.minusMonths(i).format(fmt);
            result.add(EvolutionPointItem.builder()
                    .label(label)
                    .count(parMois.getOrDefault(label, 0L))
                    .build());
        }
        return ResponseEntity.ok(result);
    }

    // ── Répartition par type de visiteur ─────────────────────────────────────

    @GetMapping("/repartition-visiteurs")
    public ResponseEntity<List<TypeVisiteurStatItem>> getRepartitionVisiteurs(
            @RequestParam(defaultValue = "MOIS") String periode) {

        Periode p = resolvePeriode(periode);
        List<Visite> visites = visiteRepo.findByHeureArriveeBetween(p.debut, p.fin);

        Map<String, Long> parType = visites.stream()
                .filter(v -> v.getVisiteur() != null && v.getVisiteur().getType() != null)
                .collect(Collectors.groupingBy(
                        v -> v.getVisiteur().getType().name(),
                        Collectors.counting()
                ));

        List<TypeVisiteurStatItem> result = parType.entrySet().stream()
                .map(e -> TypeVisiteurStatItem.builder().type(e.getKey()).count(e.getValue()).build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Periode resolvePeriode(String periode) {
        LocalDateTime fin = LocalDateTime.now();
        LocalDateTime debut = switch (periode == null ? "MOIS" : periode.toUpperCase()) {
            case "JOUR"    -> LocalDate.now().atStartOfDay();
            case "SEMAINE" -> LocalDate.now().minusDays(6).atStartOfDay();
            case "ANNEE"   -> LocalDate.now().with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
            default        -> LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        };
        return new Periode(debut, fin);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private record Periode(LocalDateTime debut, LocalDateTime fin) {}
}
