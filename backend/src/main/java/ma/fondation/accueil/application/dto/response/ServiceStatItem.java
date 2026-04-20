package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ServiceStatItem {
    private Long serviceId;
    private String serviceNom;
    private long totalVisites;
    private long visitesTerminees;
    private long visitesEnCours;
    private long visitesEnAttente;
    private double tempsTraitementMoyen;
    private double tauxTraitement;
    private long fonctionnairesCount;
}
