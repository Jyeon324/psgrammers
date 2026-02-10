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
                    updateProblemFields(existing, scrapedProblem);
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

    private void updateProblemFields(Problem existing, Problem source) {
        existing.setTitle(source.getTitle());
        existing.setTier(source.getTier());
        existing.setCategory(source.getCategory());
        existing.setDescription(source.getDescription());
        existing.setInputDescription(source.getInputDescription());
        existing.setOutputDescription(source.getOutputDescription());

        existing.getTestCases().clear();
        if (source.getTestCases() != null) {
            source.getTestCases().forEach(tc -> {
                tc.setProblem(existing);
                existing.getTestCases().add(tc);
            });
        }
    }
}
