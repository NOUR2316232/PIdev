package esprit.pharmacy_service.service;

import esprit.pharmacy_service.entity.Enumerations.PrescriptionStatus;
import esprit.pharmacy_service.entity.Prescription;

import java.util.List;

public interface IPrescriptionService {
    Prescription create(Prescription prescription);
    List<Prescription> findAll();
    Prescription findById(String id);
    Prescription updateStatus(String id, PrescriptionStatus status);
    void delete(String id);

}