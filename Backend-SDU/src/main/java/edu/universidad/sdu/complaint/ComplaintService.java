package edu.universidad.sdu.complaint;

import edu.universidad.sdu.campus.Campus;
import edu.universidad.sdu.campus.CampusRepository;
import edu.universidad.sdu.telegram.TelegramService;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordina los casos de uso de denuncias y aplica la transacción entre
 * persistencia, sedes y notificaciones de Telegram.
 */
@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CampusRepository campusRepository;
    private final TelegramService telegramService;

    public ComplaintService(ComplaintRepository complaintRepository,
            CampusRepository campusRepository, TelegramService telegramService) {
        this.complaintRepository = complaintRepository;
        this.campusRepository = campusRepository;
        this.telegramService = telegramService;
    }

    @Transactional
    public ComplaintResponse create(ComplaintRequest request) {
        Campus campus = campusRepository.findById(request.campusId())
                .orElseThrow(() -> new IllegalArgumentException("La sede seleccionada no existe."));
        String username = request.telegramUsername() == null || request.telegramUsername().isBlank()
                ? null : request.telegramUsername().trim();
        String evidenceUrls = request.evidenceUrls() == null || request.evidenceUrls().isBlank()
                ? null : request.evidenceUrls().trim();
        Complaint complaint = complaintRepository.save(new Complaint(
                campus, username, request.description().trim(), request.eventDate(), request.reporterRole(),
                evidenceUrls));
        telegramService.notifyComplaintCreated(complaint);
        return ComplaintResponse.from(complaint);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> findAll(Pageable pageable) {
        return complaintRepository.findAllByOrderByCreatedAtDesc(pageable).map(ComplaintResponse::from);
    }

    @Transactional(readOnly = true)
    public TrackingResponse findByTrackingCode(String trackingCode) {
        if (trackingCode == null || trackingCode.isBlank()) {
            throw new IllegalArgumentException("El código de seguimiento es obligatorio.");
        }
        Complaint complaint = complaintRepository.findWithCampusByTrackingCode(
                        trackingCode.trim().toUpperCase())
                .orElseThrow(() -> new ComplaintNotFoundException("Código de seguimiento no encontrado."));
        return TrackingResponse.from(complaint);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, ComplaintStatus status, String customMessage) {
        Complaint complaint = complaintRepository.findWithCampusById(id)
                .orElseThrow(() -> new ComplaintNotFoundException(id));
        complaint.updateStatus(status);
        Complaint saved = complaintRepository.save(complaint);
        telegramService.notifyStatusChanged(saved, customMessage);
        return ComplaintResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CampusSummary> getCampusSummary() {
        return complaintRepository.countByCampus().stream()
                .map(count -> new CampusSummary(count.getCampusName(), count.getComplaintCount()))
                .toList();
    }

    public record CampusSummary(String campusName, long count) {
    }
}
