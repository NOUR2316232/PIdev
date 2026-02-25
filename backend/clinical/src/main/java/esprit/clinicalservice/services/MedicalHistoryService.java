package esprit.clinicalservice.services;

import esprit.clinicalservice.entities.MedicalHistory;

import java.util.List;

public interface MedicalHistoryService {

    MedicalHistory create(MedicalHistory medicalHistory);

    MedicalHistory update(Long id, MedicalHistory medicalHistory);

    void delete(Long id);

    MedicalHistory getById(Long id);

    MedicalHistory getByUserId(Long userId);

    List<MedicalHistory> getAll();
}

