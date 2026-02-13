package org.example.hospitalizationservice.controller;

import org.example.hospitalizationservice.entities.Hospitalization;
import org.example.hospitalizationservice.service.HospitalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitalizations")
public class HospitalizationController {

    @Autowired
    private HospitalizationService service;

    @GetMapping
    public List<Hospitalization> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Hospitalization getById(@PathVariable Long id) { // <-- Long
        return service.findById(id);
    }

    @PostMapping
    public Hospitalization create(@RequestBody Hospitalization hospitalization) {
        return service.save(hospitalization);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { // <-- Long
        service.deleteById(id);
    }
}
