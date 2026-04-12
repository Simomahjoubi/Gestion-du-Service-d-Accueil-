package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ma.fondation.accueil.domain.enums.AlgorithmeAffectation;

@Entity
@Table(name = "objet_visite")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ObjetVisite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String libelleFr;

    private String libelleAr;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlgorithmeAffectation algorithme = AlgorithmeAffectation.SEQUENTIEL;

    @Builder.Default
    private boolean actif = true;
}
