package esprit.pharmacy_service.repository;

import esprit.pharmacy_service.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, String> {
}
