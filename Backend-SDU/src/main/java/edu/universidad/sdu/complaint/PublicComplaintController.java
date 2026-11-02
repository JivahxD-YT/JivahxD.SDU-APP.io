package edu.universidad.sdu.complaint;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API pública para registrar denuncias sin acceso administrativo. */
@RestController
@RequestMapping("/api/public/complaints")
public class PublicComplaintController {

    private final ComplaintService complaintService;

    public PublicComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ComplaintResponse create(@Valid @RequestBody ComplaintRequest request) {
        return complaintService.create(request);
    }

    @GetMapping("/tracking/{trackingCode}")
    public TrackingResponse track(@PathVariable String trackingCode) {
        return complaintService.findByTrackingCode(trackingCode);
    }
}
