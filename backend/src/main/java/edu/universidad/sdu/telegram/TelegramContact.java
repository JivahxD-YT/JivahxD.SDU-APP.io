package edu.universidad.sdu.telegram;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Locale;

@Entity
@Table(name = "usuarios_telegram")
public class TelegramContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "chat_id", nullable = false, unique = true, length = 30)
    private String chatId;

    @Column(name = "tg_usuario", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "tg_nombre", length = 150)
    private String displayName;

    @Column(name = "fecha_registro", nullable = false)
    private Instant registeredAt;

    protected TelegramContact() {
    }

    public TelegramContact(String chatId, String username, String displayName) {
        this.chatId = chatId;
        this.username = normalize(username);
        this.displayName = displayName;
    }

    @PrePersist
    void onCreate() {
        if (registeredAt == null) registeredAt = Instant.now();
    }

    public void update(String chatId, String username, String displayName) {
        this.chatId = chatId;
        this.username = normalize(username);
        this.displayName = displayName;
    }

    public static String normalize(String username) {
        return username.replace("@", "").trim().toLowerCase(Locale.ROOT);
    }

    public String getChatId() {
        return chatId;
    }

    public String getUsername() {
        return username;
    }
}
