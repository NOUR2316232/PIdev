package esprit.clinicalservice.controllers;

import esprit.clinicalservice.dtos.MedicalHistoryDTO;
import esprit.clinicalservice.services.MedicalHistoryService;
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
@RequestMapping("/api/medical-histories")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;

    public MedicalHistoryController(MedicalHistoryService medicalHistoryService) {
        this.medicalHistoryService = medicalHistoryService;
    }

    @PostMapping
    public ResponseEntity<MedicalHistoryDTO> create(@Valid @RequestBody MedicalHistoryDTO medicalHistoryDTO) {
        var medicalHistory = MapperUtil.toMedicalHistory(medicalHistoryDTO);
        var saved = medicalHistoryService.create(medicalHistory);
        return ResponseEntity.status(HttpStatus.CREATED).body(MapperUtil.toMedicalHistoryDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalHistoryDTO> update(@PathVariable Long id, @Valid @RequestBody MedicalHistoryDTO medicalHistoryDTO) {
        var medicalHistory = MapperUtil.toMedicalHistory(medicalHistoryDTO);
        var updated = medicalHistoryService.update(id, medicalHistory);
        return ResponseEntity.ok(MapperUtil.toMedicalHistoryDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicalHistoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalHistoryDTO> getById(@PathVariable Long id) {
        var medicalHistory = medicalHistoryService.getById(id);
        return ResponseEntity.ok(MapperUtil.toMedicalHistoryDTO(medicalHistory));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<MedicalHistoryDTO> getByUserId(@PathVariable Long userId) {
        var medicalHistory = medicalHistoryService.getByUserId(userId);
        return ResponseEntity.ok(MapperUtil.toMedicalHistoryDTO(medicalHistory));
    }

    @GetMapping
    public ResponseEntity<List<MedicalHistoryDTO>> getAll() {
        var medicalHistories = medicalHistoryService.getAll();
        return ResponseEntity.ok(medicalHistories.stream()
                .map(MapperUtil::toMedicalHistoryDTO)
                .collect(Collectors.toList()));
    }
}

