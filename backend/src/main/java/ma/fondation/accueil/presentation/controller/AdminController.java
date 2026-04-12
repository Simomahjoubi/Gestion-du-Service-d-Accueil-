package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.model.ObjetVisite;
import ma.fondation.accueil.domain.model.ServiceEntity;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.infrastructure.persistence.repository.ObjetVisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ServiceRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository utilisateurRepo;
    private final ServiceRepository serviceRepo;
    private final ObjetVisiteRepository motifRepo;
    // Assuming BCryptPasswordEncoder is available or should be used for security
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

    // --- GESTION DES UTILISATEURS ---
    @GetMapping("/users")
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepo.findAll();
    }

    @PostMapping("/users")
    public Utilisateur createUser(@RequestBody java.util.Map<String, Object> userData) {
        Utilisateur user = new Utilisateur();
        user.setUsername((String) userData.get("username"));
        user.setNomComplet((String) userData.get("nomComplet"));
        user.setPassword(passwordEncoder.encode((String) userData.get("password")));
        user.setRole(ma.fondation.accueil.domain.enums.RoleUtilisateur.valueOf((String) userData.get("role")));
        user.setChef(Boolean.TRUE.equals(userData.get("isChef")));
        user.setActif(Boolean.TRUE.equals(userData.get("actif")));
        
        if (userData.get("serviceId") != null) {
            Long serviceId = Long.valueOf(userData.get("serviceId").toString());
            serviceRepo.findById(serviceId).ifPresent(user::setService);
        }
        
        return utilisateurRepo.save(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Utilisateur> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> userData) {
        return utilisateurRepo.findById(id).map(user -> {
            user.setUsername((String) userData.get("username"));
            user.setNomComplet((String) userData.get("nomComplet"));
            if (userData.get("password") != null && !((String) userData.get("password")).isEmpty()) {
                user.setPassword(passwordEncoder.encode((String) userData.get("password")));
            }
            user.setRole(ma.fondation.accueil.domain.enums.RoleUtilisateur.valueOf((String) userData.get("role")));
            user.setChef(Boolean.TRUE.equals(userData.get("isChef")));
            user.setActif(Boolean.TRUE.equals(userData.get("actif")));
            
            if (userData.get("serviceId") != null) {
                Long serviceId = Long.valueOf(userData.get("serviceId").toString());
                serviceRepo.findById(serviceId).ifPresent(user::setService);
            } else {
                user.setService(null);
            }
            
            return ResponseEntity.ok(utilisateurRepo.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (utilisateurRepo.existsById(id)) {
            utilisateurRepo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- GESTION DES SERVICES ---
    @PostMapping("/services")
    public ServiceEntity createService(@RequestBody ServiceEntity service) {
        return serviceRepo.save(service);
    }

    @GetMapping("/services/{id}/details")
    public ResponseEntity<java.util.Map<String, Object>> getServiceDetails(@PathVariable Long id) {
        return serviceRepo.findById(id).map(service -> {
            java.util.Map<String, Object> details = new java.util.HashMap<>();
            details.put("service", service);
            details.put("staff", utilisateurRepo.findByServiceId(id));
            return ResponseEntity.ok(details);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (serviceRepo.existsById(id)) {
            serviceRepo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- GESTION DES MOTIFS ---
    @PostMapping("/motifs")
    public ObjetVisite createMotif(@RequestBody ObjetVisite motif) {
        return motifRepo.save(motif);
    }

    @DeleteMapping("/motifs/{id}")
    public ResponseEntity<Void> deleteMotif(@PathVariable Long id) {
        if (motifRepo.existsById(id)) {
            motifRepo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
