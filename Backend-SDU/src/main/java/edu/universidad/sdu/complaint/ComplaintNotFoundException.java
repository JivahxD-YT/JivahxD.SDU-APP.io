package edu.universidad.sdu.complaint;

public class ComplaintNotFoundException extends RuntimeException {

    public ComplaintNotFoundException(Long id) {
        super("No existe una denuncia con el ID " + id + ".");
    }

    public ComplaintNotFoundException(String message) {
        super(message);
    }
}
