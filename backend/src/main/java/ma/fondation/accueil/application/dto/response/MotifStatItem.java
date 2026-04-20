package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class MotifStatItem {
    private String motif;
    private String serviceNom;
    private long count;
}
