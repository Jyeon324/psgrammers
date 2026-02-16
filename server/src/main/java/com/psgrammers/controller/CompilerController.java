package com.psgrammers.controller;

import com.psgrammers.dto.CompileRequest;
import com.psgrammers.dto.CompileResponse;
import com.psgrammers.service.CompilerService;
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
