package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.Visite;
import ma.fondation.accueil.domain.enums.StatutVisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;

public interface VisiteRepository extends JpaRepository<Visite, Long> {
    
    @Query("SELECT v FROM Visite v WHERE v.visiteur.id = :visiteurId AND v.statut NOT IN ('TERMINEE', 'CLOTUREE')")
    Optional<Visite> findActiveByVisiteurId(@Param("visiteurId") Long visiteurId);

    @Query("SELECT v FROM Visite v WHERE v.statut = 'EN_ATTENTE' AND v.heureArrivee <= :limite")
    List<Visite> findOverdueVisits(@Param("limite") LocalDateTime limite);

    @Query("SELECT v FROM Visite v WHERE v.statut = 'TERMINEE' AND v.heureCloture <= :limite")
    List<Visite> findVisitesAlerteBadge(@Param("limite") LocalDateTime limite);

    List<Visite> findByFonctionnaireIdAndStatut(Long fonctionnaireId, StatutVisite statut);

    @Query("SELECT COUNT(v) FROM Visite v WHERE v.fonctionnaire.id = :id AND v.statut IN ('EN_ATTENTE', 'EN_COURS', 'REAFFECTEE')")
    long countNonCloturees(@Param("id") Long fonctionnaireId);

    @Query("SELECT COUNT(v) FROM Visite v WHERE v.statut = 'EN_ATTENTE' AND v.heureArrivee >= :debut")
    long countEnAttente(@Param("debut") LocalDateTime debut);

    @Query("SELECT COUNT(v) FROM Visite v WHERE v.statut IN ('EN_ATTENTE', 'EN_COURS', 'TERMINEE') AND v.heureArrivee >= :debut")
    long countTotalToday(@Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.heureArrivee >= :debut ORDER BY v.heureArrivee DESC")
    List<Visite> findAllToday(@Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.fonctionnaire.id = :id AND v.heureArrivee >= :debut ORDER BY v.heureArrivee DESC")
    List<Visite> findTodayByFonctionnaireId(@Param("id") Long id, @Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.service.id = :serviceId AND v.statut IN ('EN_ATTENTE','EN_COURS','REAFFECTEE') ORDER BY v.heureArrivee ASC")
    List<Visite> findActiveByServiceId(@Param("serviceId") Long serviceId);

    @Query("SELECT v FROM Visite v WHERE v.service.id = :serviceId AND v.heureArrivee >= :debut ORDER BY v.heureArrivee DESC")
    List<Visite> findByServiceIdSince(@Param("serviceId") Long serviceId, @Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.service.id = :serviceId AND v.heureArrivee >= :debut AND v.heureArrivee < :fin ORDER BY v.heureArrivee DESC")
    List<Visite> findByServiceIdBetween(@Param("serviceId") Long serviceId, @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(v) FROM Visite v WHERE v.service.id = :serviceId AND v.statut = 'EN_ATTENTE' AND v.heureArrivee <= :limite")
    long countAlertesService(@Param("serviceId") Long serviceId, @Param("limite") LocalDateTime limite);

    @Query("SELECT COUNT(v) FROM Visite v WHERE v.service.id = :serviceId AND v.statut IN ('TERMINEE','CLOTUREE') AND v.heureArrivee >= :debut")
    long countTraiteesService(@Param("serviceId") Long serviceId, @Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.fonctionnaire.id = :id AND v.statut IN ('TERMINEE','CLOTUREE') AND v.heureArrivee >= :debut")
    List<Visite> findTraiteesParFonctionnaire(@Param("id") Long id, @Param("debut") LocalDateTime debut);

    @Query("SELECT v FROM Visite v WHERE v.heureArrivee >= :debut AND v.heureArrivee < :fin")
    List<Visite> findByHeureArriveeBetween(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);
}
