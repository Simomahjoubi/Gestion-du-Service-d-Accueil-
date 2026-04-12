package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ma.fondation.accueil.domain.enums.TypeVisiteur;

@Entity
@Table(name = "visiteurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Visiteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String cin;

    @Column(unique = true)
    private String numAdhesion;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeVisiteur type;

    private String telephone;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Visiteur parent;

    private String lienParente; // Ex: CONJOINT, ENFANT_1, etc.

    @Enumerated(EnumType.STRING)
    private ma.fondation.accueil.domain.enums.StatutAdherent statutAdherent; // ACTIF, RETRAITE

    private String typeAdherentDetail; // Budget général, DGST, etc.
    private String grade; // Échelle 6-9, Caïd, etc.
    private String typeAssurance; // Non assuré, MI, MI/FH2
    private String affectation; // Lieu d'affectation
}
