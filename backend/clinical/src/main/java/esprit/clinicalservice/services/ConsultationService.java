package esprit.clinicalservice.services;

import esprit.clinicalservice.entities.Consultation;

import java.util.List;

public interface ConsultationService {

    Consultation create(Consultation consultation);

    Consultation update(Long id, Consultation consultation);

    void delete(Long id);

    Consultation getById(Long id);

    List<Consultation> getAll();

    List<Consultation> getByPatientId(Long patientId);

    List<Consultation> getByDoctorId(Long doctorId);

    List<Long> getAvailablePatientIds();

    List<Long> getAvailableDoctorIds();
}

