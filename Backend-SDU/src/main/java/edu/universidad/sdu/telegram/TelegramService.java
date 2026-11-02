package edu.universidad.sdu.telegram;

import edu.universidad.sdu.complaint.Complaint;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

@Service
public class TelegramService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TelegramService.class);
    private final TelegramContactRepository contactRepository;
    private final TelegramSyncStateRepository syncStateRepository;
    private final RestClient restClient = RestClient.create();
    private final String botToken;

    public TelegramService(
            TelegramContactRepository contactRepository,
            TelegramSyncStateRepository syncStateRepository,
            @Value("${app.telegram.bot-token:}") String botToken) {
        this.contactRepository = contactRepository;
        this.syncStateRepository = syncStateRepository;
        this.botToken = botToken;
    }

    @Scheduled(
            initialDelayString = "${app.telegram.poll-initial-delay:0}",
            fixedDelayString = "${app.telegram.poll-interval:30000}")
    @Transactional
    public void synchronizeContacts() {
        if (botToken.isBlank()) return;

        try {
            TelegramSyncState state = syncStateRepository.findById((short) 1)
                    .orElseThrow(() -> new IllegalStateException("No existe el cursor de sincronización de Telegram."));
            JsonNode response = restClient.get()
                    .uri("https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=0",
                            botToken, state.getNextUpdateOffset())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.path("ok").asBoolean(false)) {
                LOGGER.warn("Telegram no devolvió una respuesta válida al sincronizar usuarios.");
                return;
            }

            long nextOffset = state.getNextUpdateOffset();
            int synchronizedContacts = 0;
            for (JsonNode update : response.path("result")) {
                JsonNode message = update.path("message");
                if (message.isMissingNode()) {
                    message = update.path("edited_message");
                }
                JsonNode from = message.path("from");
                JsonNode chat = message.path("chat");
                String username = from.path("username").asString("");
                String chatId = chat.path("id").asString("");
                if (!username.isBlank() && !chatId.isBlank()) {
                    String displayName = (from.path("first_name").asString("") + " "
                            + from.path("last_name").asString("")).trim();
                    saveContact(chatId, username, displayName);
                    synchronizedContacts++;
                }
                nextOffset = Math.max(nextOffset, update.path("update_id").asLong(-1L) + 1);
            }
            state.setNextUpdateOffset(nextOffset);
            syncStateRepository.save(state);
            if (synchronizedContacts > 0) {
                LOGGER.info("Telegram sincronizó {} contacto(s).", synchronizedContacts);
            } else if (!response.path("result").isEmpty()) {
                LOGGER.debug("Telegram recibió actualizaciones sin datos de contacto.");
            }
        } catch (RestClientException exception) {
            LOGGER.warn("No se pudo sincronizar Telegram; revisa la configuración y conectividad del bot: {}",
                    exception.getMessage());
        }
    }

    @Transactional
    public void notifyComplaintCreated(Complaint complaint) {
        notifyUser(complaint.getTelegramUsername(),
                "Tu denuncia fue registrada con éxito. Recibirás actualizaciones del estado a través de este bot.",
                complaint.getId());
    }

    @Transactional
    public void notifyStatusChanged(Complaint complaint, String customMessage) {
        String message = "El estado de tu denuncia ha sido actualizado a: " + complaint.getStatus()
                + ". Gracias por colaborar en la mejora del campus.";
        if (customMessage != null && !customMessage.isBlank()) {
            message += "\n\nMensaje del equipo responsable:\n" + customMessage.trim();
        }
        notifyUser(complaint.getTelegramUsername(), message,
                complaint.getId());
    }

    private void notifyUser(String username, String message, Long complaintId) {
        if (botToken.isBlank() || username == null || username.isBlank()) return;
        Optional<TelegramContact> contact = contactRepository.findByUsername(TelegramContact.normalize(username));
        if (contact.isEmpty()) return;

        try {
            JsonNode response = restClient.post()
                    .uri("https://api.telegram.org/bot{token}/sendMessage", botToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("chat_id", contact.get().getChatId(), "text", message))
                    .retrieve()
                    .body(JsonNode.class);
            boolean sent = response != null && response.path("ok").asBoolean();
            if (!sent) {
                LOGGER.warn("Telegram rechazó el aviso para la denuncia {}.", complaintId);
            }
        } catch (RestClientException exception) {
            LOGGER.warn("No se pudo enviar el aviso de Telegram para la denuncia {}.", complaintId);
        }
    }

    @Transactional
    protected void saveContact(String chatId, String username, String displayName) {
        String normalizedUsername = TelegramContact.normalize(username);
        TelegramContact contact = contactRepository.findByUsername(normalizedUsername)
                .or(() -> contactRepository.findByChatId(chatId))
                .orElseGet(() -> new TelegramContact(chatId, normalizedUsername, displayName));
        contact.update(chatId, normalizedUsername, displayName);
        contactRepository.save(contact);
    }
}
