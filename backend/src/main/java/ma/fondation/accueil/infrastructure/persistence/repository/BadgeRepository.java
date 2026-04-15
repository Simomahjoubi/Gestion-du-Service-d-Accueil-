package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.Badge;
import ma.fondation.accueil.domain.enums.StatutBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByCode(String code);
    Optional<Badge> findFirstByStatut(StatutBadge statut);
    long countByStatut(StatutBadge statut);
    List<Badge> findByServiceIdOrderByCodeAsc(Long serviceId);
    List<Badge> findAllByOrderByCodeAsc();
    boolean existsByCode(String code);
    long countByServiceId(Long serviceId);
}
