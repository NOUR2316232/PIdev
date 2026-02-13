package org.example.hospitalizationservice.repository;

import org.example.hospitalizationservice.entities.Hospitalization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalizationRepository extends JpaRepository<Hospitalization, Long> {
}
