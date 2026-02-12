package esprit.clinicalservice.controllers;

import esprit.clinicalservice.entities.Consultation;
import esprit.clinicalservice.services.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    @PostMapping
    public Consultation create(@RequestBody Consultation consultation) {
        return consultationService.create(consultation);
    }

    @PutMapping("/{id}")
    public Consultation update(@PathVariable UUID id, @RequestBody Consultation consultation) {
        return consultationService.update(id, consultation);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        consultationService.delete(id);
    }

    @GetMapping("/{id}")
    public Consultation getById(@PathVariable UUID id) {
        return consultationService.getById(id);
    }

    @GetMapping
    public List<Consultation> getAll() {
        return consultationService.getAll();
    }

    @GetMapping("/patient/{patientId}")
    public List<Consultation> getByPatientId(@PathVariable UUID patientId) {
        return consultationService.getByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Consultation> getByDoctorId(@PathVariable UUID doctorId) {
        return consultationService.getByDoctorId(doctorId);
    }
}