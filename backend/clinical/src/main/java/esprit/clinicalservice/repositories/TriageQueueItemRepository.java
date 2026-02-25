package esprit.clinicalservice.repositories;

import esprit.clinicalservice.entities.TriageQueueItem;
import esprit.clinicalservice.entities.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TriageQueueItemRepository extends JpaRepository<TriageQueueItem, Long> {

    List<TriageQueueItem> findByStatusInOrderByPriorityRankAscDeadlineAtAscCreatedAtAsc(List<QueueStatus> statuses);

    List<TriageQueueItem> findByStatusAndDeadlineAtBefore(QueueStatus status, LocalDateTime now);
}
