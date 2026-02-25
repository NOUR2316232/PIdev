package esprit.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow error pages so you can see what's wrong if something fails
                        .requestMatchers("/error").permitAll()
                        // Allow internal services/UI to read static role-based ID lists
                        .requestMatchers("/api/users/patient-ids", "/api/users/doctor-ids").permitAll()
                        // Everything else requires a Keycloak Token
                        .anyRequest().authenticated()
                )
                // This magic line connects to Keycloak based on application.properties
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));

        return http.build();
    }
}
