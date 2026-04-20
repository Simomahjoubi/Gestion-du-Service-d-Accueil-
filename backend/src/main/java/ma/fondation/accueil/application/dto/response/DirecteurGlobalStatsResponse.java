package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DirecteurGlobalStatsResponse {
    private String periode;
    private long totalVisites;
    private long visitesTerminees;
    private long visitesEnCours;
    private long visitesEnAttente;
    private long visiteursUniques;
    private long totalServices;
    private long totalFonctionnaires;
    private double tempsAttenteMoyen;
    private double tempsTraitementMoyen;
    private double tauxTraitement;
}
