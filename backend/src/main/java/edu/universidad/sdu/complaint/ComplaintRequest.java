package edu.universidad.sdu.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ComplaintRequest(
        @NotNull Long campusId,
        @Size(max = 100) String telegramUsername,
        @NotBlank @Size(max = 500) String description,
        @NotNull @PastOrPresent LocalDate eventDate,
        @NotNull ReporterRole reporterRole) {
}
