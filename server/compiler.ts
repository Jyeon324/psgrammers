import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export async function compileAndRun(code: string, input: string = ""): Promise<{ output: string; error?: string; success: boolean }> {
  const tmpDir = os.tmpdir();
  const id = randomUUID();
  const sourcePath = path.join(tmpDir, `${id}.cpp`);
  const binaryPath = path.join(tmpDir, `${id}.out`);
  const inputPath = path.join(tmpDir, `${id}.in`);

  try {
    await fs.writeFile(sourcePath, code);
    if (input) {
      await fs.writeFile(inputPath, input);
    }

    // Compile
    await new Promise<void>((resolve, reject) => {
      exec(`g++ ${sourcePath} -o ${binaryPath}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve();
        }
      });
    });

    // Run
    const runCommand = input ? `${binaryPath} < ${inputPath}` : binaryPath;
    const output = await new Promise<string>((resolve, reject) => {
      exec(runCommand, { timeout: 2000 }, (error, stdout, stderr) => {
        if (error) {
          // Check for timeout or runtime error
          reject(new Error(stderr || error.message));
        } else {
          resolve(stdout);
        }
      });
    });

    // Cleanup
    await Promise.allSettled([
      fs.unlink(sourcePath),
      fs.unlink(binaryPath),
      input ? fs.unlink(inputPath) : Promise.resolve()
    ]);

    return { output, success: true };

  } catch (error: any) {
    // Cleanup on error
    await Promise.allSettled([
      fs.unlink(sourcePath).catch(() => {}),
      fs.unlink(binaryPath).catch(() => {}),
      input ? fs.unlink(inputPath).catch(() => {}) : Promise.resolve()
    ]);

    return {
      output: "",
      error: error.message,
      success: false
    };
  }
}
