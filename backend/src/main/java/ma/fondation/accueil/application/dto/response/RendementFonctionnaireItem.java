package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class RendementFonctionnaireItem {
    private Long fonctionnaireId;
    private String nomComplet;
    private String statutPresence;
    private long visitesEnAttente;
    private long visitesEnCours;
    private long visitesTraiteesAujourdhui;
    private double tempsTraitementMoyen;
    private double tauxOccupation;
}
