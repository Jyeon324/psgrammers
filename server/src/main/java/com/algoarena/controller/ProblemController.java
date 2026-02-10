package com.algoarena.controller;

import com.algoarena.entity.Problem;
import com.algoarena.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemRepository problemRepository;
    private final com.algoarena.service.ProblemService problemService;

    @GetMapping
    public List<Problem> getProblems() {
        return problemRepository.findAll();
    }

    @GetMapping("/{bojId}")
    public ResponseEntity<Problem> getProblem(@PathVariable Integer bojId) {
        try {
            return ResponseEntity.ok(problemService.getOrScrapeProblem(bojId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<Problem> syncProblem(@RequestBody com.algoarena.dto.SyncProblemRequest request)
            throws java.io.IOException {
        return ResponseEntity.ok(problemService.syncProblem(request.getBojId()));
    }

    @PostMapping("/import")
    public ResponseEntity<Problem> importProblem(@RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.saveProblem(problem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Integer id) {
        problemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
