package esprit.clinicalservice.repositories;

import esprit.clinicalservice.entities.TriageAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriageAssessmentRepository extends JpaRepository<TriageAssessment, Long> {
}
