package com.algoarena.service;

import com.algoarena.dto.CompileRequest;
import com.algoarena.dto.CompileResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class CompilerService {

    public CompileResponse compileAndRun(CompileRequest request) {
        String id = UUID.randomUUID().toString();
        Path tmpDir = Path.of(System.getProperty("java.io.tmpdir"));
        List<Path> cleanupPaths = new ArrayList<>();

        try {
            // Input file
            Path inputPath = tmpDir.resolve(id + ".in");
            if (request.getInput() != null) {
                Files.writeString(inputPath, request.getInput());
                cleanupPaths.add(inputPath);
            }

            String code = request.getCode();
            String language = request.getLanguage();
            String runCommand = "";
            Path sourcePath;

            if ("cpp".equals(language)) {
                sourcePath = tmpDir.resolve(id + ".cpp");
                Path binaryPath = tmpDir.resolve(id + ".out");
                cleanupPaths.add(sourcePath);
                cleanupPaths.add(binaryPath);
                Files.writeString(sourcePath, code);

                // Compile C++
                ProcessBuilder pb = new ProcessBuilder("/usr/bin/g++", sourcePath.toString(), "-o",
                        binaryPath.toString());
                pb.redirectErrorStream(true);
                Process process = pb.start();
                boolean finished = process.waitFor(5, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroy();
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
                runCommand = (request.getInput() != null && !request.getInput().isEmpty())
                        ? binaryPath.toString() + " < " + inputPath.toString()
                        : binaryPath.toString();
                // Note: ProcessBuilder doesn't support < shell redirection directly in command
                // list easily without shell
                // So we execute via sh -c or handle redirection in Java

            } else if ("python".equals(language)) {
                sourcePath = tmpDir.resolve(id + ".py");
                cleanupPaths.add(sourcePath);
                Files.writeString(sourcePath, code);
                runCommand = "python3 " + sourcePath.toString();
            } else if ("javascript".equals(language)) {
                sourcePath = tmpDir.resolve(id + ".js");
                cleanupPaths.add(sourcePath);
                Files.writeString(sourcePath, code);
                runCommand = "node " + sourcePath.toString();
            } else {
                throw new UnsupportedOperationException("Unsupported language: " + language);
            }

            // Run
            ProcessBuilder runPb;
            if (request.getInput() != null && !request.getInput().isEmpty()) {
                // To handle redirection properly without shell injection risk, ideally we pipe
                // streams.
                // But for simplicity mirroring exact behavior:
                if ("cpp".equals(language)) {
                    runPb = new ProcessBuilder(tmpDir.resolve(id + ".out").toString());
                } else if ("python".equals(language)) {
                    runPb = new ProcessBuilder("python3", sourcePath.toString());
                } else if ("javascript".equals(language)) {
                    runPb = new ProcessBuilder("node", sourcePath.toString());
                } else {
                    throw new RuntimeException("Unknown lang for run");
                }
                runPb.redirectInput(inputPath.toFile());
            } else {
                if ("cpp".equals(language)) {
                    runPb = new ProcessBuilder(tmpDir.resolve(id + ".out").toString());
                } else if ("python".equals(language)) {
                    runPb = new ProcessBuilder("python3", sourcePath.toString());
                } else if ("javascript".equals(language)) {
                    runPb = new ProcessBuilder("node", sourcePath.toString());
                } else {
                    throw new RuntimeException("Unknown lang for run");
                }
            }

            runPb.redirectErrorStream(true);
            Process runProcess = runPb.start();
            boolean runFinished = runProcess.waitFor(2, TimeUnit.SECONDS);
            if (!runFinished) {
                runProcess.destroy();
                throw new RuntimeException("Execution timed out");
            }

            String output = new String(runProcess.getInputStream().readAllBytes());

            return CompileResponse.builder()
                    .success(true)
                    .output(output)
                    .build();

        } catch (Exception e) {
            return CompileResponse.builder()
                    .success(false)
                    .error(e.getMessage())
                    .output("")
                    .build();
        } finally {
            for (Path p : cleanupPaths) {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                }
            }
        }
    }
}
