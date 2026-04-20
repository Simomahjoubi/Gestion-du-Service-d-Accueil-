package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class EvolutionPointItem {
    private String label;
    private long count;
}
