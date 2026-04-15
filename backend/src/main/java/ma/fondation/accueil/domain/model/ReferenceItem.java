package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reference_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"categorie", "valeur"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReferenceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String categorie; // TYPE_ADHERENT, SITUATION_FAMILIALE, STATUT, TYPE_DETAIL, GRADE, TYPE_ASSURANCE

    @Column(nullable = false, length = 200)
    private String valeur;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer ordre = 0;
}
