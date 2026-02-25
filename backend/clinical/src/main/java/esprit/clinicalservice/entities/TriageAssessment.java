package esprit.clinicalservice.entities;

import esprit.clinicalservice.entities.enums.TriageLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "triage_assessments")
public class TriageAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "spo2")
    private Integer spo2;

    @Column(name = "pain_score")
    private Integer painScore;

    @Column(name = "age")
    private Integer age;

    @Column(name = "severe_comorbidity")
    private Boolean severeComorbidity;

    @Column(name = "respiratory_distress")
    private Boolean respiratoryDistress;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "triage_level", nullable = false)
    private TriageLevel triageLevel;

    @Column(name = "recommended_max_wait_minutes", nullable = false)
    private Integer recommendedMaxWaitMinutes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public TriageAssessment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public TriageLevel getTriageLevel() {
        return triageLevel;
    }

    public void setTriageLevel(TriageLevel triageLevel) {
        this.triageLevel = triageLevel;
    }

    public Integer getRecommendedMaxWaitMinutes() {
        return recommendedMaxWaitMinutes;
    }

    public void setRecommendedMaxWaitMinutes(Integer recommendedMaxWaitMinutes) {
        this.recommendedMaxWaitMinutes = recommendedMaxWaitMinutes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
