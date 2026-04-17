package ma.fondation.accueil.infrastructure.config;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.enums.RoleUtilisateur;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
@RequiredArgsConstructor
public class AccountInitializer implements ApplicationRunner {

    private final UtilisateurRepository utilisateurRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(ApplicationArguments args) {
        // Compte admin par défaut (login: admin / password: admin)
        if (!utilisateurRepo.findByUsername("admin").isPresent()) {
            utilisateurRepo.save(Utilisateur.builder()
                    .username("admin")
                    .nomComplet("Administrateur Système")
                    .password(passwordEncoder.encode("admin"))
                    .role(RoleUtilisateur.ADMIN)
                    .actif(true)
                    .statutPresence("HORS_LIGNE")
                    .build());
        }
    }
}
