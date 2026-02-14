package org.example.diagnosticapp.repositories;

import org.example.diagnosticapp.entities.DiagnosticResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticResultRepository extends JpaRepository<DiagnosticResult, String> {
}