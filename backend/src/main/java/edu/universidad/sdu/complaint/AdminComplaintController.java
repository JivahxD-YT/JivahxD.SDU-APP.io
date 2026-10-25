package edu.universidad.sdu.complaint;

import edu.universidad.sdu.complaint.ComplaintService.CampusSummary;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/auth/check")
    public void checkAuthentication() {
    }

    @GetMapping("/complaints")
    public Page<ComplaintResponse> getComplaints(
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return complaintService.findAll(pageable);
    }

    @GetMapping("/stats/by-campus")
    public List<CampusSummary> getCampusSummary() {
        return complaintService.getCampusSummary();
    }

    @PutMapping("/complaints/{id}/status")
    public ComplaintResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return complaintService.updateStatus(id, request.status(), request.customMessage());
    }
}
