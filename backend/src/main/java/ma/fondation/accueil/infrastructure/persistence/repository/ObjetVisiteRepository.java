package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.ObjetVisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ObjetVisiteRepository extends JpaRepository<ObjetVisite, Long> {
    List<ObjetVisite> findByServiceIdAndActifTrue(Long serviceId);
}
