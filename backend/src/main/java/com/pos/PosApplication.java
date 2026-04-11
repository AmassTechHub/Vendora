package com.pos;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PosApplication {

    /**
     * Loads {@code backend/.env} if present (does not override real OS env vars).
     * Lets you point {@code SPRING_PROFILES_ACTIVE=prod} at Supabase locally without pasting secrets into the shell.
     */
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(e -> {
            String key = e.getKey();
            if (System.getenv(key) == null) {
                System.setProperty(key, e.getValue());
            }
        });
        SpringApplication.run(PosApplication.class, args);
    }
}
