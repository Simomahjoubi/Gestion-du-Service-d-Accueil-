package ma.fondation.accueil.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String nomComplet;

    private String email;

    @Column(nullable = true)
    private String password;

    private boolean isChef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleUtilisateur role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ServiceEntity service;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "utilisateur_motifs",
        joinColumns = @JoinColumn(name = "utilisateur_id"),
        inverseJoinColumns = @JoinColumn(name = "motif_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private java.util.Set<ObjetVisite> motifsGeres = new java.util.HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    /** EN_LIGNE | EN_PAUSE | REUNION | CONGE | HORS_LIGNE */
    @Column(name = "statut_presence")
    @Builder.Default
    private String statutPresence = "HORS_LIGNE";

    @CreatedDate
    private LocalDateTime dateCreation;

    @LastModifiedDate
    private LocalDateTime dateModification;
}
