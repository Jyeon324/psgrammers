import { db } from "./db";
import {
  users, problems, solutions,
  type User, type InsertUser,
  type Problem, type InsertProblem,
  type Solution, type InsertSolution,
  type CreateSolutionRequest
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth (delegated to authStorage)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Problems
  getProblems(filters?: { search?: string; category?: string; tier?: number }): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  getProblemByBojId(bojId: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;

  // Solutions
  getSolutions(userId: string, problemId?: number): Promise<(Solution & { problem: Problem })[]>;
  createSolution(userId: string, solution: CreateSolutionRequest): Promise<Solution>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: InsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // Problem methods
  async getProblems(filters?: { search?: string; category?: string; tier?: number }): Promise<Problem[]> {
    let query = db.select().from(problems);

    if (filters) {
      // Implement basic filtering if needed. Drizzle query builder is flexible.
      // For now, returning all or filtering in memory for simplicity if complex query needed without more deps.
      // But let's try basic filtering.
      const conditions = [];
      if (filters.tier) conditions.push(eq(problems.tier, filters.tier));
      if (filters.category) conditions.push(eq(problems.category, filters.category));
      // Search is harder with just eq, ignoring for MVP or using ilike if available/needed later
    }

    return await query.orderBy(desc(problems.id));
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    return problem;
  }

  async getProblemByBojId(bojId: number): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.bojId, bojId));
    return problem;
  }

  async createProblem(problem: InsertProblem): Promise<Problem> {
    const [newProblem] = await db.insert(problems).values(problem).returning();
    return newProblem;
  }

  // Solution methods
  async getSolutions(userId: string, problemId?: number): Promise<(Solution & { problem: Problem })[]> {
    let query = db
      .select({
        id: solutions.id,
        userId: solutions.userId,
        problemId: solutions.problemId,
        code: solutions.code,
        language: solutions.language,
        status: solutions.status,
        createdAt: solutions.createdAt,
        problem: problems,
      })
      .from(solutions)
      .innerJoin(problems, eq(solutions.problemId, problems.id))
      .where(eq(solutions.userId, userId));

    if (problemId) {
      query.where(and(eq(solutions.userId, userId), eq(solutions.problemId, problemId)));
    }

    const results = await query.orderBy(desc(solutions.createdAt));

    // Map result to match expected type structure if needed, but the join result above is flat-ish
    // Drizzle returns { solutions: ..., problems: ... } if using .select().from().innerJoin() without custom selection
    // With custom selection object as above, it returns the object structure.
    // Actually, let's use the object syntax for inner join which is cleaner in newer drizzle
    // or just manual mapping. Let's stick to standard join.

    // Re-writing query for safety with types
    const rows = await db
      .select()
      .from(solutions)
      .innerJoin(problems, eq(solutions.problemId, problems.id))
      .where(eq(solutions.userId, userId))
      .orderBy(desc(solutions.createdAt));

    return rows.map(row => ({
      ...row.solutions,
      problem: row.problems
    }));
  }

  async createSolution(userId: string, solution: CreateSolutionRequest): Promise<Solution> {
    const [newSolution] = await db.insert(solutions).values({
      ...solution,
      userId,
    }).returning();
    return newSolution;
  }
}

export const storage = new DatabaseStorage();
