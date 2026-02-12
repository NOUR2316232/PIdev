package esprit.clinicalservice.services.impl;

import esprit.clinicalservice.entities.Consultation;
import esprit.clinicalservice.repositories.ConsultationRepository;
import esprit.clinicalservice.services.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;

    @Override
    public Consultation create(Consultation consultation) {
        return consultationRepository.save(consultation);
    }

    @Override
    public Consultation update(UUID id, Consultation consultation) {
        Consultation existing = getById(id);
        consultation.setId(existing.getId());
        return consultationRepository.save(consultation);
    }

    @Override
    public void delete(UUID id) {
        consultationRepository.deleteById(id);
    }

    @Override
    public Consultation getById(UUID id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
    }

    @Override
    public List<Consultation> getAll() {
        return consultationRepository.findAll();
    }

    @Override
    public List<Consultation> getByPatientId(UUID patientId) {
        return consultationRepository.findByPatientId(patientId);
    }

    @Override
    public List<Consultation> getByDoctorId(UUID doctorId) {
        return consultationRepository.findByDoctorId(doctorId);
    }
}

