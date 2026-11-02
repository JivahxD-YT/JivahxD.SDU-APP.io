package edu.universidad.sdu.telegram;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "telegram_sync_state")
public class TelegramSyncState {

    @Id
    private Short id;

    @Column(name = "next_update_offset", nullable = false)
    private Long nextUpdateOffset;

    protected TelegramSyncState() {
    }

    public Long getNextUpdateOffset() {
        return nextUpdateOffset;
    }

    public void setNextUpdateOffset(Long nextUpdateOffset) {
        this.nextUpdateOffset = nextUpdateOffset;
    }
}
