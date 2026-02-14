package esprit.pharmacy_service.service;

import esprit.pharmacy_service.entity.Enumerations.PrescriptionStatus;
import esprit.pharmacy_service.entity.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import esprit.pharmacy_service.repository.PrescriptionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements IPrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    @Override
    public Prescription create(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> findAll() {
        return prescriptionRepository.findAll();
    }

    @Override
    public Prescription findById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
    }

    @Override
    public Prescription updateStatus(String id, PrescriptionStatus status) {
        Prescription p = findById(id);
        p.setStatus(status);
        return prescriptionRepository.save(p);
    }
    @Override
    public void delete(String id) {
        prescriptionRepository.deleteById(id);
    }

}
