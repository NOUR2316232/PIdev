package org.example.hospitalizationservice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalSigns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Record date is required")
    private LocalDateTime recordDate;

    @NotNull(message = "Temperature is required")
    private Float temperature;

    @NotNull(message = "Blood pressure is required")
    @Size(min = 3, max = 10, message = "Blood pressure must be valid format")
    private String bloodPressure;

    @NotNull(message = "Heart rate is required")
    private Integer heartRate;

    @NotNull(message = "Respiratory rate is required")
    private Integer respiratoryRate;

    @NotNull(message = "Oxygen saturation is required")
    private Float oxygenSaturation;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    private String notes;

    private String recordedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospitalization_id")
    @JsonBackReference
    private Hospitalization hospitalization;
}
