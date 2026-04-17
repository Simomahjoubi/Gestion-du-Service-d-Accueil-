package ma.fondation.accueil.infrastructure.persistence.repository;

import ma.fondation.accueil.domain.enums.StatutAdherent;
import ma.fondation.accueil.domain.enums.TypeVisiteur;
import ma.fondation.accueil.domain.model.Visiteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface VisiteurRepository extends JpaRepository<Visiteur, Long> {

    Optional<Visiteur> findByCin(String cin);
    Optional<Visiteur> findByNumAdhesion(String numAdhesion);
    List<Visiteur> findByParentId(Long parentId);

    /** Recherche + filtres combinés (tous les paramètres sont optionnels / nullables) */
    @Query("SELECT v FROM Visiteur v WHERE " +
           "(:query IS NULL OR LOWER(v.nom)    LIKE LOWER(CONCAT('%',:query,'%')) " +
                          "OR LOWER(v.prenom) LIKE LOWER(CONCAT('%',:query,'%')) " +
                          "OR LOWER(v.cin)    LIKE LOWER(CONCAT('%',:query,'%'))) " +
           "AND (:type          IS NULL OR v.type                 = :type) " +
           "AND (:statut        IS NULL OR v.statutAdherent       = :statut) " +
           "AND (:affectation   IS NULL OR LOWER(v.affectation)   LIKE LOWER(CONCAT('%',:affectation,'%'))) " +
           "AND (:typeDetail    IS NULL OR LOWER(v.typeAdherentDetail) LIKE LOWER(CONCAT('%',:typeDetail,'%'))) " +
           "AND (:typeAssurance IS NULL OR LOWER(v.typeAssurance) LIKE LOWER(CONCAT('%',:typeAssurance,'%')))")
    List<Visiteur> search(
            @Param("query")         String query,
            @Param("type")          TypeVisiteur type,
            @Param("statut")        StatutAdherent statut,
            @Param("affectation")   String affectation,
            @Param("typeDetail")    String typeDetail,
            @Param("typeAssurance") String typeAssurance
    );
}
