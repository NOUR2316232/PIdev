package esprit.clinicalservice.controllers;

import esprit.clinicalservice.dtos.TriageAssessmentRequestDTO;
import esprit.clinicalservice.dtos.TriageAssessmentResponseDTO;
import esprit.clinicalservice.dtos.TriageOverrideDTO;
import esprit.clinicalservice.dtos.TriageQueueActionDTO;
import esprit.clinicalservice.dtos.TriageQueueItemDTO;
import esprit.clinicalservice.services.TriageService;
import esprit.clinicalservice.utils.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/triage")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/assessments")
    public ResponseEntity<TriageAssessmentResponseDTO> createAssessment(@Valid @RequestBody TriageAssessmentRequestDTO requestDTO) {
        var assessment = MapperUtil.toTriageAssessment(requestDTO);
        var queueItem = triageService.createAssessmentAndQueueItem(assessment);
        return ResponseEntity.status(HttpStatus.CREATED).body(MapperUtil.toTriageAssessmentResponseDTO(queueItem));
    }

    @GetMapping("/queue")
    public ResponseEntity<List<TriageQueueItemDTO>> getPrioritizedQueue() {
        var queueItems = triageService.getPrioritizedQueue();
        return ResponseEntity.ok(queueItems.stream()
                .map(MapperUtil::toTriageQueueItemDTO)
                .collect(Collectors.toList()));
    }

    @PostMapping("/queue/{id}/start-care")
    public ResponseEntity<TriageQueueItemDTO> startCare(
            @PathVariable Long id,
            @Valid @RequestBody TriageQueueActionDTO actionDTO
    ) {
        var queueItem = triageService.startCare(id, actionDTO.getDoctorId());
        return ResponseEntity.ok(MapperUtil.toTriageQueueItemDTO(queueItem));
    }

    @PostMapping("/queue/{id}/close")
    public ResponseEntity<TriageQueueItemDTO> closeQueueItem(@PathVariable Long id) {
        var queueItem = triageService.closeQueueItem(id);
        return ResponseEntity.ok(MapperUtil.toTriageQueueItemDTO(queueItem));
    }

    @PostMapping("/queue/{id}/override")
    public ResponseEntity<TriageQueueItemDTO> overridePriority(
            @PathVariable Long id,
            @Valid @RequestBody TriageOverrideDTO overrideDTO
    ) {
        var queueItem = triageService.overridePriority(
                id,
                overrideDTO.getTriageLevel(),
                overrideDTO.getMaxWaitMinutes(),
                overrideDTO.getOverrideReason()
        );
        return ResponseEntity.ok(MapperUtil.toTriageQueueItemDTO(queueItem));
    }
}
