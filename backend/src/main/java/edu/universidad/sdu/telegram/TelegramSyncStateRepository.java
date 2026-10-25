package edu.universidad.sdu.telegram;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TelegramSyncStateRepository extends JpaRepository<TelegramSyncState, Short> {
}
