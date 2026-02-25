package esprit.clinicalservice.dtos;

import jakarta.validation.constraints.NotNull;

public class TriageQueueActionDTO {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    public TriageQueueActionDTO() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
}
