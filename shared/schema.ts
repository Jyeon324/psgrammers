import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export const insertSolutionSchema = createInsertSchema(solutions).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===

export type Problem = typeof problems.$inferSelect & {
  testCases?: TestCase[];
};

export type TestCase = typeof testCases.$inferSelect;

export type Solution = typeof solutions.$inferSelect;
