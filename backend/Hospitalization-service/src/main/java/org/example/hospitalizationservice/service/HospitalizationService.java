package org.example.hospitalizationservice.service;

import org.example.hospitalizationservice.entities.Hospitalization;
import org.example.hospitalizationservice.repository.HospitalizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalizationService {

    @Autowired
    private HospitalizationRepository repository;

    public List<Hospitalization> findAll() {
        return repository.findAll();
    }

    public Hospitalization findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Hospitalization save(Hospitalization hospitalization) {
        return repository.save(hospitalization); // saves and returns full entity
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
