package com.algoarena.repository;

import com.algoarena.entity.Solution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolutionRepository extends JpaRepository<Solution, Integer> {
    List<Solution> findByUserId(String userId);

    List<Solution> findByUserIdAndProblem_Id(String userId, Integer problemId);
}
