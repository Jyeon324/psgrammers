package com.algoarena.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "boj_id", unique = true, nullable = false)
    private Integer bojId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "integer default 0")
    private Integer tier;

    @Column(columnDefinition = "text")
    private String category;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "input_description", columnDefinition = "text")
    private String inputDescription;

    @Column(name = "output_description", columnDefinition = "text")
    private String outputDescription;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TestCase> testCases;
}
