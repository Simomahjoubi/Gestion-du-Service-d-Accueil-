package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByUsername(String username);
    List<Utilisateur> findByServiceId(Long serviceId);
    List<Utilisateur> findByServiceIdAndRoleAndActifTrue(Long serviceId, RoleUtilisateur role);
    List<Utilisateur> findByServiceIdAndActifTrue(Long serviceId);
}
