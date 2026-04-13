package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;
import ma.fondation.accueil.domain.enums.TypeAffectationMotif;

import java.util.List;

@Data
@Builder
public class MotifDetailResponse {

    private Long id;
    private String code;
    private String libelleFr;
    private String libelleAr;
    private Long serviceId;
    private String serviceNom;
    private TypeAffectationMotif typeAffectation;

    /** Utilisateurs assignés (uniquement si SPECIFIQUE), triés par priorité */
    private List<UserSlot> utilisateurs;

    @Data
    @Builder
    public static class UserSlot {
        private int priorite;   // 1, 2 ou 3
        private Long userId;
        private String nomComplet;
        private String role;
    }
}
