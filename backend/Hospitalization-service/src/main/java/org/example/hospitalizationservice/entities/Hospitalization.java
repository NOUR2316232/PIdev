package org.example.hospitalizationservice.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS) // Always include fields in JSON
public class    Hospitalization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Admission date is required")
    @PastOrPresent(message = "Admission date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime admissionDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dischargeDate;

    @NotBlank(message = "Room number is required")
    @Size(max = 20, message = "Room number cannot exceed 20 characters")
    private String roomNumber;

    @NotBlank(message = "Admission reason is required")
    @Size(max = 255, message = "Admission reason cannot exceed 255 characters")
    private String admissionReason;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(pending|active|discharged)$", message = "Status must be 'pending', 'active' or 'discharged'")
    private String status;

    // After
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Attending doctor ID is required")
    private Long attendingDoctorId;

    // One Hospitalization has many VitalSigns
    @OneToMany(mappedBy = "hospitalization", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Helps avoid infinite recursion in JSON
    private List<VitalSigns> vitalSignsRecords = new ArrayList<>();
}
