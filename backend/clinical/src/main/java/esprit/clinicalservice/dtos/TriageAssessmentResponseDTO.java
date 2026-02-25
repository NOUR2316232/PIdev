package esprit.clinicalservice.dtos;

import esprit.clinicalservice.entities.enums.QueueStatus;
import esprit.clinicalservice.entities.enums.TriageLevel;

import java.time.LocalDateTime;

public class TriageAssessmentResponseDTO {

    private Long assessmentId;
    private Long queueItemId;
    private Long patientId;
    private Integer score;
    private TriageLevel triageLevel;
    private Integer recommendedMaxWaitMinutes;
    private LocalDateTime deadlineAt;
    private QueueStatus queueStatus;

    public TriageAssessmentResponseDTO() {
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getQueueItemId() {
        return queueItemId;
    }

    public void setQueueItemId(Long queueItemId) {
        this.queueItemId = queueItemId;
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

    public Integer getRecommendedMaxWaitMinutes() {
        return recommendedMaxWaitMinutes;
    }

    public void setRecommendedMaxWaitMinutes(Integer recommendedMaxWaitMinutes) {
        this.recommendedMaxWaitMinutes = recommendedMaxWaitMinutes;
    }

    public LocalDateTime getDeadlineAt() {
        return deadlineAt;
    }

    public void setDeadlineAt(LocalDateTime deadlineAt) {
        this.deadlineAt = deadlineAt;
    }

    public QueueStatus getQueueStatus() {
        return queueStatus;
    }

    public void setQueueStatus(QueueStatus queueStatus) {
        this.queueStatus = queueStatus;
    }
}
