import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";

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

// === EXPLICIT TYPES ===

export type Problem = typeof problems.$inferSelect & {
  testCases?: TestCase[];
};

export type TestCase = typeof testCases.$inferSelect;
