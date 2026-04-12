package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "affectation_fonctionnaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AffectationFonctionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fonctionnaire_id", nullable = false)
    private Utilisateur fonctionnaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    /**
     * Used for the Priority algorithm (1 = highest priority).
     * Also used as the 'order' for the Sequential algorithm.
     */
    @Column(nullable = false)
    private Integer priorite;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;
}
