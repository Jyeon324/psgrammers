package com.psgrammers.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompileResponse {
    private String output;
    private String error;
    private boolean success;
}
