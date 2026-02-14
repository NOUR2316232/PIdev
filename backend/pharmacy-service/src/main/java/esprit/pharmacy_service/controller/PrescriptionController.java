package esprit.pharmacy_service.controller;

import esprit.pharmacy_service.entity.Enumerations.PrescriptionStatus;
import esprit.pharmacy_service.entity.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import esprit.pharmacy_service.service.IPrescriptionService;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final IPrescriptionService service;


    @PostMapping
    public Prescription create(@RequestBody Prescription prescription) {
        return service.create(prescription);
    }


    @GetMapping
    public List<Prescription> getAll() {
        return service.findAll();
    }


    @GetMapping("/{id}")
    public Prescription getById(@PathVariable String id) {
        return service.findById(id);
    }
    @PutMapping("/{id}/status")
    public Prescription updateStatus(
            @PathVariable String id,
            @RequestParam PrescriptionStatus status) {
        return service.updateStatus(id, status);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
