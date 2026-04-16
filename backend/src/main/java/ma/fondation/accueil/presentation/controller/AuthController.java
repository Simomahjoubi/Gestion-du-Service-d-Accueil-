package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Login et mot de passe requis."));

        return utilisateurRepo.findByUsername(username)
            .map(u -> {
                if (!u.isActif())
                    return ResponseEntity.status(403)
                        .<Object>body(Map.of("error", "Compte désactivé."));

                if (!passwordEncoder.matches(password, u.getPassword()))
                    return ResponseEntity.status(401)
                        .<Object>body(Map.of("error", "Identifiants incorrects."));

                Map<String, Object> response = new HashMap<>();
                response.put("id",         u.getId());
                response.put("username",   u.getUsername());
                response.put("nomComplet", u.getNomComplet());
                response.put("role",       u.getRole().name());
                response.put("serviceId",  u.getService() != null ? u.getService().getId()  : null);
                response.put("serviceNom", u.getService() != null ? u.getService().getNom() : null);
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects.")));
    }
}
