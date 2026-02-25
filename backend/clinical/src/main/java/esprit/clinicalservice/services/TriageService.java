package esprit.clinicalservice.services;

import esprit.clinicalservice.entities.TriageAssessment;
import esprit.clinicalservice.entities.TriageQueueItem;
import esprit.clinicalservice.entities.enums.TriageLevel;

import java.util.List;

public interface TriageService {

    TriageQueueItem createAssessmentAndQueueItem(TriageAssessment assessment);

    List<TriageQueueItem> getPrioritizedQueue();

    TriageQueueItem startCare(Long queueItemId, Long doctorId);

    TriageQueueItem closeQueueItem(Long queueItemId);

    TriageQueueItem overridePriority(Long queueItemId, TriageLevel triageLevel, Integer maxWaitMinutes, String reason);

    void processOverdueEscalations();
}
