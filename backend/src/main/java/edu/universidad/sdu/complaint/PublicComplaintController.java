package edu.universidad.sdu.complaint;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
