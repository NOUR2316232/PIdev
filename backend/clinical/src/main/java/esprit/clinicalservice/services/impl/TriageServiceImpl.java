package esprit.clinicalservice.services.impl;

import esprit.clinicalservice.entities.EscalationEvent;
import esprit.clinicalservice.entities.TriageAssessment;
import esprit.clinicalservice.entities.TriageQueueItem;
import esprit.clinicalservice.entities.enums.EscalationType;
import esprit.clinicalservice.entities.enums.QueueStatus;
import esprit.clinicalservice.entities.enums.TriageLevel;
import esprit.clinicalservice.exceptions.ResourceNotFoundException;
import esprit.clinicalservice.repositories.EscalationEventRepository;
import esprit.clinicalservice.repositories.TriageAssessmentRepository;
import esprit.clinicalservice.repositories.TriageQueueItemRepository;
import esprit.clinicalservice.services.TriageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TriageServiceImpl implements TriageService {

    private static final Logger logger = LoggerFactory.getLogger(TriageServiceImpl.class);
    private static final int ESCALATION_STEP_MINUTES = 10;

    private final TriageAssessmentRepository assessmentRepository;
    private final TriageQueueItemRepository queueItemRepository;
    private final EscalationEventRepository escalationEventRepository;

    public TriageServiceImpl(
            TriageAssessmentRepository assessmentRepository,
            TriageQueueItemRepository queueItemRepository,
            EscalationEventRepository escalationEventRepository
    ) {
        this.assessmentRepository = assessmentRepository;
        this.queueItemRepository = queueItemRepository;
        this.escalationEventRepository = escalationEventRepository;
    }

    @Override
    @Transactional
    public TriageQueueItem createAssessmentAndQueueItem(TriageAssessment assessment) {
        ScoreResult scoreResult = computeScoreResult(assessment);

        assessment.setScore(scoreResult.score());
        assessment.setTriageLevel(scoreResult.level());
        assessment.setRecommendedMaxWaitMinutes(scoreResult.maxWaitMinutes());
        assessment.setCreatedAt(LocalDateTime.now());

        TriageAssessment savedAssessment = assessmentRepository.save(assessment);

        TriageQueueItem queueItem = new TriageQueueItem();
        queueItem.setAssessment(savedAssessment);
        queueItem.setTriageLevel(scoreResult.level());
        queueItem.setPriorityRank(scoreResult.level().getPriorityRank());
        queueItem.setMaxWaitMinutes(scoreResult.maxWaitMinutes());
        queueItem.setDeadlineAt(savedAssessment.getArrivalTime().plusMinutes(scoreResult.maxWaitMinutes()));
        queueItem.setStatus(QueueStatus.WAITING);
        queueItem.setManualOverride(false);

        logger.info(
                "Created triage queue item for patient {} with level {} and score {}",
                savedAssessment.getPatientId(),
                scoreResult.level(),
                scoreResult.score()
        );
        return queueItemRepository.save(queueItem);
    }

    @Override
    public List<TriageQueueItem> getPrioritizedQueue() {
        return queueItemRepository.findByStatusInOrderByPriorityRankAscDeadlineAtAscCreatedAtAsc(
                List.of(QueueStatus.WAITING, QueueStatus.IN_PROGRESS)
        );
    }

    @Override
    @Transactional
    public TriageQueueItem startCare(Long queueItemId, Long doctorId) {
        TriageQueueItem queueItem = getQueueItemOrThrow(queueItemId);
        if (queueItem.getStatus() == QueueStatus.COMPLETED || queueItem.getStatus() == QueueStatus.CANCELLED) {
            throw new IllegalStateException("Cannot start care for a closed queue item");
        }

        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        queueItem.setAssignedDoctorId(doctorId);
        if (queueItem.getStartedAt() == null) {
            queueItem.setStartedAt(LocalDateTime.now());
        }
        return queueItemRepository.save(queueItem);
    }

    @Override
    @Transactional
    public TriageQueueItem closeQueueItem(Long queueItemId) {
        TriageQueueItem queueItem = getQueueItemOrThrow(queueItemId);
        if (queueItem.getStatus() == QueueStatus.COMPLETED || queueItem.getStatus() == QueueStatus.CANCELLED) {
            throw new IllegalStateException("Queue item is already closed");
        }

        queueItem.setStatus(QueueStatus.COMPLETED);
        if (queueItem.getStartedAt() == null) {
            queueItem.setStartedAt(LocalDateTime.now());
        }
        queueItem.setCompletedAt(LocalDateTime.now());
        return queueItemRepository.save(queueItem);
    }

    @Override
    @Transactional
    public TriageQueueItem overridePriority(Long queueItemId, TriageLevel triageLevel, Integer maxWaitMinutes, String reason) {
        TriageQueueItem queueItem = getQueueItemOrThrow(queueItemId);
        if (queueItem.getStatus() == QueueStatus.COMPLETED || queueItem.getStatus() == QueueStatus.CANCELLED) {
            throw new IllegalStateException("Cannot override priority for a closed queue item");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Override reason is required");
        }

        int appliedMaxWait = maxWaitMinutes != null ? maxWaitMinutes : defaultMaxWait(triageLevel);
        queueItem.setTriageLevel(triageLevel);
        queueItem.setPriorityRank(triageLevel.getPriorityRank());
        queueItem.setMaxWaitMinutes(appliedMaxWait);
        queueItem.setDeadlineAt(LocalDateTime.now().plusMinutes(appliedMaxWait));
        queueItem.setManualOverride(true);
        queueItem.setOverrideReason(reason.trim());

        TriageAssessment assessment = queueItem.getAssessment();
        assessment.setTriageLevel(triageLevel);
        assessment.setRecommendedMaxWaitMinutes(appliedMaxWait);
        assessmentRepository.save(assessment);

        return queueItemRepository.save(queueItem);
    }

    @Override
    @Transactional
    public void processOverdueEscalations() {
        LocalDateTime now = LocalDateTime.now();
        List<TriageQueueItem> overdueItems = queueItemRepository.findByStatusAndDeadlineAtBefore(QueueStatus.WAITING, now);
        for (TriageQueueItem queueItem : overdueItems) {
            EscalationType nextType = determineNextEscalation(queueItem, now);
            if (nextType == null) {
                continue;
            }
            emitEscalation(queueItem, nextType, now);
        }
    }

    private EscalationType determineNextEscalation(TriageQueueItem queueItem, LocalDateTime now) {
        if (queueItem.getTriageLevel() == TriageLevel.RED) {
            return queueItem.getLastEscalationType() == EscalationType.LEVEL_3 ? null : EscalationType.LEVEL_3;
        }

        EscalationType lastType = queueItem.getLastEscalationType();
        if (lastType == null) {
            return EscalationType.LEVEL_1;
        }

        if (queueItem.getLastEscalationAt() == null) {
            return nextEscalation(lastType);
        }

        long minutesSinceLastEscalation = Duration.between(queueItem.getLastEscalationAt(), now).toMinutes();
        if (minutesSinceLastEscalation < ESCALATION_STEP_MINUTES) {
            return null;
        }

        return nextEscalation(lastType);
    }

    private EscalationType nextEscalation(EscalationType current) {
        return switch (current) {
            case LEVEL_1 -> EscalationType.LEVEL_2;
            case LEVEL_2 -> EscalationType.LEVEL_3;
            case LEVEL_3 -> null;
        };
    }

    private void emitEscalation(TriageQueueItem queueItem, EscalationType escalationType, LocalDateTime now) {
        EscalationEvent escalationEvent = new EscalationEvent();
        escalationEvent.setQueueItem(queueItem);
        escalationEvent.setEscalationType(escalationType);
        escalationEvent.setTriggeredAt(now);
        escalationEvent.setAcknowledged(false);
        escalationEvent.setMessage(buildEscalationMessage(queueItem, escalationType));
        escalationEventRepository.save(escalationEvent);

        queueItem.setLastEscalationType(escalationType);
        queueItem.setLastEscalationAt(now);
        queueItemRepository.save(queueItem);

        logger.warn(
                "Escalation {} emitted for queue item {} (patient {})",
                escalationType,
                queueItem.getId(),
                queueItem.getAssessment().getPatientId()
        );
    }

    private String buildEscalationMessage(TriageQueueItem queueItem, EscalationType escalationType) {
        return "Queue item " + queueItem.getId()
                + " for patient " + queueItem.getAssessment().getPatientId()
                + " has exceeded SLA. Escalation " + escalationType + " triggered.";
    }

    private TriageQueueItem getQueueItemOrThrow(Long queueItemId) {
        return queueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Triage queue item not found with id: " + queueItemId));
    }

    private ScoreResult computeScoreResult(TriageAssessment assessment) {
        int score = 0;

        if (Boolean.TRUE.equals(assessment.getRespiratoryDistress())) {
            score += 3;
        }

        Integer spo2 = assessment.getSpo2();
        if (spo2 != null) {
            if (spo2 <= 90) {
                score += 3;
            } else if (spo2 <= 94) {
                score += 2;
            }
        }

        Integer systolicBp = assessment.getSystolicBp();
        if (systolicBp != null) {
            if (systolicBp < 90 || systolicBp > 180) {
                score += 3;
            } else if (systolicBp < 100 || systolicBp > 160) {
                score += 2;
            }
        }

        Integer heartRate = assessment.getHeartRate();
        if (heartRate != null) {
            if (heartRate < 40 || heartRate > 130) {
                score += 2;
            } else if (heartRate > 110) {
                score += 1;
            }
        }

        Integer painScore = assessment.getPainScore();
        if (painScore != null && painScore >= 8) {
            score += 1;
        }

        Integer age = assessment.getAge();
        if (age != null && age >= 75) {
            score += 1;
        }

        if (Boolean.TRUE.equals(assessment.getSevereComorbidity())) {
            score += 1;
        }

        TriageLevel level;
        int maxWait;
        if (score >= 7) {
            level = TriageLevel.RED;
            maxWait = 0;
        } else if (score >= 5) {
            level = TriageLevel.ORANGE;
            maxWait = 10;
        } else if (score >= 3) {
            level = TriageLevel.YELLOW;
            maxWait = 30;
        } else {
            level = TriageLevel.GREEN;
            maxWait = 120;
        }

        return new ScoreResult(score, level, maxWait);
    }

    private int defaultMaxWait(TriageLevel triageLevel) {
        return switch (triageLevel) {
            case RED -> 0;
            case ORANGE -> 10;
            case YELLOW -> 30;
            case GREEN -> 120;
        };
    }

    private record ScoreResult(int score, TriageLevel level, int maxWaitMinutes) {
    }
}
