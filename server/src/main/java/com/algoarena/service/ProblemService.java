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
}
