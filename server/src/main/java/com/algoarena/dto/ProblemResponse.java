package com.algoarena.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProblemResponse {
    private Integer id;
    private Integer bojId;
    private String title;
    private Integer tier;
    private String category;
}
