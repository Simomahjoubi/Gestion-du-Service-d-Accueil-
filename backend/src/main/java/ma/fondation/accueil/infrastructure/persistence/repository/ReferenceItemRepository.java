package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.model.ReferenceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceItemRepository extends JpaRepository<ReferenceItem, Long> {
    List<ReferenceItem> findByCategorieOrderByOrdreAscValeurAsc(String categorie);
    boolean existsByCategorieAndValeur(String categorie, String valeur);
    boolean existsByCategorieAndValeurAndIdNot(String categorie, String valeur, Long id);
}
