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
						.path("/dialysis/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://dialysis-service")
				)

				// Hospitalization Service
				.route("hospitalization-service", r -> r
						.path("/hospitalization/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://hospitalization-service")
				)

				// Pharmacy Service
				.route("pharmacy-service", r -> r
						.path("/pharmacy/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://pharmacy-service")
				)

				// Diagnostic Service ✅
				.route("diagnostic-service", r -> r
						.path("/diagnostic/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://diagnostic-service") // Eureka service name (lowercase)
				)

				.build();
	}

}
