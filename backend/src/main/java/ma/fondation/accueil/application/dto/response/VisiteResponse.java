package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;
import ma.fondation.accueil.domain.enums.StatutVisite;
import java.time.LocalDateTime;

@Data @Builder
public class VisiteResponse {
    private Long id;
    private Long visiteurId;
    private String visiteurNom;
    private String typeVisiteur; // ADHERENT, CONJOINT, etc.
    private String lienParente;  // EPOUSE, FILS, etc.
    private String statutAdherent; // ACTIF, RETRAITE
    private String typeAdherentDetail;
    private String grade;
    private String typeAssurance;
    private Long   fonctionnaireId;
    private String fonctionnaireNom;
    private String badgeCode;
    private StatutVisite statut;
    private LocalDateTime heureArrivee;
    private LocalDateTime heureAcceptation;
    private LocalDateTime heureEntree;
    private LocalDateTime heureSortie;
    private LocalDateTime heureCloture;
    private LocalDateTime heureRestitutionBadge;
    private String motifLibelle;
    private String serviceNom;
}
