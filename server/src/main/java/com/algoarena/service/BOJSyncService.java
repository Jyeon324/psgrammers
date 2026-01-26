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

        Problem problem = Problem.builder()
                .bojId(bojId)
                .title(title)
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

            // Using pure text and trimming to avoid hidden HTML or extra whitespace issues
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
}
