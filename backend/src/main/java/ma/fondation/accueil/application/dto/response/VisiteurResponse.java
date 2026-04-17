package ma.fondation.accueil.application.dto.response;

import lombok.Builder;
import lombok.Data;
import ma.fondation.accueil.domain.enums.StatutAdherent;
import ma.fondation.accueil.domain.enums.TypeVisiteur;

@Data @Builder
public class VisiteurResponse {
    private Long id;
    private String cin;
    private String numAdhesion;
    private String nom;
    private String prenom;
    private String telephone;
    private String sexe;
    private String situationFamiliale;
    private TypeVisiteur type;
    private String lienParente;
    private StatutAdherent statutAdherent;
    private String typeAdherentDetail;
    private String grade;
    private String typeAssurance;
    private String affectation;

    // Infos du parent pour les enfants/conjoints
    private Long parentId;
    private String parentNom;
    private String parentCin;
}
