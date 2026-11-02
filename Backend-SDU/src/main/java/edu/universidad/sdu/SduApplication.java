package edu.universidad.sdu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Punto de entrada de la aplicación monolítica de denuncias.
 * Spring Boot configura las rutas REST, la persistencia, la seguridad y las tareas programadas.
 */
@SpringBootApplication
@EnableScheduling
public class SduApplication {

    public static void main(String[] args) {
        SpringApplication.run(SduApplication.class, args);
    }
}
