import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type SyncProblemRequest } from "@shared/routes";
import type { Problem } from "@shared/schema";
import { z } from "zod";

export function useProblems(filters?: { search?: string; category?: string; tier?: number }) {
  return useQuery({
    queryKey: [api.problems.list.path, filters],
    queryFn: async () => {
      // Build query string manually or use URLSearchParams
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.tier) params.append("tier", filters.tier.toString());

      const url = `${api.problems.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch problems");

      const data = await res.json();
      return api.problems.list.responses[200].parse(data);
    },
  });
}

export function useProblem(bojId: number) {
  return useQuery({
    queryKey: [api.problems.get.path, bojId],
    queryFn: async () => {
      const url = buildUrl(api.problems.get.path, { bojId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch problem");

      const data = await res.json();
      return api.problems.get.responses[200].parse(data);
    },
    enabled: !!bojId,
  });
}

export function useSyncProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SyncProblemRequest) => {
      const validated = api.problems.sync.input.parse(data);
      const res = await fetch(api.problems.sync.path, {
        method: api.problems.sync.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.problems.sync.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
          const error = api.problems.sync.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to sync problem");
      }

      return api.problems.sync.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.problems.list.path] });
    },
  });
}
export function useDeleteProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.problems.delete.path, { id });
      const res = await fetch(url, {
        method: api.problems.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete problem");
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.problems.list.path] });
    },
  });
}
