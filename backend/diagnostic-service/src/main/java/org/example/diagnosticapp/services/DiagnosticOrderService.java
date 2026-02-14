package org.example.diagnosticapp.services;

import org.example.diagnosticapp.entities.DiagnosticOrder;
import org.example.diagnosticapp.repositories.DiagnosticOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DiagnosticOrderService {
    @Autowired
    private DiagnosticOrderRepository repository;

    public List<DiagnosticOrder> findAll() { return repository.findAll(); }
    public DiagnosticOrder findById(String id) { return repository.findById(id).orElse(null); }
    public DiagnosticOrder save(DiagnosticOrder order) { return repository.save(order); }
    public void deleteById(String id) { repository.deleteById(id); }
}