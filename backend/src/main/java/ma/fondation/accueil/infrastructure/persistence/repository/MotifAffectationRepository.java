package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.MotifAffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotifAffectationRepository extends JpaRepository<MotifAffectation, Long> {
    List<MotifAffectation> findByMotifIdOrderByPrioriteAsc(Long motifId);

    @Modifying
    @Query("DELETE FROM MotifAffectation ma WHERE ma.motif.id = :motifId")
    void deleteByMotifId(@Param("motifId") Long motifId);
}
