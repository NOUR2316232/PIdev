package esprit.pharmacy_service.repository;

import esprit.pharmacy_service.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationRepository extends JpaRepository<Medication, String> {
}
