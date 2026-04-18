package ma.fondation.accueil.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateVisiteRequest {
    @NotNull(message = "L'ID du visiteur est requis.")
    private Long visiteurId;

    @NotNull(message = "L'ID du motif de visite est requis.")
    private Long objetVisiteId;

    private String notes;

    @com.fasterxml.jackson.annotation.JsonProperty("isVip")
    private boolean vip;

    private Long agentId;
}
