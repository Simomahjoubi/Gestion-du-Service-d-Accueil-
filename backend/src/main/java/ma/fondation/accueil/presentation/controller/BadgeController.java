package ma.fondation.accueil.presentation.controller;

import lombok.*;
import ma.fondation.accueil.domain.enums.StatutBadge;
import ma.fondation.accueil.domain.model.Badge;
import ma.fondation.accueil.domain.model.ServiceEntity;
import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.infrastructure.persistence.repository.BadgeRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ServiceRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeRepository badgeRepo;
    private final VisiteRepository visiteRepo;
    private final ServiceRepository serviceRepo;

    // ──────────────────────────────────────────────
    // DTO
    // ──────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeDetailDto {
        private Long id;
        private String code;
        private String statut;
        private Long serviceId;
        private String serviceNom;
        private String servicePrefix;
        // Occupied details
        private Long visiteId;
        private String visiteurNom;
        private String staffNom;
        private LocalDateTime dateOccupation;
    }

    // ──────────────────────────────────────────────
    // READ — all badges (admin + agent)
    // ──────────────────────────────────────────────
    @GetMapping
    public List<BadgeDetailDto> getAllBadges(
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) String statut) {

        List<Badge> badges = serviceId != null
                ? badgeRepo.findByServiceIdOrderByCodeAsc(serviceId)
                : badgeRepo.findAllByOrderByCodeAsc();

        if (statut != null && !statut.isBlank()) {
            StatutBadge s = StatutBadge.valueOf(statut);
            badges = badges.stream().filter(b -> b.getStatut() == s).toList();
        }

        List<ServiceEntity> allServices = serviceRepo.findAllByOrderByIdAsc();
        return badges.stream().map(b -> toDto(b, allServices)).toList();
    }

    // ──────────────────────────────────────────────
    // GENERATE — admin creates N badges for a service
    // ──────────────────────────────────────────────
    @PostMapping("/generate")
    public ResponseEntity<?> generateBadges(@RequestBody Map<String, Object> request) {
        Long svcId = Long.valueOf(request.get("serviceId").toString());
        int count  = Integer.parseInt(request.get("count").toString());

        if (count < 1 || count > 50)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le nombre de badges doit être compris entre 1 et 50."));

        ServiceEntity service = serviceRepo.findById(svcId)
                .orElseThrow(() -> new RuntimeException("Service introuvable"));

        List<ServiceEntity> allServices = serviceRepo.findAllByOrderByIdAsc();
        int idx    = IntStream.range(0, allServices.size())
                .filter(i -> allServices.get(i).getId().equals(svcId))
                .findFirst().orElse(0);
        char prefix = (char) ('A' + (idx % 26));

        // Next sequential number for this service
        List<Badge> existing = badgeRepo.findByServiceIdOrderByCodeAsc(svcId);
        int nextNum = existing.stream()
                .mapToInt(b -> {
                    try { return Integer.parseInt(b.getCode().substring(1)); }
                    catch (Exception e) { return 0; }
                })
                .max().orElse(0) + 1;

        List<BadgeDetailDto> created = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String code = String.format("%c%03d", prefix, nextNum + i);
            if (!badgeRepo.existsByCode(code)) {
                Badge saved = badgeRepo.save(Badge.builder()
                        .code(code)
                        .statut(StatutBadge.DISPONIBLE)
                        .service(service)
                        .build());
                created.add(toDto(saved, allServices));
            }
        }
        return ResponseEntity.ok(created);
    }

    // ──────────────────────────────────────────────
    // DELETE — admin removes a free badge
    // ──────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBadge(@PathVariable Long id) {
        return badgeRepo.findById(id).map(badge -> {
            if (badge.getStatut() != StatutBadge.DISPONIBLE)
                return ResponseEntity.status(400)
                        .body((Object) Map.of("error", "Impossible de supprimer un badge actuellement occupé."));
            badgeRepo.deleteById(id);
            return ResponseEntity.ok((Object) Map.of("message", "Badge supprimé."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────
    // LIBERER — agent releases an occupied badge
    // ──────────────────────────────────────────────
    @PutMapping("/{id}/liberer")
    public ResponseEntity<?> libererBadge(@PathVariable Long id) {
        return badgeRepo.findById(id).map(badge -> {
            if (badge.getStatut() == StatutBadge.DISPONIBLE)
                return ResponseEntity.ok((Object) Map.of("message", "Badge déjà libre."));

            badge.setStatut(StatutBadge.DISPONIBLE);
            badge.setVisiteCouranteId(null);
            badgeRepo.save(badge);
            return ResponseEntity.ok((Object) Map.of("message", "Badge libéré avec succès."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────
    // STATS — per-service summary
    // ──────────────────────────────────────────────
    @GetMapping("/stats")
    public List<Map<String, Object>> getStats() {
        List<ServiceEntity> services = serviceRepo.findAllByOrderByIdAsc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < services.size(); i++) {
            ServiceEntity svc = services.get(i);
            List<Badge> badges = badgeRepo.findByServiceIdOrderByCodeAsc(svc.getId());
            long libres   = badges.stream().filter(b -> b.getStatut() == StatutBadge.DISPONIBLE).count();
            long occupes  = badges.stream().filter(b -> b.getStatut() != StatutBadge.DISPONIBLE).count();
            char prefix   = (char) ('A' + (i % 26));
            result.add(Map.of(
                    "serviceId",  svc.getId(),
                    "serviceNom", svc.getNom(),
                    "prefix",     String.valueOf(prefix),
                    "total",      badges.size(),
                    "libres",     libres,
                    "occupes",    occupes
            ));
        }
        return result;
    }

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────
    private BadgeDetailDto toDto(Badge badge, List<ServiceEntity> allServices) {
        String svcNom    = badge.getService() != null ? badge.getService().getNom() : "N/A";
        String svcPrefix = "";
        Long   svcId     = null;
        if (badge.getService() != null) {
            svcId = badge.getService().getId();
            final Long fId = svcId;
            int idx = IntStream.range(0, allServices.size())
                    .filter(i -> allServices.get(i).getId().equals(fId))
                    .findFirst().orElse(0);
            svcPrefix = String.valueOf((char) ('A' + (idx % 26)));
        }

        BadgeDetailDto dto = BadgeDetailDto.builder()
                .id(badge.getId())
                .code(badge.getCode())
                .statut(badge.getStatut().name())
                .serviceId(svcId)
                .serviceNom(svcNom)
                .servicePrefix(svcPrefix)
                .build();

        if (badge.getStatut() != StatutBadge.DISPONIBLE && badge.getVisiteCouranteId() != null) {
            visiteRepo.findById(badge.getVisiteCouranteId()).ifPresent(v -> {
                dto.setVisiteId(v.getId());
                if (v.getVisiteur() != null)
                    dto.setVisiteurNom(v.getVisiteur().getNom() + " " + v.getVisiteur().getPrenom());
                dto.setStaffNom(v.getFonctionnaire() != null
                        ? v.getFonctionnaire().getNomComplet() : "Non assigné");
                dto.setDateOccupation(v.getHeureArrivee());
            });
        }
        return dto;
    }
}
