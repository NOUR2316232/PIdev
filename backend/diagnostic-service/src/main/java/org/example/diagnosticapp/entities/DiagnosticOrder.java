package org.example.diagnosticapp.entities;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.diagnosticapp.enums.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("id")
    private String id;

    @Enumerated(EnumType.STRING)
    @JsonProperty("orderType")
    private DiagnosticOrderType orderType;

    @JsonProperty("testName")
    private String testName;

    @Column(columnDefinition = "DATETIME")
    @JsonProperty("orderDate")
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @JsonProperty("priority")
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @JsonProperty("status")
    private OrderStatus status;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("clinicalNotes")
    private String clinicalNotes;

    @JsonProperty("userId")
    private String user_id;

    @JsonProperty("consultationId")
    private String consultationId;

    @JsonProperty("orderedBy")
    private String orderedBy;

    // AJOUTE CECI MANUELLEMENT POUR RÉPARER LE CONTROLLER
    public void setId(String id) {
        this.id = id;
    }
}