package ma.fondation.accueil.infrastructure.config;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.model.ReferenceItem;
import ma.fondation.accueil.infrastructure.persistence.repository.ReferenceItemRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReferenceDataInitializer implements ApplicationRunner {

    private final ReferenceItemRepository repo;

    @Override
    public void run(ApplicationArguments args) {
        seed("TYPE_ADHERENT", List.of(
                "ADHERENT", "CONJOINT", "ENFANT", "PARTENAIRE", "MEDECIN", "VIP", "EXTERNE"));

        seed("SITUATION_FAMILIALE", List.of(
                "CELIBATAIRE", "MARIE", "VEUF"));

        seed("STATUT", List.of(
                "ACTIF", "RETRAITE", "RADIE"));

        seed("TYPE_DETAIL", List.of(
                "Budget Général", "Budget Communal", "Protection Civile",
                "DGST", "Agent d'autorité", "Auxiliaire d'autorité"));

        seed("GRADE", List.of(
                "Echelle 6-9", "Administrateur Adjoint", "Administrateur 2ème grade",
                "Caïd", "Khalifa", "Bacha", "Gouverneur", "Wali"));

        seed("TYPE_ASSURANCE", List.of(
                "MI", "MI/FH2", "Non assuré"));

        seed("AFFECTATION", List.of(
                "Rabat", "Salé", "Témara", "Casablanca", "Mohammedia", "Berrechid", "Settat", "Médiouna",
                "Marrakech", "Agadir", "Inezgane", "Aït Melloul", "Tiznit", "Taroudant", "Ouarzazate", "Zagora",
                "Fès", "Meknès", "Ifrane", "Sefrou", "Azrou", "Khénifra",
                "Tanger", "Tétouan", "Chefchaouen", "Al Hoceima", "Larache", "Ksar El Kebir", "Asilah",
                "Oujda", "Nador", "Berkane", "Taourirt", "Guercif", "Jerada",
                "Kénitra", "Khémisset", "Sidi Kacem", "Sidi Slimane",
                "El Jadida", "Safi", "Essaouira", "Azemmour",
                "Béni Mellal", "Khouribga", "Fquih Ben Salah", "Azilal",
                "Guelmim", "Tan Tan", "Sidi Ifni", "Assa",
                "Laâyoune", "Boujdour", "Smara",
                "Dakhla", "Aousserd",
                "Errachidia", "Midelt", "Rich",
                "Taza", "Taounate"));

        seed("ROLE", List.of(
                "AGENT", "FONCTIONNAIRE", "RESPONSABLE", "DIRECTEUR", "ADMIN"));

        seed("STATUT_PRESENCE", List.of(
                "EN_LIGNE", "EN_PAUSE", "REUNION", "CONGE", "HORS_LIGNE"));
    }

    private void seed(String categorie, List<String> valeurs) {
        for (int i = 0; i < valeurs.size(); i++) {
            String valeur = valeurs.get(i);
            if (!repo.existsByCategorieAndValeur(categorie, valeur)) {
                repo.save(ReferenceItem.builder()
                        .categorie(categorie)
                        .valeur(valeur)
                        .ordre(i)
                        .build());
            }
        }
    }
}
