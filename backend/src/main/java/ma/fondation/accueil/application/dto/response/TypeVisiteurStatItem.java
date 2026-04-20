package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class TypeVisiteurStatItem {
    private String type;
    private long count;
}
