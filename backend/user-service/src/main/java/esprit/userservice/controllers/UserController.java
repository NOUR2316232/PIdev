package esprit.userservice.controllers;

import esprit.userservice.entities.enums.Role;
import esprit.userservice.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal Jwt jwt) {

        String subject = jwt.getSubject();
        String username = jwt.getClaim("preferred_username");
        String email = jwt.getClaim("email");
        var user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user != null ? user.getId() : null);
        payload.put("username", username);
        payload.put("email", email);
        payload.put("role", user != null ? user.getRole() : null);
        payload.put("subject", subject);

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/patient-ids")
    public List<Long> getPatientIds() {
        return userRepository.findIdsByRole(Role.PATIENT);
    }

    @GetMapping("/doctor-ids")
    public List<Long> getDoctorIds() {
        return userRepository.findIdsByRole(Role.DOCTOR);
    }

}
