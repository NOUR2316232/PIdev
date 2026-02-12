package esprit.clinicalservice.services.impl;

import esprit.clinicalservice.entities.MedicalHistory;
import esprit.clinicalservice.repositories.MedicalHistoryRepository;
import esprit.clinicalservice.services.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalHistoryServiceImpl implements MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;

    @Override
    public MedicalHistory create(MedicalHistory medicalHistory) {
        return medicalHistoryRepository.save(medicalHistory);
    }

    @Override
    public MedicalHistory update(UUID id, MedicalHistory medicalHistory) {
        MedicalHistory existing = getById(id);
        medicalHistory.setId(existing.getId());
        return medicalHistoryRepository.save(medicalHistory);
    }

    @Override
    public void delete(UUID id) {
        medicalHistoryRepository.deleteById(id);
    }

    @Override
    public MedicalHistory getById(UUID id) {
        return medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical history not found"));
    }

    @Override
    public MedicalHistory getByUserId(UUID userId) {
        return medicalHistoryRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Medical history not found for user"));
    }

    @Override
    public List<MedicalHistory> getAll() {
        return medicalHistoryRepository.findAll();
    }
}

