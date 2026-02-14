package org.example.diagnosticapp.controllers;

import org.example.diagnosticapp.entities.DiagnosticResult;
import org.example.diagnosticapp.services.DiagnosticResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/diagnostic-results")
public class DiagnosticResultController {
    @Autowired
    private DiagnosticResultService service;

    @GetMapping
    public List<DiagnosticResult> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public DiagnosticResult getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public DiagnosticResult create(@RequestBody DiagnosticResult result) { return service.save(result); }

    // AJOUT DE LA MÉTHODE UPDATE
    @PutMapping("/{id}")
    public DiagnosticResult update(@PathVariable String id, @RequestBody DiagnosticResult result) {
        result.setId(id); // Force l'ID de l'objet avec celui de l'URL
        return service.save(result);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.deleteById(id); }
}