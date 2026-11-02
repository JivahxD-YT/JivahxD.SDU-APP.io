package edu.universidad.sdu.telegram;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelegramContactRepository extends JpaRepository<TelegramContact, Long> {

    Optional<TelegramContact> findByUsername(String username);

    Optional<TelegramContact> findByChatId(String chatId);
}
