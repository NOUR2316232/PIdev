package esprit.clinicalservice.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TriageEscalationScheduler {

    private final TriageService triageService;

    public TriageEscalationScheduler(TriageService triageService) {
        this.triageService = triageService;
    }

    @Scheduled(fixedDelayString = "${triage.escalation.fixed-delay-ms:60000}")
    public void runEscalationSweep() {
        triageService.processOverdueEscalations();
    }
}
