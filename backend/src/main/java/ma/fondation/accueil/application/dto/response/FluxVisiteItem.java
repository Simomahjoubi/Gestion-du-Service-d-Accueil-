package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class FluxVisiteItem {
    private Long visiteId;
    private String visiteurNom;
    private Long fonctionnaireId;
    private String fonctionnaireNom;
    private String statut;
    private long minutesAttente;
    private boolean alerte;
    private String badgeCode;
    private String motif;
}
