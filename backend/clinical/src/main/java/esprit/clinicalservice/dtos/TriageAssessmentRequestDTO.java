package esprit.clinicalservice.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TriageAssessmentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Arrival time is required")
    private LocalDateTime arrivalTime;

    @Min(value = 20, message = "Heart rate cannot be below 20")
    @Max(value = 250, message = "Heart rate cannot be above 250")
    private Integer heartRate;

    @Min(value = 40, message = "Systolic BP cannot be below 40")
    @Max(value = 300, message = "Systolic BP cannot be above 300")
    private Integer systolicBp;

    @Min(value = 50, message = "SpO2 cannot be below 50")
    @Max(value = 100, message = "SpO2 cannot be above 100")
    private Integer spo2;

    @Min(value = 0, message = "Pain score must be between 0 and 10")
    @Max(value = 10, message = "Pain score must be between 0 and 10")
    private Integer painScore;

    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 130, message = "Age cannot be above 130")
    private Integer age;

    private Boolean severeComorbidity;

    private Boolean respiratoryDistress;

    public TriageAssessmentRequestDTO() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Integer getSystolicBp() {
        return systolicBp;
    }

    public void setSystolicBp(Integer systolicBp) {
        this.systolicBp = systolicBp;
    }

    public Integer getSpo2() {
        return spo2;
    }

    public void setSpo2(Integer spo2) {
        this.spo2 = spo2;
    }

    public Integer getPainScore() {
        return painScore;
    }

    public void setPainScore(Integer painScore) {
        this.painScore = painScore;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Boolean getSevereComorbidity() {
        return severeComorbidity;
    }

    public void setSevereComorbidity(Boolean severeComorbidity) {
        this.severeComorbidity = severeComorbidity;
    }

    public Boolean getRespiratoryDistress() {
        return respiratoryDistress;
    }

    public void setRespiratoryDistress(Boolean respiratoryDistress) {
        this.respiratoryDistress = respiratoryDistress;
    }
}
