package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ma.fondation.accueil.domain.enums.StatutBadge;

@Entity
@Table(name = "badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutBadge statut = StatutBadge.DISPONIBLE;

    private Long visiteCouranteId;
}
