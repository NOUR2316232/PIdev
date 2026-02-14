package esprit.pharmacy_service.entity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import esprit.pharmacy_service.entity.Enumerations.PrescriptionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty
    private LocalDate prescriptionDate;

    @Enumerated(EnumType.STRING)
    @JsonProperty
    private PrescriptionStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty
    private LocalDate validUntil;

    @Column(columnDefinition = "TEXT")
    @JsonProperty
    private String instructions;

    @JsonProperty
    private String consultationId;

    @JsonProperty
    private String userId;

    @JsonProperty
    private String prescribedBy;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty
    private List<Medication> medications;
}
