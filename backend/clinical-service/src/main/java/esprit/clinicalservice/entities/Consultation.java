package esprit.clinicalservice.entities;

import esprit.clinicalservice.entities.enums.ConsultationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "CHAR(36)")
    private UUID id;

    // Patient receiving the consultation (no User entity, just the ID)
    @Column(name = "patient_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID patientId;

    // Doctor conducting the consultation (no User entity, just the ID)
    @Column(name = "doctor_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID doctorId;

    @ManyToOne
    @JoinColumn(name = "medical_history_id")
    private MedicalHistory medicalHistory;

    private LocalDateTime consultationDate;

    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    private LocalDate followUpDate;

    @Enumerated(EnumType.STRING)
    private ConsultationStatus status;
}

