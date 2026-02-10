package com.algoarena.service;

import com.algoarena.dto.CompileRequest;
import com.algoarena.dto.CompileResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class CompilerService {

    private static final int COMPILE_TIMEOUT_SECONDS = 10;
    private static final int RUN_TIMEOUT_SECONDS = 10;
    private static final int MAX_OUTPUT_BYTES = 64 * 1024; // 64KB

    public CompileResponse compileAndRun(CompileRequest request) {
        String id = UUID.randomUUID().toString();
        Path sandboxDir = Path.of(System.getProperty("java.io.tmpdir"), "algoarena-" + id);

        try {
            Files.createDirectories(sandboxDir);

            // Input file
            Path inputPath = sandboxDir.resolve("input.in");
            if (request.getInput() != null) {
                Files.writeString(inputPath, request.getInput());
            }

            String code = request.getCode();
            String language = request.getLanguage();
            Path sourcePath;

            if ("cpp".equals(language)) {
                sourcePath = sandboxDir.resolve("solution.cpp");
                Path binaryPath = sandboxDir.resolve("solution.out");
                Files.writeString(sourcePath, code);

                // Compile C++
                ProcessBuilder pb = new ProcessBuilder("g++", sourcePath.toString(), "-o",
                        binaryPath.toString());
                pb.directory(sandboxDir.toFile());
                pb.redirectErrorStream(true);
                Process process = pb.start();
                boolean finished = process.waitFor(COMPILE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    return CompileResponse.builder()
                            .success(false)
                            .error("Compilation timed out")
                            .output("")
                            .build();
                }
                if (process.exitValue() != 0) {
                    String errorOutput = new String(process.getInputStream().readAllBytes());
                    log.error("Compilation failed: {}", errorOutput);
                    return CompileResponse.builder()
                            .success(false)
                            .error("Compilation failed: " + errorOutput)
                            .output("")
                            .build();
                }

            } else if ("python".equals(language)) {
                sourcePath = sandboxDir.resolve("solution.py");
                Files.writeString(sourcePath, code);
            } else if ("javascript".equals(language)) {
                sourcePath = sandboxDir.resolve("solution.js");
                Files.writeString(sourcePath, code);
            } else {
                return CompileResponse.builder()
                        .success(false)
                        .error("Unsupported language: " + language)
                        .output("")
                        .build();
            }

            ProcessBuilder runPb = buildRunProcessBuilder(language, sandboxDir, sourcePath);
            runPb.directory(sandboxDir.toFile());

            if (request.getInput() != null && !request.getInput().isEmpty()) {
                runPb.redirectInput(inputPath.toFile());
            }

            runPb.redirectErrorStream(true);
            Process runProcess = runPb.start();
            boolean runFinished = runProcess.waitFor(RUN_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!runFinished) {
                runProcess.destroyForcibly();
                return CompileResponse.builder()
                        .success(false)
                        .error("Execution timed out (limit: " + RUN_TIMEOUT_SECONDS + "s)")
                        .output("")
                        .build();
            }

            byte[] outputBytes = runProcess.getInputStream().readAllBytes();
            String output;
            if (outputBytes.length > MAX_OUTPUT_BYTES) {
                output = new String(outputBytes, 0, MAX_OUTPUT_BYTES) + "\n... (output truncated, limit: 64KB)";
            } else {
                output = new String(outputBytes);
            }

            return CompileResponse.builder()
                    .success(runProcess.exitValue() == 0)
                    .output(output)
                    .error(runProcess.exitValue() != 0 ? output : null)
                    .build();

        } catch (Exception e) {
            log.error("Compile/run error: {}", e.getMessage(), e);
            return CompileResponse.builder()
                    .success(false)
                    .error(e.getMessage())
                    .output("")
                    .build();
        } finally {
            cleanupSandbox(sandboxDir);
        }
    }

    private ProcessBuilder buildRunProcessBuilder(String language, Path sandboxDir, Path sourcePath) {
        return switch (language) {
            case "cpp" -> new ProcessBuilder(sandboxDir.resolve("solution.out").toString());
            case "python" -> new ProcessBuilder("python3", sourcePath.toString());
            case "javascript" -> new ProcessBuilder("node", sourcePath.toString());
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private void cleanupSandbox(Path sandboxDir) {
        try {
            if (Files.exists(sandboxDir)) {
                Files.walk(sandboxDir)
                        .sorted(java.util.Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (IOException ignored) {
                            }
                        });
            }
        } catch (IOException e) {
            log.warn("Failed to cleanup sandbox directory: {}", sandboxDir, e);
        }
    }
}
