package edu.universidad.sdu.complaint;

import java.time.Instant;
import java.time.LocalDate;

public record ComplaintResponse(
        Long id,
        Long campusId,
        String campusName,
        String telegramUsername,
        String description,
        LocalDate eventDate,
        Instant createdAt,
        ComplaintStatus status,
        ReporterRole reporterRole) {

    public static ComplaintResponse from(Complaint complaint) {
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getCampus() == null ? null : complaint.getCampus().getId(),
                complaint.getCampus() == null ? null : complaint.getCampus().getName(),
                complaint.getTelegramUsername(),
                complaint.getDescription(),
                complaint.getEventDate(),
                complaint.getCreatedAt(),
                complaint.getStatus(),
                complaint.getReporterRole());
    }
}
