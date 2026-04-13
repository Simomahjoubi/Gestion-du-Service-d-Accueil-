package ma.fondation.accueil.application.dto.request;

import lombok.Data;
import ma.fondation.accueil.domain.enums.TypeAffectationMotif;

@Data
public class CreateMotifRequest {

    private String code;
    private String libelleFr;
    private String libelleAr;
    private Long serviceId;

    /**
     * ALEATOIRE  = distribution aléatoire sur les agents du service.
     * SPECIFIQUE = affecter à des utilisateurs précis (user1, user2, user3).
     */
    private TypeAffectationMotif typeAffectation = TypeAffectationMotif.ALEATOIRE;

    /** Utilisateur principal (obligatoire si typeAffectation = SPECIFIQUE) */
    private Long user1Id;

    /** Utilisateur secondaire (optionnel) */
    private Long user2Id;

    /** Utilisateur tertiaire (optionnel) */
    private Long user3Id;
}
