package esprit.clinicalservice.controllers;

import esprit.clinicalservice.dtos.ConsultationDTO;
import esprit.clinicalservice.services.ConsultationService;
import esprit.clinicalservice.utils.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping
    public ResponseEntity<ConsultationDTO> create(@Valid @RequestBody ConsultationDTO consultationDTO) {
        var consultation = MapperUtil.toConsultation(consultationDTO);
        var saved = consultationService.create(consultation);
        return ResponseEntity.status(HttpStatus.CREATED).body(MapperUtil.toConsultationDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultationDTO> update(@PathVariable Long id, @Valid @RequestBody ConsultationDTO consultationDTO) {
        var consultation = MapperUtil.toConsultation(consultationDTO);
        var updated = consultationService.update(id, consultation);
        return ResponseEntity.ok(MapperUtil.toConsultationDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        consultationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationDTO> getById(@PathVariable Long id) {
        var consultation = consultationService.getById(id);
        return ResponseEntity.ok(MapperUtil.toConsultationDTO(consultation));
    }

    @GetMapping
    public ResponseEntity<List<ConsultationDTO>> getAll() {
        var consultations = consultationService.getAll();
        return ResponseEntity.ok(consultations.stream()
                .map(MapperUtil::toConsultationDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationDTO>> getByPatientId(@PathVariable Long patientId) {
        var consultations = consultationService.getByPatientId(patientId);
        return ResponseEntity.ok(consultations.stream()
                .map(MapperUtil::toConsultationDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ConsultationDTO>> getByDoctorId(@PathVariable Long doctorId) {
        var consultations = consultationService.getByDoctorId(doctorId);
        return ResponseEntity.ok(consultations.stream()
                .map(MapperUtil::toConsultationDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/patient-ids")
    public ResponseEntity<List<Long>> getAvailablePatientIds() {
        return ResponseEntity.ok(consultationService.getAvailablePatientIds());
    }

    @GetMapping("/doctor-ids")
    public ResponseEntity<List<Long>> getAvailableDoctorIds() {
        return ResponseEntity.ok(consultationService.getAvailableDoctorIds());
    }
}
