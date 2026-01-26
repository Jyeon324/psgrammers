package com.algoarena.dto;

import lombok.Data;

@Data
public class CreateSolutionRequest {
    private Integer problemId;
    private String code;
    private String language;
    private String status;
}
