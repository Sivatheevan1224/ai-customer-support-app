package com.support.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class AiCustomerSupportApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AiCustomerSupportApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            File envFile = new File(".env");
            if (!envFile.exists()) {
                envFile = new File("ai-customer-support-app/backend/.env");
            }
            if (!envFile.exists()) {
                envFile = new File("backend/.env");
            }
            if (envFile.exists()) {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) continue;
                    
                    // Remove inline comments
                    if (line.contains("#")) {
                        line = line.substring(0, line.indexOf('#')).trim();
                    }
                    
                    int eqIdx = line.indexOf('=');
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();

                    System.setProperty(key, value);
                }
            }
        } catch (Exception e) {
            System.out.println("Notice: Could not auto-load .env file: " + e.getMessage());
        }
    }
}
