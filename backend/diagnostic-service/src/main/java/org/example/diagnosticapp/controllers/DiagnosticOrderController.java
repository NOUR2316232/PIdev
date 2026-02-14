package org.example.diagnosticapp.controllers;

import org.example.diagnosticapp.entities.DiagnosticOrder;
import org.example.diagnosticapp.services.DiagnosticOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/diagnostic-orders")
public class DiagnosticOrderController {

    @Autowired
    private DiagnosticOrderService service;

    @GetMapping
    public List<DiagnosticOrder> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public DiagnosticOrder getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public DiagnosticOrder create(@RequestBody DiagnosticOrder order) {
        return service.save(order);
    }

    // NOUVELLE MÉTHODE AJOUTÉE POUR L'UPDATE (PUT)
    @PutMapping("/{id}")
    public DiagnosticOrder update(@PathVariable String id, @RequestBody DiagnosticOrder order) {
        order.setId(id); // On force l'ID pour s'assurer qu'on modifie la bonne ligne
        return service.save(order);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteById(id);
    }
}