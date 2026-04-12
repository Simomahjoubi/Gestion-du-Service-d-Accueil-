package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.domain.enums.StatutVisite;
import ma.fondation.accueil.domain.model.ObjetVisite;
import ma.fondation.accueil.domain.model.ServiceEntity;
import ma.fondation.accueil.infrastructure.persistence.repository.ObjetVisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepo;
    private final ObjetVisiteRepository objetVisiteRepo;

    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        return ResponseEntity.ok(serviceRepo.findAll());
    }

    @GetMapping("/{id}/motifs")
    public ResponseEntity<List<ObjetVisite>> getMotifsByService(@PathVariable Long id) {
        return ResponseEntity.ok(objetVisiteRepo.findByServiceIdAndActifTrue(id));
    }
}
