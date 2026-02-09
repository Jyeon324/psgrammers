package com.algoarena.service;

import com.algoarena.entity.Problem;
import com.algoarena.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final BOJSyncService bojSyncService;

    @Transactional
    public Problem syncProblem(int bojId) throws IOException {
        Problem scrapedProblem = bojSyncService.scrapeProblem(bojId);

        return problemRepository.findByBojId(bojId)
                .map(existing -> {
                    existing.setTitle(scrapedProblem.getTitle());
                    existing.setTier(scrapedProblem.getTier());
                    existing.setCategory(scrapedProblem.getCategory());
                    existing.setDescription(scrapedProblem.getDescription());
                    existing.setInputDescription(scrapedProblem.getInputDescription());
                    existing.setOutputDescription(scrapedProblem.getOutputDescription());

                    // Update test cases
                    existing.getTestCases().clear();
                    scrapedProblem.getTestCases().forEach(tc -> {
                        tc.setProblem(existing);
                        existing.getTestCases().add(tc);
                    });

                    return problemRepository.save(existing);
                })
                .orElseGet(() -> problemRepository.save(scrapedProblem));
    }

    @Transactional
    public Problem getOrScrapeProblem(int bojId) {
        return problemRepository.findByBojId(bojId)
                .orElseGet(() -> {
                    try {
                        return syncProblem(bojId);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to scrape problem " + bojId, e);
                    }
                });
    }

    @Transactional
    public Problem saveProblem(Problem problem) {
        // Ensure test cases have back-reference to problem
        if (problem.getTestCases() != null) {
            problem.getTestCases().forEach(tc -> tc.setProblem(problem));
        }

        return problemRepository.findByBojId(problem.getBojId())
                .map(existing -> {
                    existing.setTitle(problem.getTitle());
                    existing.setTier(problem.getTier());
                    existing.setCategory(problem.getCategory());
                    existing.setDescription(problem.getDescription());
                    existing.setInputDescription(problem.getInputDescription());
                    existing.setOutputDescription(problem.getOutputDescription());

                    existing.getTestCases().clear();
                    if (problem.getTestCases() != null) {
                        problem.getTestCases().forEach(tc -> {
                            tc.setProblem(existing);
                            existing.getTestCases().add(tc);
                        });
                    }
                    return problemRepository.save(existing);
                })
                .orElseGet(() -> problemRepository.save(problem));
    }
}
