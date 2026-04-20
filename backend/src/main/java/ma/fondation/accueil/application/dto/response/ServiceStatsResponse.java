package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ServiceStatsResponse {
    private long visitesEnAttente;
    private long visitesEnCours;
    private long visitesTraiteesAujourdhui;
    private long alertes45Min;
    private long badgesDisponibles;
    private long badgesOccupes;
    private long badgesPretARestituer;
    private long totalBadges;
    private long fonctionnairesPresents;
    private long totalFonctionnaires;
}
