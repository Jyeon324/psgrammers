package com.algoarena.service;

import com.algoarena.entity.Problem;
import com.algoarena.entity.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BOJSyncService {

    @Value("${app.bridge.url:https://psgrammers.vercel.app/api/scrape?id=}")
    private String bridgeUrl;

    private final RestTemplate restTemplate;

    public BOJSyncService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Problem scrapeProblem(int bojId) throws IOException {
        String url = bridgeUrl + bojId;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new IOException("Empty response from bridge");
            }

            Problem problem = Problem.builder()
                    .bojId(bojId)
                    .title((String) response.get("title"))
                    .tier((Integer) response.get("tier"))
                    .category((String) response.get("category"))
                    .description((String) response.get("description"))
                    .inputDescription((String) response.get("inputDescription"))
                    .outputDescription((String) response.get("outputDescription"))
                    .testCases(new ArrayList<>())
                    .build();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> testCases = (List<Map<String, Object>>) response.get("testCases");
            if (testCases != null) {
                for (Map<String, Object> tc : testCases) {
                    TestCase testCase = TestCase.builder()
                            .problem(problem)
                            .input((String) tc.get("input"))
                            .expectedOutput((String) tc.get("expectedOutput"))
                            .sampleNumber((Integer) tc.get("sampleNumber"))
                            .build();
                    problem.getTestCases().add(testCase);
                }
            }

            return problem;
        } catch (Exception e) {
            throw new IOException("Failed to fetch problem from bridge: " + e.getMessage(), e);
        }
    }
}
