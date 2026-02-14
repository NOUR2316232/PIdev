package esprit.pharmacy_service.service;

import esprit.pharmacy_service.entity.Medication;

import java.util.List;

public interface IMedicationService {
    Medication create(Medication medication);
    List<Medication> findAll();
    Medication findById(String id);
    Medication update(String id, Medication medication);
    void delete(String id);
}
