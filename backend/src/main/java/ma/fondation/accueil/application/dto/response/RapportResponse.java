package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class RapportResponse {
    private String periode;
    private LocalDateTime debut;
    private LocalDateTime fin;
    private long totalVisites;
    private long visitesTerminees;
    private long visitesEnCours;
    private long visitesEnAttente;
    private long visitesVip;
    private double tempsAttenteMoyen;
    private double tempsTraitementMoyen;
    private List<RendementFonctionnaireItem> rendementParFonctionnaire;
    private List<VisiteResponse> visites;
}
