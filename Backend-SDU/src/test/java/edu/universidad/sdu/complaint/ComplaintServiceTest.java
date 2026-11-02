package edu.universidad.sdu.complaint;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.universidad.sdu.campus.Campus;
import edu.universidad.sdu.campus.CampusRepository;
import edu.universidad.sdu.telegram.TelegramService;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CampusRepository campusRepository;

    @Mock
    private TelegramService telegramService;

    @Mock
    private Campus campus;

    private ComplaintService service;

    @BeforeEach
    void setUp() {
        service = new ComplaintService(complaintRepository, campusRepository, telegramService);
    }

    @Test
    void createsComplaintWithInitialStatusAndNotifiesTelegram() {
        when(campusRepository.findById(1L)).thenReturn(Optional.of(campus));
        when(complaintRepository.save(any(Complaint.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        ComplaintRequest request = new ComplaintRequest(
                1L, "@user", "Descripción del hecho", LocalDate.now(), ReporterRole.ESTUDIANTE,
                "https://limewire.com/example");

        ComplaintResponse response = service.create(request);

        assertEquals(ComplaintStatus.REGISTRADA, response.status());
        assertEquals(ReporterRole.ESTUDIANTE, response.reporterRole());
        assertEquals("Descripción del hecho", response.description());
        verify(telegramService).notifyComplaintCreated(any(Complaint.class));
    }

    @Test
    void changesStatusAndSendsNotification() {
        Complaint complaint = new Complaint(campus, "@user", "Descripción", LocalDate.now(),
                ReporterRole.ESTUDIANTE, null);
        when(complaintRepository.findWithCampusById(12L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(complaint)).thenReturn(complaint);

        ComplaintResponse response = service.updateStatus(12L, ComplaintStatus.PROCESANDO, "Estamos revisando tu caso.");

        assertEquals(ComplaintStatus.PROCESANDO, response.status());
        verify(telegramService).notifyStatusChanged(complaint, "Estamos revisando tu caso.");
    }

    @Test
    void rejectsUnknownCampus() {
        when(campusRepository.findById(99L)).thenReturn(Optional.empty());
        ComplaintRequest request = new ComplaintRequest(
                99L, null, "Descripción del hecho", LocalDate.now(), ReporterRole.EXTERNO, null);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
    }

    @Test
    void rejectsRejectedStatusRollback() {
        Complaint complaint = new Complaint(campus, "@user", "Descripción", LocalDate.now(),
                ReporterRole.ESTUDIANTE, null);
        complaint.updateStatus(ComplaintStatus.RECHAZADA);
        when(complaintRepository.findWithCampusById(12L)).thenReturn(Optional.of(complaint));

        assertThrows(IllegalArgumentException.class,
                () -> service.updateStatus(12L, ComplaintStatus.ADMITIDA, ""));
    }

    @Test
    void preventsResolvedComplaintStatusChanges() {
        Complaint complaint = new Complaint(campus, "@user", "Descripción", LocalDate.now(),
                ReporterRole.ESTUDIANTE, null);
        complaint.updateStatus(ComplaintStatus.PROCESADA);
        when(complaintRepository.findWithCampusById(12L)).thenReturn(Optional.of(complaint));

        assertThrows(IllegalArgumentException.class,
                () -> service.updateStatus(12L, ComplaintStatus.RECHAZADA, ""));
    }

    @Test
    void allowsRejectionFromActiveStatus() {
        Complaint complaint = new Complaint(campus, "@user", "Descripción", LocalDate.now(),
                ReporterRole.ESTUDIANTE, null);
        complaint.updateStatus(ComplaintStatus.PROCESANDO);
        when(complaintRepository.findWithCampusById(12L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(complaint)).thenReturn(complaint);

        ComplaintResponse response = service.updateStatus(12L, ComplaintStatus.RECHAZADA, "");

        assertEquals(ComplaintStatus.RECHAZADA, response.status());
    }
}
