package org.example.diagnosticapp.repositories;

import org.example.diagnosticapp.entities.DiagnosticOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticOrderRepository extends JpaRepository<DiagnosticOrder, String> {
}