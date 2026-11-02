package edu.universidad.sdu.complaint;

import edu.universidad.sdu.campus.Campus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.security.SecureRandom;

/**
 * Entidad persistida que representa una denuncia y su estado dentro del flujo administrativo.
 * La fecha de registro se asigna automáticamente antes de guardar el registro por primera vez.
 */
@Entity
@Table(name = "denuncias")
public class Complaint {
    private static final String TRACKING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_denuncia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede")
    private Campus campus;

    @Column(name = "tg_username", length = 100)
    private String telegramUsername;

    @Column(name = "codigo_seguimiento", nullable = false, length = 12, unique = true)
    private String trackingCode;

    @Column(name = "evidencias_url", length = 2000)
    private String evidenceUrls;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String description;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDate eventDate;

    @Column(name = "fecha_registro", nullable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_denunciante", nullable = false, length = 50)
    private ReporterRole reporterRole;

    protected Complaint() {
    }

    public Complaint(Campus campus, String telegramUsername, String description,
            LocalDate eventDate, ReporterRole reporterRole, String evidenceUrls) {
        this.campus = campus;
        this.telegramUsername = telegramUsername;
        this.description = description;
        this.eventDate = eventDate;
        this.reporterRole = reporterRole;
        this.evidenceUrls = evidenceUrls;
        this.status = ComplaintStatus.REGISTRADA;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (trackingCode == null || trackingCode.isBlank()) {
            StringBuilder code = new StringBuilder(10);
            for (int index = 0; index < 10; index++) {
                code.append(TRACKING_ALPHABET.charAt(RANDOM.nextInt(TRACKING_ALPHABET.length())));
            }
            trackingCode = code.toString();
        }
    }

    public void updateStatus(ComplaintStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("El nuevo estado de la denuncia es obligatorio.");
        }
        if (!this.status.canTransitionTo(status)) {
            throw new IllegalArgumentException(
                    "El estado " + this.status + " no puede cambiar a " + status
                            + ". Las denuncias no pueden retroceder ni salir de un estado terminal.");
        }
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Campus getCampus() {
        return campus;
    }

    public String getTelegramUsername() {
        return telegramUsername;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public String getEvidenceUrls() {
        return evidenceUrls;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public ReporterRole getReporterRole() {
        return reporterRole;
    }
}
