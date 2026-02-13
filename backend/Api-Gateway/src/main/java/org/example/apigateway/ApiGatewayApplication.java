package org.example.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

	@Bean
	public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
		return builder.routes()

				// Dialysis Service
				.route("dialysis-service", r -> r
						.path("/dialysis/**")              // Gateway URL prefix
						.filters(f -> f.stripPrefix(1))    // Remove /dialysis before forwarding
						.uri("lb://dialysis-service")      // Eureka service name
				)

				// Hospitalization Service
				.route("hospitalization-service", r -> r
						.path("/hospitalization/**")          // Gateway URL prefix
						.filters(f -> f.stripPrefix(1))       // Remove /hospitalization before forwarding
						.uri("lb://hospitalization-service")  // Eureka service name
				)

				.build();
	}
}
