package esprit.clinicalservice.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
public class UserDirectoryClient {

    private static final Logger logger = LoggerFactory.getLogger(UserDirectoryClient.class);
    private static final ParameterizedTypeReference<List<Long>> LONG_LIST_TYPE =
            new ParameterizedTypeReference<>() {};

    private final RestTemplate restTemplate;
    private final String userServiceBaseUrl;

    public UserDirectoryClient(
            RestTemplate restTemplate,
            @Value("${user.service.base-url:http://localhost:8069/api/users}") String userServiceBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    public List<Long> getPatientIds() {
        return fetchIds("/patient-ids");
    }

    public List<Long> getDoctorIds() {
        return fetchIds("/doctor-ids");
    }

    private List<Long> fetchIds(String path) {
        String url = userServiceBaseUrl + path;
        try {
            ResponseEntity<List<Long>> response = restTemplate.exchange(url, HttpMethod.GET, null, LONG_LIST_TYPE);
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception ex) {
            logger.error("Failed to fetch IDs from user-service endpoint {}", url, ex);
            return Collections.emptyList();
        }
    }
}
