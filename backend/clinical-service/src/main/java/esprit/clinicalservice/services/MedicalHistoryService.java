package esprit.clinicalservice.services;

import esprit.clinicalservice.entities.MedicalHistory;

import java.util.List;
import java.util.UUID;

public interface MedicalHistoryService {

    MedicalHistory create(MedicalHistory medicalHistory);

    MedicalHistory update(UUID id, MedicalHistory medicalHistory);

    void delete(UUID id);

    MedicalHistory getById(UUID id);

    MedicalHistory getByUserId(UUID userId);

    List<MedicalHistory> getAll();
}

