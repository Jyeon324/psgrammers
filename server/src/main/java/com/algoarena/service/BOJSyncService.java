package com.algoarena.service;

import com.algoarena.entity.Problem;
import com.algoarena.entity.TestCase;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class BOJSyncService {

    private static final String BOJ_URL_FORMAT = "https://www.acmicpc.net/problem/%d";

    public Problem scrapeProblem(int bojId) throws IOException {
        String url = String.format(BOJ_URL_FORMAT, bojId);
        // Add a User-Agent to avoid being blocked by some websites
        Document doc = Jsoup.connect(url)
                .userAgent(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .get();

        // Convert relative image URLs to absolute URLs
        Elements images = doc.select("img");
        for (Element img : images) {
            String src = img.attr("src");
            if (src.startsWith("/")) {
                img.attr("src", "https://www.acmicpc.net" + src);
            }
        }

        String title = doc.select("#problem_title").text();
        String description = doc.select("#problem_description").html();
        String inputDescription = doc.select("#problem_input").html();
        String outputDescription = doc.select("#problem_output").html();

        // Fetch additional metadata from Solved.ac API
        int tier = 0;
        String category = "";
        try {
            String solvedApiUrl = "https://solved.ac/api/v3/problem/show?problemId=" + bojId;
            String jsonResponse = Jsoup.connect(solvedApiUrl)
                    .ignoreContentType(true)
                    .execute()
                    .body();

            // Simple manual parsing to avoid adding new heavy dependencies if not needed
            // However, since we have Jackson via spring-boot-starter-web, we could use it.
            // For now, let's use a simple regex or just assume standard structure if we
            // don't want to define DTOs yet.
            // Better: use Jackson ObjectMapper which is available in Spring context.
            tier = extractIntFromJson(jsonResponse, "level");
            category = extractTagsFromJson(jsonResponse);
        } catch (Exception e) {
            System.err.println("Failed to fetch metadata from Solved.ac: " + e.getMessage());
        }

        Problem problem = Problem.builder()
                .bojId(bojId)
                .title(title)
                .tier(tier)
                .category(category)
                .description(description)
                .inputDescription(inputDescription)
                .outputDescription(outputDescription)
                .testCases(new ArrayList<>())
                .build();

        // Extract sample inputs and outputs
        for (int i = 1;; i++) {
            Element inputElem = doc.getElementById("sample-input-" + i);
            Element outputElem = doc.getElementById("sample-output-" + i);

            if (inputElem == null || outputElem == null) {
                break;
            }

            TestCase testCase = TestCase.builder()
                    .problem(problem)
                    .input(inputElem.text().trim())
                    .expectedOutput(outputElem.text().trim())
                    .sampleNumber(i)
                    .build();
            problem.getTestCases().add(testCase);
        }

        return problem;
    }

    private int extractIntFromJson(String json, String key) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + key + "\":\\s*(\\d+)");
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 0;
    }

    private String extractTagsFromJson(String json) {
        List<String> tags = new ArrayList<>();
        // Solved.ac tags structure: "tags": [{"key": "math", "displayNames":
        // [{"language": "ko", "name": "수학"}, ...

        // Find each tag object in the tags array
        java.util.regex.Pattern tagPattern = java.util.regex.Pattern
                .compile("\\{\"key\":.*?\"displayNames\":\\[(.*?)\\]");
        java.util.regex.Matcher tagMatcher = tagPattern.matcher(json);

        while (tagMatcher.find()) {
            String displayNames = tagMatcher.group(1);

            // Try to find the Korean name first
            java.util.regex.Pattern koPattern = java.util.regex.Pattern
                    .compile("\\{\"language\":\"ko\",\"name\":\"([^\"]+)\"");
            java.util.regex.Matcher koMatcher = koPattern.matcher(displayNames);

            if (koMatcher.find()) {
                tags.add(koMatcher.group(1));
            } else {
                // Fallback: search for English name if Korean is not found
                java.util.regex.Pattern enPattern = java.util.regex.Pattern
                        .compile("\\{\"language\":\"en\",\"name\":\"([^\"]+)\"");
                java.util.regex.Matcher enMatcher = enPattern.matcher(displayNames);
                if (enMatcher.find()) {
                    tags.add(enMatcher.group(1));
                }
            }
        }
        return String.join(",", tags);
    }
}
