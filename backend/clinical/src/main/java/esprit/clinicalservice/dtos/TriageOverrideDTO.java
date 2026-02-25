package esprit.clinicalservice.dtos;

import esprit.clinicalservice.entities.enums.TriageLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TriageOverrideDTO {

    @NotNull(message = "Triage level is required")
    private TriageLevel triageLevel;

    @Min(value = 0, message = "Max wait must be >= 0")
    @Max(value = 360, message = "Max wait cannot exceed 360 minutes")
    private Integer maxWaitMinutes;

    @NotBlank(message = "Override reason is required")
    private String overrideReason;

    public TriageOverrideDTO() {
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

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }
}
