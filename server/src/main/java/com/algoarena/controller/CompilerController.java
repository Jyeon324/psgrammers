package com.algoarena.controller;

import com.algoarena.dto.CompileRequest;
import com.algoarena.dto.CompileResponse;
import com.algoarena.service.CompilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compiler")
@RequiredArgsConstructor
public class CompilerController {

    private final CompilerService compilerService;

    @PostMapping("/run")
    public CompileResponse run(@RequestBody CompileRequest request) {
        return compilerService.compileAndRun(request);
    }
}
