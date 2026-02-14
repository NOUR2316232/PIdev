package org.example.diagnosticapp.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("id")
    private String id;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("imageInterpretation")
    private String imageInterpretation;

    @JsonProperty("isAbnormal")
    private boolean isAbnormal;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("labFindings")
    private String labFindings;

    @JsonProperty("performedBy")
    private String performedBy;

    @JsonProperty("referenceRange")
    private String referenceRange;

    @Column(columnDefinition = "DATETIME") // Indispensable pour MySQL 5.5
    @JsonProperty("resultDate")
    private LocalDateTime resultDate;

    // Utilisation de result_values pour éviter le mot réservé "values" en SQL
    @Column(name = "result_values")
    @JsonProperty("resultValues")
    private String resultValues;

    // L'ID de la commande liée
    @JsonProperty("orderId")
    private String orderId;

    // AJOUT MANUEL DU SETTER POUR RÉPARER LE CONTROLLER (Update)
    public void setId(String id) {
        this.id = id;
    }
}