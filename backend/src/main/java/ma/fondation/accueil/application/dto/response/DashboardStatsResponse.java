package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long visitesEnAttente;
    private long badgesOccupes;
    private long badgesLibres;
    private long totalVisitesAujourdhui;
}
