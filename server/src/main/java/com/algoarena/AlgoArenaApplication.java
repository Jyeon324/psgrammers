package com.algoarena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AlgoArenaApplication {

    public static void main(String[] args) {
        // Handle local sync command
        if (args.length > 0 && String.join(" ", args).contains("--sync=")) {
            runLocalSync(args);
            return;
        }
        SpringApplication.run(AlgoArenaApplication.class, args);
    }

    private static void runLocalSync(String[] args) {
        try {
            int bojId = 0;
            String targetUrl = "";
            for (String arg : args) {
                if (arg.startsWith("--sync=")) {
                    bojId = Integer.parseInt(arg.split("=")[1]);
                } else if (arg.startsWith("--target=")) {
                    targetUrl = arg.split("=")[1];
                }
            }

            if (bojId == 0 || targetUrl.isEmpty()) {
                System.err.println("Usage: --sync=<bojId> --target=<importUrl>");
                return;
            }

            System.out.println("Starting local sync for problem " + bojId + " to " + targetUrl);

            com.algoarena.service.BOJSyncService scraper = new com.algoarena.service.BOJSyncService();
            com.algoarena.entity.Problem problem = scraper.scrapeProblem(bojId);

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            String json = mapper.writeValueAsString(problem);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(targetUrl))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("Successfully synced problem " + bojId);
            } else {
                System.err.println("Failed to sync. Status: " + response.statusCode() + ", Body: " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
