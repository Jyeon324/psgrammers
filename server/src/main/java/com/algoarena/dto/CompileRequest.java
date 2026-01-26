package com.algoarena.dto;

import lombok.Data;

@Data
public class CompileRequest {
    private String code;
    private String language;
    private String input;
}
