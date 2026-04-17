package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ma.fondation.accueil.domain.enums.StatutVisite;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "visites")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Visite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visiteur_id", nullable = false)
    private Visiteur visiteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objet_visite_id")
    private ObjetVisite objetVisite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fonctionnaire_id")
    private Utilisateur fonctionnaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_accueil_id")
    private Utilisateur agentAccueil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id")
    private Badge badge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutVisite statut = StatutVisite.EN_ATTENTE;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime heureArrivee = LocalDateTime.now();

    private LocalDateTime heureEntree;
    private LocalDateTime heureSortie;
    private LocalDateTime heureCloture;

    private String notes;

    @CreatedDate
    private LocalDateTime dateCreation;

    @LastModifiedDate
    private LocalDateTime dateModification;
}
