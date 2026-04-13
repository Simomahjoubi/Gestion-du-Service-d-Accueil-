package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Liens entre un motif et des utilisateurs spécifiques, avec priorité (1=principal, 2=secondaire, 3=tertiaire).
 * Utilisé uniquement quand le motif a typeAffectation = SPECIFIQUE.
 */
@Entity
@Table(name = "motif_affectation",
        uniqueConstraints = @UniqueConstraint(columnNames = {"motif_id", "priorite"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MotifAffectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motif_id", nullable = false)
    private ObjetVisite motif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    /**
     * 1 = utilisateur principal, 2 = secondaire, 3 = tertiaire
     */
    @Column(nullable = false)
    private Integer priorite;
}
