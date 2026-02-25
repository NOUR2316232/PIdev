package esprit.clinicalservice.repositories;

import esprit.clinicalservice.entities.EscalationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalationEventRepository extends JpaRepository<EscalationEvent, Long> {
}
