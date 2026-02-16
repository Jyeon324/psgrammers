package com.psgrammers.repository;

import com.psgrammers.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Integer> {
    Optional<Problem> findByBojId(Integer bojId);
}
