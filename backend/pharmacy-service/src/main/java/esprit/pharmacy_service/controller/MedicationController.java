package esprit.pharmacy_service.controller;


import esprit.pharmacy_service.entity.Medication;
import esprit.pharmacy_service.service.IMedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medications")
@RequiredArgsConstructor
public class MedicationController {
    private final IMedicationService service;

    @PostMapping
    public Medication create(@RequestBody Medication medication) {
        return service.create(medication);
    }

    @GetMapping
    public List<Medication> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Medication getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public Medication update(
            @PathVariable String id,
            @RequestBody Medication medication) {
        return service.update(id, medication);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
