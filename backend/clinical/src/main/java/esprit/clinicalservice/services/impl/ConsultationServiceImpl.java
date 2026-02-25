package esprit.clinicalservice.services.impl;

import esprit.clinicalservice.entities.Consultation;
import esprit.clinicalservice.exceptions.ResourceNotFoundException;
import esprit.clinicalservice.repositories.ConsultationRepository;
import esprit.clinicalservice.services.ConsultationService;
import esprit.clinicalservice.services.UserDirectoryClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsultationServiceImpl implements ConsultationService {

    private static final Logger logger = LoggerFactory.getLogger(ConsultationServiceImpl.class);
    private final ConsultationRepository consultationRepository;
    private final UserDirectoryClient userDirectoryClient;

    public ConsultationServiceImpl(
            ConsultationRepository consultationRepository,
            UserDirectoryClient userDirectoryClient
    ) {
        this.consultationRepository = consultationRepository;
        this.userDirectoryClient = userDirectoryClient;
    }

    @Override
    public Consultation create(Consultation consultation) {
        logger.info("Creating consultation for patient: {}", consultation.getPatientId());
        return consultationRepository.save(consultation);
    }

    @Override
    public Consultation update(Long id, Consultation consultation) {
        Consultation existing = getById(id);
        consultation.setId(existing.getId());
        return consultationRepository.save(consultation);
    }

    @Override
    public void delete(Long id) {
        consultationRepository.deleteById(id);
    }

    @Override
    public Consultation getById(Long id) {
        logger.info("Fetching consultation with id: {}", id);
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));
    }

    @Override
    public List<Consultation> getAll() {
        return consultationRepository.findAll();
    }

    @Override
    public List<Consultation> getByPatientId(Long patientId) {
        return consultationRepository.findByPatientId(patientId);
    }

    @Override
    public List<Consultation> getByDoctorId(Long doctorId) {
        return consultationRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<Long> getAvailablePatientIds() {
        return userDirectoryClient.getPatientIds();
    }

    @Override
    public List<Long> getAvailableDoctorIds() {
        return userDirectoryClient.getDoctorIds();
    }
}

