import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { compileAndRun } from "./compiler";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Problems
  app.get(api.problems.list.path, async (req, res) => {
    const filters = api.problems.list.input?.parse(req.query);
    const problems = await storage.getProblems(filters);
    res.json(problems);
  });

  app.get(api.problems.get.path, async (req, res) => {
    const problem = await storage.getProblem(Number(req.params.id));
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  });

  app.post(api.problems.sync.path, async (req, res) => {
    try {
      const { bojId } = api.problems.sync.input.parse(req.body);

      // Check if already exists
      const existing = await storage.getProblemByBojId(bojId);
      if (existing) return res.status(200).json(existing);

      // Fetch from solved.ac API
      const response = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${bojId}`);
      if (!response.ok) {
        return res.status(404).json({ message: "Problem not found on Solved.ac" });
      }
      const data = await response.json();

      const newProblem = await storage.createProblem({
        bojId: data.problemId,
        title: data.titleKo,
        tier: data.level,
        category: data.tags.map((t: any) => t.displayNames[0].name).join(", "),
      });

      res.status(201).json(newProblem);
    } catch (error) {
      res.status(500).json({ message: "Failed to sync problem" });
    }
  });

  // Solutions
  app.get(api.solutions.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { problemId } = req.query;
    const solutions = await storage.getSolutions(userId, problemId ? Number(problemId) : undefined);
    res.json(solutions);
  });

  app.post(api.solutions.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.solutions.create.input.parse(req.body);
    const solution = await storage.createSolution(userId, { ...input, status: input.status || "solved" });
    res.status(201).json(solution);
  });

  // Compiler
  app.post(api.compiler.run.path, async (req, res) => {
    try {
      const { code, language, input } = api.compiler.run.input.parse(req.body);
      const result = await compileAndRun(code, language, input);
      res.json(result);
    } catch (error: any) {
      res.status(200).json({ success: false, output: "", error: error.message });
    }
  });

  // Seeding
  (async () => {
    try {
      const existing = await storage.getProblems();
      if (existing.length === 0) {
        console.log("Seeding initial problems...");
        const initialProblems = [
          1000, // A+B
          1001, // A-B
          2557, // Hello World
          2739, // 구구단
        ];
        
        for (const bojId of initialProblems) {
          try {
             // Re-use logic or call sync internal function if refactored, 
             // but here I'll just duplicate the fetch logic briefly or call the endpoint locally if I could (harder).
             // Let's just do a direct fetch/insert here.
             const response = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${bojId}`);
             if (response.ok) {
               const data = await response.json();
               await storage.createProblem({
                 bojId: data.problemId,
                 title: data.titleKo,
                 tier: data.level,
                 category: data.tags.map((t: any) => t.displayNames[0].name).join(", "),
               });
             }
          } catch (e) {
            console.error(`Failed to seed ${bojId}`, e);
          }
        }
        console.log("Seeding complete.");
      }
    } catch (err) {
      console.error("Seeding failed:", err);
    }
  })();

  return httpServer;
}
