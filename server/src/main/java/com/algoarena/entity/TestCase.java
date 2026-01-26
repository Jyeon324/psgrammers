package com.algoarena.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    @JsonIgnore
    private Problem problem;

    @Column(columnDefinition = "text")
    private String input;

    @Column(name = "expected_output", columnDefinition = "text")
    private String expectedOutput;

    @Column(name = "sample_number")
    private Integer sampleNumber;
}
