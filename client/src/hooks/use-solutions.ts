import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateSolutionRequest } from "@shared/routes";

export function useSolutions(problemId?: number) {
  return useQuery({
    queryKey: [api.solutions.list.path, problemId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (problemId) params.append("problemId", problemId.toString());
      
      const url = `${api.solutions.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch solutions");
      
      const data = await res.json();
      return api.solutions.list.responses[200].parse(data);
    },
  });
}

export function useCreateSolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSolutionRequest) => {
      // Pick only the fields allowed by the schema
      const payload = {
        problemId: data.problemId,
        code: data.code,
        language: data.language,
        status: data.status
      };
      
      const validated = api.solutions.create.input.parse(payload);
      const res = await fetch(api.solutions.create.path, {
        method: api.solutions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.solutions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save solution");
      }

      return api.solutions.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.solutions.list.path] });
      // Invalidate specific problem solutions too
      queryClient.invalidateQueries({ queryKey: [api.solutions.list.path, variables.problemId] });
    },
  });
}
