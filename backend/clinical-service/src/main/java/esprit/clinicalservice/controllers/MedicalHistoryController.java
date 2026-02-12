package esprit.clinicalservice.controllers;

import esprit.clinicalservice.entities.MedicalHistory;
import esprit.clinicalservice.services.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-histories")
@RequiredArgsConstructor
public class MedicalHistoryController {

    @Autowired
    private MedicalHistoryService medicalHistoryService;

    @PostMapping
    public MedicalHistory create(@RequestBody MedicalHistory medicalHistory) {
        return medicalHistoryService.create(medicalHistory);
    }

    @PutMapping("/{id}")
    public MedicalHistory update(@PathVariable UUID id, @RequestBody MedicalHistory medicalHistory) {
        return medicalHistoryService.update(id, medicalHistory);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        medicalHistoryService.delete(id);
    }

    @GetMapping("/{id}")
    public MedicalHistory getById(@PathVariable UUID id) {
        return medicalHistoryService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public MedicalHistory getByUserId(@PathVariable UUID userId) {
        return medicalHistoryService.getByUserId(userId);
    }

    @GetMapping
    public List<MedicalHistory> getAll() {
        return medicalHistoryService.getAll();
    }
}

