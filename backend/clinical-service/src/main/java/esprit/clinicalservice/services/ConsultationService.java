package esprit.clinicalservice.services;

import esprit.clinicalservice.entities.Consultation;

import java.util.List;
import java.util.UUID;

public interface ConsultationService {

    Consultation create(Consultation consultation);

    Consultation update(UUID id, Consultation consultation);

    void delete(UUID id);

    Consultation getById(UUID id);

    List<Consultation> getAll();

    List<Consultation> getByPatientId(UUID patientId);

    List<Consultation> getByDoctorId(UUID doctorId);
}

