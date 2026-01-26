import { pgTable, text, serial, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  bojId: integer("boj_id").unique().notNull(),
  title: text("title").notNull(),
  tier: integer("tier").default(0), // Solved.ac tier
  category: text("category"), // JSON string or simple text tag
  description: text("description"),
  inputDescription: text("input_description"),
  outputDescription: text("output_description"),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  input: text("input").notNull(),
  expectedOutput: text("output").notNull(),
  sampleNumber: integer("sample_number"),
});

export const solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // No FK constraint for simplicity with Replit Auth, or add if consistent
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  code: text("code").notNull(),
  language: text("language").default("cpp"),
  status: text("status").default("pending"), // 'solved', 'failed', 'pending'
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertProblemSchema = createInsertSchema(problems).omit({ id: true });
export const insertSolutionSchema = createInsertSchema(solutions).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===

export type Problem = typeof problems.$inferSelect & {
  testCases?: TestCase[];
};
export type InsertProblem = z.infer<typeof insertProblemSchema>;

export type TestCase = typeof testCases.$inferSelect;

export type Solution = typeof solutions.$inferSelect;
export type InsertSolution = z.infer<typeof insertSolutionSchema>;

// Request Types
export type CreateSolutionRequest = {
  problemId: number;
  code: string;
  language: string;
  status: string;
};

// Compiler Types
export type CompileRequest = {
  code: string;
  language: string;
  input?: string;
};

export type CompileResponse = {
  output: string;
  error?: string;
  success: boolean;
};

// BOJ Sync Type
export type SyncProblemRequest = {
  bojId: number;
};
