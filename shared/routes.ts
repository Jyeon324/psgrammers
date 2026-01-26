import { z } from 'zod';
import { insertProblemSchema, insertSolutionSchema, problems, solutions, Problem, TestCase } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  problems: {
    list: {
      method: 'GET' as const,
      path: '/api/problems',
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        tier: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof problems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/problems/:id',
      responses: {
        200: z.custom<Problem>(),
        404: errorSchemas.notFound,
      },
    },
    sync: {
      method: "POST" as const,
      path: "/api/problems/sync",
      input: z.object({ bojId: z.number() }),
      responses: {
        201: z.custom<Problem>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  solutions: {
    list: {
      method: 'GET' as const,
      path: '/api/solutions',
      input: z.object({
        problemId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof solutions.$inferSelect & { problem: typeof problems.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/solutions',
      input: insertSolutionSchema.pick({ problemId: true, code: true, language: true, status: true }),
      responses: {
        201: z.custom<typeof solutions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  compiler: {
    run: {
      method: 'POST' as const,
      path: '/api/compiler/run',
      input: z.object({
        code: z.string(),
        language: z.string(),
        input: z.string().optional(),
      }),
      responses: {
        200: z.object({
          output: z.string(),
          error: z.string().nullish(),
          success: z.boolean(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
