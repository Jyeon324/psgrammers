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

    @GetMapping
    public List<Problem> getProblems() {
        return problemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblem(@PathVariable Integer id) {
        return problemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Solved.ac Sync logic could be added here if requested,
    // for now we stick to basic CRUD as part of migration.
    // Sync logic requires HTTP Client.
}
