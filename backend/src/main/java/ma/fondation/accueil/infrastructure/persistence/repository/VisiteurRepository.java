package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.Visiteur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VisiteurRepository extends JpaRepository<Visiteur, Long> {
    Optional<Visiteur> findByCin(String cin);
    Optional<Visiteur> findByNumAdhesion(String numAdhesion);
    java.util.List<Visiteur> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);
}
