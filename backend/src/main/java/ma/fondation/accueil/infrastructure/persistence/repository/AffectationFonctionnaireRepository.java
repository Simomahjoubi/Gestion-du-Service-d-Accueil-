package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.AffectationFonctionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AffectationFonctionnaireRepository extends JpaRepository<AffectationFonctionnaire, Long> {
    List<AffectationFonctionnaire> findByServiceIdAndActifTrueOrderByPrioriteAsc(Long serviceId);
}
