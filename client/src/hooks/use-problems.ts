import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

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
