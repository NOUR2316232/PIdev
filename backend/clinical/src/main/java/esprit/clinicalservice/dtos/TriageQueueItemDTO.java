package esprit.clinicalservice.dtos;

import esprit.clinicalservice.entities.enums.EscalationType;
import esprit.clinicalservice.entities.enums.QueueStatus;
import esprit.clinicalservice.entities.enums.TriageLevel;

import java.time.LocalDateTime;

public class TriageQueueItemDTO {

    private Long queueItemId;
    private Long assessmentId;
    private Long patientId;
    private Integer score;
    private TriageLevel triageLevel;
    private Integer maxWaitMinutes;
    private LocalDateTime arrivalTime;
    private LocalDateTime deadlineAt;
    private QueueStatus status;
    private Long assignedDoctorId;
    private EscalationType lastEscalationType;
    private LocalDateTime lastEscalationAt;
    private boolean manualOverride;
    private String overrideReason;

    public TriageQueueItemDTO() {
    }

    public Long getQueueItemId() {
        return queueItemId;
    }

    public void setQueueItemId(Long queueItemId) {
        this.queueItemId = queueItemId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
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

    public Integer getMaxWaitMinutes() {
        return maxWaitMinutes;
    }

    public void setMaxWaitMinutes(Integer maxWaitMinutes) {
        this.maxWaitMinutes = maxWaitMinutes;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public LocalDateTime getDeadlineAt() {
        return deadlineAt;
    }

    public void setDeadlineAt(LocalDateTime deadlineAt) {
        this.deadlineAt = deadlineAt;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public Long getAssignedDoctorId() {
        return assignedDoctorId;
    }

    public void setAssignedDoctorId(Long assignedDoctorId) {
        this.assignedDoctorId = assignedDoctorId;
    }

    public EscalationType getLastEscalationType() {
        return lastEscalationType;
    }

    public void setLastEscalationType(EscalationType lastEscalationType) {
        this.lastEscalationType = lastEscalationType;
    }

    public LocalDateTime getLastEscalationAt() {
        return lastEscalationAt;
    }

    public void setLastEscalationAt(LocalDateTime lastEscalationAt) {
        this.lastEscalationAt = lastEscalationAt;
    }

    public boolean isManualOverride() {
        return manualOverride;
    }

    public void setManualOverride(boolean manualOverride) {
        this.manualOverride = manualOverride;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }
}
