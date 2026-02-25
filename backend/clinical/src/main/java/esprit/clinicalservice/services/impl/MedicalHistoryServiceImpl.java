package esprit.clinicalservice.services.impl;

import esprit.clinicalservice.entities.MedicalHistory;
import esprit.clinicalservice.exceptions.ResourceNotFoundException;
import esprit.clinicalservice.repositories.MedicalHistoryRepository;
import esprit.clinicalservice.services.MedicalHistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalHistoryServiceImpl implements MedicalHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(MedicalHistoryServiceImpl.class);
    private final MedicalHistoryRepository medicalHistoryRepository;

    public MedicalHistoryServiceImpl(MedicalHistoryRepository medicalHistoryRepository) {
        this.medicalHistoryRepository = medicalHistoryRepository;
    }

    @Override
    public MedicalHistory create(MedicalHistory medicalHistory) {
        logger.info("Creating medical history for user: {}", medicalHistory.getUserId());
        return medicalHistoryRepository.save(medicalHistory);
    }

    @Override
    public MedicalHistory update(Long id, MedicalHistory medicalHistory) {
        MedicalHistory existing = getById(id);
        medicalHistory.setId(existing.getId());
        return medicalHistoryRepository.save(medicalHistory);
    }

    @Override
    public void delete(Long id) {
        medicalHistoryRepository.deleteById(id);
    }

    @Override
    public MedicalHistory getById(Long id) {
        logger.info("Fetching medical history with id: {}", id);
        return medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical history not found with id: " + id));
    }

    @Override
    public MedicalHistory getByUserId(Long userId) {
        logger.info("Fetching medical history for user: {}", userId);
        return medicalHistoryRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical history not found for user: " + userId));
    }

    @Override
    public List<MedicalHistory> getAll() {
        return medicalHistoryRepository.findAll();
    }
}

