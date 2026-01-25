import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export async function compileAndRun(
  code: string,
  language: string,
  input: string = ""
): Promise<{ output: string; error?: string; success: boolean }> {
  const tmpDir = os.tmpdir();
  const id = randomUUID();
  const inputPath = path.join(tmpDir, `${id}.in`);

  try {
    if (input) {
      await fs.writeFile(inputPath, input);
    }

    let runCommand = "";
    let sourcePath = "";
    let cleanupPaths: string[] = [inputPath];

    if (language === "cpp") {
      sourcePath = path.join(tmpDir, `${id}.cpp`);
      const binaryPath = path.join(tmpDir, `${id}.out`);
      cleanupPaths.push(sourcePath, binaryPath);
      await fs.writeFile(sourcePath, code);

      // Compile C++
      await new Promise<void>((resolve, reject) => {
        exec(`g++ ${sourcePath} -o ${binaryPath}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
          } else {
            resolve();
          }
        });
      });
      runCommand = input ? `${binaryPath} < ${inputPath}` : binaryPath;
    } else if (language === "python") {
      sourcePath = path.join(tmpDir, `${id}.py`);
      cleanupPaths.push(sourcePath);
      await fs.writeFile(sourcePath, code);
      runCommand = input ? `python3 ${sourcePath} < ${inputPath}` : `python3 ${sourcePath}`;
    } else if (language === "javascript") {
      sourcePath = path.join(tmpDir, `${id}.js`);
      cleanupPaths.push(sourcePath);
      await fs.writeFile(sourcePath, code);
      runCommand = input ? `node ${sourcePath} < ${inputPath}` : `node ${sourcePath}`;
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Run
    const output = await new Promise<string>((resolve, reject) => {
      exec(runCommand, { timeout: 2000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve(stdout);
        }
      });
    });

    // Cleanup
    await Promise.allSettled(cleanupPaths.map(p => fs.unlink(p)));

    return { output, success: true };

  } catch (error: any) {
    // Attempt cleanup on error
    return {
      output: "",
      error: error.message,
      success: false
    };
  }
}
