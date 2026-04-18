package ma.fondation.accueil.presentation.controller;

import lombok.RequiredArgsConstructor;
import ma.fondation.accueil.application.dto.request.CreateMotifRequest;
import ma.fondation.accueil.application.dto.response.MotifDetailResponse;
import ma.fondation.accueil.application.dto.response.VisiteurResponse;
import ma.fondation.accueil.domain.enums.AlgorithmeAffectation;
import ma.fondation.accueil.domain.enums.StatutAdherent;
import ma.fondation.accueil.domain.enums.TypeAffectationMotif;
import ma.fondation.accueil.domain.enums.TypeVisiteur;
import ma.fondation.accueil.domain.model.MotifAffectation;
import ma.fondation.accueil.domain.model.ObjetVisite;
import ma.fondation.accueil.domain.model.ReferenceItem;
import ma.fondation.accueil.domain.model.ServiceEntity;
import ma.fondation.accueil.domain.model.Utilisateur;
import ma.fondation.accueil.domain.model.Visiteur;
import ma.fondation.accueil.infrastructure.persistence.repository.MotifAffectationRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ObjetVisiteRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ReferenceItemRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.ServiceRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.UtilisateurRepository;
import ma.fondation.accueil.infrastructure.persistence.repository.VisiteurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository utilisateurRepo;
    private final ServiceRepository serviceRepo;
    private final ObjetVisiteRepository motifRepo;
    private final MotifAffectationRepository motifAffectationRepo;
    private final VisiteurRepository visiteurRepo;
    private final ReferenceItemRepository referenceRepo;
    // Assuming BCryptPasswordEncoder is available or should be used for security
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

    // --- GESTION DES VISITEURS / ADHÉRENTS ---

    @GetMapping("/visiteurs")
    public List<VisiteurResponse> getAllVisiteurs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String affectation,
            @RequestParam(required = false) String typeDetail,
            @RequestParam(required = false) String typeAssurance) {

        TypeVisiteur typeEnum = (type != null && !type.isBlank())
                ? TypeVisiteur.valueOf(type) : null;
        StatutAdherent statutEnum = (statut != null && !statut.isBlank())
                ? StatutAdherent.valueOf(statut) : null;

        String q   = (query         != null && !query.isBlank())         ? query.trim()         : null;
        String aff = (affectation   != null && !affectation.isBlank())   ? affectation.trim()   : null;
        String td  = (typeDetail    != null && !typeDetail.isBlank())     ? typeDetail.trim()    : null;
        String ta  = (typeAssurance != null && !typeAssurance.isBlank())  ? typeAssurance.trim() : null;

        List<Visiteur> visiteurs = visiteurRepo.search(q, typeEnum, statutEnum, aff, td, ta);
        return visiteurs.stream().map(this::toVisiteurResponse).toList();
    }

    @PostMapping("/visiteurs")
    public ResponseEntity<?> createVisiteur(@RequestBody java.util.Map<String, Object> data) {
        String cin    = str(data, "cin");
        String numAdh = str(data, "numAdhesion");
        if (cin != null && visiteurRepo.findByCin(cin).isPresent())
            return ResponseEntity.status(409).body(java.util.Map.of("error", "Ce CIN est déjà enregistré pour un autre visiteur."));
        if (numAdh != null && visiteurRepo.findByNumAdhesion(numAdh).isPresent())
            return ResponseEntity.status(409).body(java.util.Map.of("error", "Ce numéro d'adhésion est déjà enregistré pour un autre adhérent."));
        try {
            Visiteur v = buildVisiteurFromMap(new Visiteur(), data);
            return ResponseEntity.ok(toVisiteurResponse(visiteurRepo.save(v)));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", "CIN ou numéro d'adhésion déjà existant."));
        }
    }

    @PutMapping("/visiteurs/{id}")
    public ResponseEntity<?> updateVisiteur(@PathVariable Long id,
                                            @RequestBody java.util.Map<String, Object> data) {
        return visiteurRepo.findById(id).map(v -> {
            String cin    = str(data, "cin");
            String numAdh = str(data, "numAdhesion");
            if (cin != null && visiteurRepo.findByCin(cin).filter(ex -> !ex.getId().equals(id)).isPresent())
                return ResponseEntity.<Object>status(409).body(java.util.Map.of("error", "Ce CIN est déjà enregistré pour un autre visiteur."));
            if (numAdh != null && visiteurRepo.findByNumAdhesion(numAdh).filter(ex -> !ex.getId().equals(id)).isPresent())
                return ResponseEntity.<Object>status(409).body(java.util.Map.of("error", "Ce numéro d'adhésion est déjà enregistré pour un autre adhérent."));
            try {
                buildVisiteurFromMap(v, data);
                return ResponseEntity.<Object>ok(toVisiteurResponse(visiteurRepo.save(v)));
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.<Object>status(409).body(java.util.Map.of("error", "CIN ou numéro d'adhésion déjà existant."));
            }
        }).orElse(ResponseEntity.<Object>notFound().build());
    }

    @DeleteMapping("/visiteurs/{id}")
    public ResponseEntity<Void> deleteVisiteur(@PathVariable Long id) {
        if (!visiteurRepo.existsById(id)) return ResponseEntity.notFound().build();
        visiteurRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /** Import en masse depuis le frontend (tableau JSON issu du fichier XLS parsé côté client) */
    @PostMapping("/visiteurs/import")
    @Transactional
    public ResponseEntity<java.util.Map<String, Object>> importVisiteurs(
            @RequestBody List<java.util.Map<String, Object>> rows) {
        int ok = 0, skipped = 0;
        for (java.util.Map<String, Object> row : rows) {
            try {
                String cin = str(row, "cin");
                String numAdh = str(row, "numAdhesion");
                boolean exists = (cin != null && visiteurRepo.findByCin(cin).isPresent())
                        || (numAdh != null && visiteurRepo.findByNumAdhesion(numAdh).isPresent());
                if (exists) { skipped++; continue; }
                visiteurRepo.save(buildVisiteurFromMap(new Visiteur(), row));
                ok++;
            } catch (Exception e) { skipped++; }
        }
        return ResponseEntity.ok(java.util.Map.of("importes", ok, "ignores", skipped));
    }

    private Visiteur buildVisiteurFromMap(Visiteur v, java.util.Map<String, Object> d) {
        v.setNom(str(d, "nom"));
        v.setPrenom(str(d, "prenom"));
        v.setCin(str(d, "cin"));
        v.setNumAdhesion(str(d, "numAdhesion"));
        v.setTelephone(str(d, "telephone"));
        v.setSexe(str(d, "sexe"));
        v.setSituationFamiliale(str(d, "situationFamiliale"));
        v.setAffectation(str(d, "affectation"));
        v.setGrade(str(d, "grade"));
        v.setTypeAdherentDetail(str(d, "typeAdherentDetail"));
        v.setTypeAssurance(str(d, "typeAssurance"));
        v.setLienParente(str(d, "lienParente"));
        if (d.get("type") != null) v.setType(TypeVisiteur.valueOf(d.get("type").toString()));
        // Champs réservés à l'adhérent principal
        if (v.getType() == TypeVisiteur.ADHERENT) {
            if (d.get("statutAdherent") != null && !d.get("statutAdherent").toString().isBlank())
                v.setStatutAdherent(StatutAdherent.valueOf(d.get("statutAdherent").toString()));
        } else {
            // Conjoint / Enfant / autres : pas de statut ni d'infos admin
            v.setStatutAdherent(null);
            v.setSituationFamiliale(null);
            v.setNumAdhesion(null);
            v.setTypeAdherentDetail(null);
            v.setGrade(null);
            v.setTypeAssurance(null);
            v.setAffectation(null);
        }
        // Parent linkage pour CONJOINT / ENFANT
        if (d.get("parentId") != null) {
            Long parentId = Long.valueOf(d.get("parentId").toString());
            visiteurRepo.findById(parentId).ifPresent(v::setParent);
        } else if (str(d, "parentCin") != null) {
            visiteurRepo.findByCin(str(d, "parentCin")).ifPresent(v::setParent);
        } else {
            v.setParent(null);
        }
        return v;
    }

    private String str(java.util.Map<String, Object> d, String key) {
        Object val = d.get(key);
        return (val == null || val.toString().isBlank()) ? null : val.toString().trim();
    }

    private VisiteurResponse toVisiteurResponse(Visiteur v) {
        return VisiteurResponse.builder()
                .id(v.getId()).cin(v.getCin()).numAdhesion(v.getNumAdhesion())
                .nom(v.getNom()).prenom(v.getPrenom()).type(v.getType())
                .telephone(v.getTelephone()).sexe(v.getSexe())
                .situationFamiliale(v.getSituationFamiliale())
                .statutAdherent(v.getStatutAdherent()).typeAdherentDetail(v.getTypeAdherentDetail())
                .grade(v.getGrade()).typeAssurance(v.getTypeAssurance())
                .affectation(v.getAffectation()).lienParente(v.getLienParente())
                .parentId(v.getParent() != null ? v.getParent().getId() : null)
                .parentNom(v.getParent() != null ? v.getParent().getNom() + " " + v.getParent().getPrenom() : null)
                .parentCin(v.getParent() != null ? v.getParent().getCin() : null)
                .build();
    }

    // --- GESTION DES UTILISATEURS ---
    @GetMapping("/users")
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepo.findAll();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Utilisateur> getUser(@PathVariable Long id) {
        return utilisateurRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

    @PutMapping("/users/{id}/statut-presence")
    public ResponseEntity<?> updateStatutPresence(@PathVariable Long id,
                                                  @RequestBody java.util.Map<String, String> body) {
        String statut = body.get("statut");
        if (statut == null || statut.isBlank())
            return ResponseEntity.badRequest().body(java.util.Map.of("error","Statut invalide."));
        return utilisateurRepo.findById(id).map(u -> {
            u.setStatutPresence(statut);
            return ResponseEntity.ok(utilisateurRepo.save(u));
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

    /** Retourne les fonctionnaires/agents actifs d'un service (pour les selects du formulaire motif) */
    @GetMapping("/services/{id}/fonctionnaires")
    public List<Utilisateur> getServiceFonctionnaires(@PathVariable Long id) {
        return utilisateurRepo.findByServiceId(id);
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
    public ResponseEntity<ObjetVisite> createMotif(@RequestBody CreateMotifRequest request) {
        ServiceEntity service = serviceRepo.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service introuvable: " + request.getServiceId()));

        TypeAffectationMotif type = request.getTypeAffectation() != null
                ? request.getTypeAffectation()
                : TypeAffectationMotif.ALEATOIRE;

        ObjetVisite motif = ObjetVisite.builder()
                .code(request.getCode())
                .libelleFr(request.getLibelleFr())
                .libelleAr(request.getLibelleAr())
                .service(service)
                .typeAffectation(type)
                // ALEATOIRE → algorithme séquentiel en backend ; SPECIFIQUE → ignoré
                .algorithme(AlgorithmeAffectation.SEQUENTIEL)
                .build();

        ObjetVisite saved = motifRepo.save(motif);

        if (TypeAffectationMotif.SPECIFIQUE.equals(type)) {
            saveMotifAffectation(saved, request.getUser1Id(), 1);
            if (request.getUser2Id() != null) saveMotifAffectation(saved, request.getUser2Id(), 2);
            if (request.getUser3Id() != null) saveMotifAffectation(saved, request.getUser3Id(), 3);
        }

        return ResponseEntity.ok(saved);
    }

    private void saveMotifAffectation(ObjetVisite motif, Long userId, int priorite) {
        if (userId == null) return;
        utilisateurRepo.findById(userId).ifPresent(user ->
                motifAffectationRepo.save(MotifAffectation.builder()
                        .motif(motif)
                        .utilisateur(user)
                        .priorite(priorite)
                        .build())
        );
    }

    /** Détail d'un motif : type d'affectation + utilisateurs assignés */
    @GetMapping("/motifs/{id}")
    public ResponseEntity<MotifDetailResponse> getMotifDetail(@PathVariable Long id) {
        return motifRepo.findById(id).map(motif -> {
            List<MotifAffectation> affectations = motifAffectationRepo.findByMotifIdOrderByPrioriteAsc(id);

            List<MotifDetailResponse.UserSlot> slots = affectations.stream()
                    .map(a -> MotifDetailResponse.UserSlot.builder()
                            .priorite(a.getPriorite())
                            .userId(a.getUtilisateur().getId())
                            .nomComplet(a.getUtilisateur().getNomComplet())
                            .role(a.getUtilisateur().getRole().name())
                            .build())
                    .toList();

            return ResponseEntity.ok(MotifDetailResponse.builder()
                    .id(motif.getId())
                    .code(motif.getCode())
                    .libelleFr(motif.getLibelleFr())
                    .libelleAr(motif.getLibelleAr())
                    .serviceId(motif.getService().getId())
                    .serviceNom(motif.getService().getNom())
                    .typeAffectation(motif.getTypeAffectation())
                    .utilisateurs(slots)
                    .build());
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Mise à jour d'un motif */
    @PutMapping("/motifs/{id}")
    @Transactional
    public ResponseEntity<MotifDetailResponse> updateMotif(@PathVariable Long id,
                                                           @RequestBody CreateMotifRequest request) {
        return motifRepo.findById(id).map(motif -> {
            ServiceEntity service = serviceRepo.findById(request.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service introuvable"));

            TypeAffectationMotif type = request.getTypeAffectation() != null
                    ? request.getTypeAffectation() : TypeAffectationMotif.ALEATOIRE;

            motif.setCode(request.getCode());
            motif.setLibelleFr(request.getLibelleFr());
            motif.setLibelleAr(request.getLibelleAr());
            motif.setService(service);
            motif.setTypeAffectation(type);
            motif.setAlgorithme(AlgorithmeAffectation.SEQUENTIEL);
            ObjetVisite saved = motifRepo.save(motif);

            // Réinitialiser les affectations spécifiques
            motifAffectationRepo.deleteByMotifId(id);
            if (TypeAffectationMotif.SPECIFIQUE.equals(type)) {
                saveMotifAffectation(saved, request.getUser1Id(), 1);
                if (request.getUser2Id() != null) saveMotifAffectation(saved, request.getUser2Id(), 2);
                if (request.getUser3Id() != null) saveMotifAffectation(saved, request.getUser3Id(), 3);
            }

            // Retourner le détail mis à jour
            List<MotifAffectation> affectations = motifAffectationRepo.findByMotifIdOrderByPrioriteAsc(id);
            List<MotifDetailResponse.UserSlot> slots = affectations.stream()
                    .map(a -> MotifDetailResponse.UserSlot.builder()
                            .priorite(a.getPriorite())
                            .userId(a.getUtilisateur().getId())
                            .nomComplet(a.getUtilisateur().getNomComplet())
                            .role(a.getUtilisateur().getRole().name())
                            .build())
                    .toList();

            return ResponseEntity.ok(MotifDetailResponse.builder()
                    .id(saved.getId()).code(saved.getCode()).libelleFr(saved.getLibelleFr())
                    .libelleAr(saved.getLibelleAr()).serviceId(saved.getService().getId())
                    .serviceNom(saved.getService().getNom()).typeAffectation(saved.getTypeAffectation())
                    .utilisateurs(slots).build());
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/motifs/{id}")
    @Transactional
    public ResponseEntity<Void> deleteMotif(@PathVariable Long id) {
        if (motifRepo.existsById(id)) {
            motifAffectationRepo.deleteByMotifId(id);
            motifRepo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- GESTION DES RÉFÉRENCES ---

    @GetMapping("/references")
    public List<ReferenceItem> getReferences(@RequestParam String categorie) {
        return referenceRepo.findByCategorieOrderByOrdreAscValeurAsc(categorie);
    }

    @GetMapping("/references/all")
    public java.util.Map<String, List<ReferenceItem>> getAllReferences() {
        List<String> categories = List.of(
                "TYPE_ADHERENT", "SITUATION_FAMILIALE", "STATUT",
                "TYPE_DETAIL", "GRADE", "TYPE_ASSURANCE",
                "AFFECTATION", "ROLE", "STATUT_PRESENCE");
        java.util.Map<String, List<ReferenceItem>> result = new java.util.LinkedHashMap<>();
        for (String cat : categories) {
            result.put(cat, referenceRepo.findByCategorieOrderByOrdreAscValeurAsc(cat));
        }
        return result;
    }

    @PostMapping("/references")
    public ResponseEntity<?> createReference(@RequestBody java.util.Map<String, Object> data) {
        String categorie = str(data, "categorie");
        String valeur    = str(data, "valeur");
        if (categorie == null || valeur == null)
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Catégorie et valeur sont obligatoires."));
        if (referenceRepo.existsByCategorieAndValeur(categorie, valeur))
            return ResponseEntity.status(409).body(java.util.Map.of("error", "Cette valeur existe déjà dans cette catégorie."));
        int ordre = data.get("ordre") != null ? Integer.parseInt(data.get("ordre").toString()) : 0;
        String description = str(data, "description");
        ReferenceItem saved = referenceRepo.save(ReferenceItem.builder()
                .categorie(categorie).valeur(valeur).ordre(ordre).description(description).build());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/references/{id}")
    public ResponseEntity<?> updateReference(@PathVariable Long id,
                                             @RequestBody java.util.Map<String, Object> data) {
        return referenceRepo.findById(id).map(item -> {
            String valeur = str(data, "valeur");
            if (valeur == null)
                return ResponseEntity.<Object>badRequest().body(java.util.Map.of("error", "La valeur est obligatoire."));
            if (referenceRepo.existsByCategorieAndValeurAndIdNot(item.getCategorie(), valeur, id))
                return ResponseEntity.<Object>status(409).body(java.util.Map.of("error", "Cette valeur existe déjà dans cette catégorie."));
            item.setValeur(valeur);
            item.setDescription(str(data, "description"));
            if (data.get("ordre") != null)
                item.setOrdre(Integer.parseInt(data.get("ordre").toString()));
            return ResponseEntity.<Object>ok(referenceRepo.save(item));
        }).orElse(ResponseEntity.<Object>notFound().build());
    }

    @DeleteMapping("/references/{id}")
    public ResponseEntity<Void> deleteReference(@PathVariable Long id) {
        if (!referenceRepo.existsById(id)) return ResponseEntity.notFound().build();
        referenceRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
