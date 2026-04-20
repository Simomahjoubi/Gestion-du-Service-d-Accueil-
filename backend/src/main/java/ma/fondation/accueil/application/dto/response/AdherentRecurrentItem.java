package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class AdherentRecurrentItem {
    private Long visiteurId;
    private String nomComplet;
    private String cin;
    private String typeVisiteur;
    private long totalVisites;
    private List<String> services;
    private List<String> motifs;
}
