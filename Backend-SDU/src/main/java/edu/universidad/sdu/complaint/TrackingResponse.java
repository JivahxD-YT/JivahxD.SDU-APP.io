package edu.universidad.sdu.complaint;

import java.time.Instant;

public record TrackingResponse(
        String trackingCode,
        String campusName,
        Instant createdAt,
        ComplaintStatus status,
        String evidenceUrls) {

    public static TrackingResponse from(Complaint complaint) {
        return new TrackingResponse(
                complaint.getTrackingCode(),
                complaint.getCampus() == null ? null : complaint.getCampus().getName(),
                complaint.getCreatedAt(),
                complaint.getStatus(),
                complaint.getEvidenceUrls());
    }
}
