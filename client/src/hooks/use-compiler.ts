import { useMutation } from "@tanstack/react-query";
import { api, type CompileRequest } from "@shared/routes";

export function useRunCode() {
  return useMutation({
    mutationFn: async (data: CompileRequest) => {
      const validated = api.compiler.run.input.parse(data);
      const res = await fetch(api.compiler.run.path, {
        method: api.compiler.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to run code");
      }

      return api.compiler.run.responses[200].parse(await res.json());
    },
  });
}
