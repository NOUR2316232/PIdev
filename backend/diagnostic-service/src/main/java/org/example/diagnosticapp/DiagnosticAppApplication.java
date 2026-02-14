package org.example.diagnosticapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DiagnosticAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiagnosticAppApplication.class, args);
        /*return builder.routes() .route("candidat", r->r.path("/mic3/**"))
                .uri("http://localhost:8081"))
        .build()*/
    }

}
