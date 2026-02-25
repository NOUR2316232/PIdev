package esprit.clinicalservice.repositories;

import esprit.clinicalservice.entities.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientId(Long patientId);

    List<Consultation> findByDoctorId(Long doctorId);

    List<Consultation> findByMedicalHistoryId(Long medicalHistoryId);

    @Query("SELECT DISTINCT c.patientId FROM Consultation c ORDER BY c.patientId")
    List<Long> findDistinctPatientIds();

    @Query("SELECT DISTINCT c.doctorId FROM Consultation c ORDER BY c.doctorId")
    List<Long> findDistinctDoctorIds();
}

