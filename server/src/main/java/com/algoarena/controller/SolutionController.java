package com.algoarena.controller;

import com.algoarena.dto.CreateSolutionRequest;
import com.algoarena.entity.Solution;
import com.algoarena.entity.User;
import com.algoarena.repository.SolutionRepository;
import com.algoarena.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {

    private final SolutionRepository solutionRepository;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<Solution>> getSolutions(
            HttpSession session,
            @RequestParam(required = false) Integer problemId) {
        User user = authService.getCurrentUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Solution> solutions;
        if (problemId != null) {
            solutions = solutionRepository.findByUserIdAndProblemId(user.getId(), problemId);
        } else {
            solutions = solutionRepository.findByUserId(user.getId());
        }
        return ResponseEntity.ok(solutions);
    }

    @PostMapping
    public ResponseEntity<Solution> createSolution(
            HttpSession session,
            @RequestBody CreateSolutionRequest request) {
        User user = authService.getCurrentUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Solution solution = Solution.builder()
                .userId(user.getId())
                .problemId(request.getProblemId())
                .code(request.getCode())
                .language(request.getLanguage())
                .status(request.getStatus() != null ? request.getStatus() : "solved")
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(solutionRepository.save(solution));
    }
}
