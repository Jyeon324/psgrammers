import { useMutation } from "@tanstack/react-query";
import { api, type CompileRequest } from "@shared/routes";

const RUN_SERVER_ERROR = "코드 실행 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

export function useRunCode() {
  return useMutation({
    mutationFn: async (data: CompileRequest) => {
      const validated = api.compiler.run.input.parse(data);
      let res: Response;

      try {
        res = await fetch(api.compiler.run.path, {
          method: api.compiler.run.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
          credentials: "include",
        });
      } catch {
        throw new Error(RUN_SERVER_ERROR);
      }

      if (!res.ok) {
        throw new Error(RUN_SERVER_ERROR);
      }

      return api.compiler.run.responses[200].parse(await res.json());
    },
  });
}
