package edu.universidad.sdu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SduApplication {

    public static void main(String[] args) {
        SpringApplication.run(SduApplication.class, args);
    }
}
