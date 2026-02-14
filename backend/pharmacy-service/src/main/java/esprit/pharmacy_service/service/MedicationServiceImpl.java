package esprit.pharmacy_service.service;

import esprit.pharmacy_service.entity.Medication;
import esprit.pharmacy_service.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements IMedicationService  {

    private final MedicationRepository repository;

    @Override
    public Medication create(Medication medication) {
        return repository.save(medication);
    }

    @Override
    public List<Medication> findAll() {
        return repository.findAll();
    }

    @Override
    public Medication findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));
    }

    @Override
    public Medication update(String id, Medication medication) {
        Medication existing = findById(id);

        existing.setMedicationName(medication.getMedicationName());
        existing.setDosage(medication.getDosage());
        existing.setFrequency(medication.getFrequency());
        existing.setRoute(medication.getRoute());
        existing.setDuration(medication.getDuration());
        existing.setQuantity(medication.getQuantity());
        existing.setStartDate(medication.getStartDate());
        existing.setEndDate(medication.getEndDate());
        existing.setPrescription(medication.getPrescription());

        return repository.save(existing);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }
}
