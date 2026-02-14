package org.example.diagnosticapp.services;

import org.example.diagnosticapp.entities.DiagnosticResult;
import org.example.diagnosticapp.repositories.DiagnosticResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DiagnosticResultService {
    @Autowired
    private DiagnosticResultRepository repository;

    public List<DiagnosticResult> findAll() { return repository.findAll(); }
    public DiagnosticResult findById(String id) { return repository.findById(id).orElse(null); }
    public DiagnosticResult save(DiagnosticResult result) { return repository.save(result); }
    public void deleteById(String id) { repository.deleteById(id); }
}