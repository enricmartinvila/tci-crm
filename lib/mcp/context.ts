import { AsyncLocalStorage } from "async_hooks";
import type { ApiAuthContext } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

const storage = new AsyncLocalStorage<ApiAuthContext>();

export function runWithMcpAuth<T>(ctx: ApiAuthContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getMcpAuth(): ApiAuthContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new ApiError(
      401,
      "unauthorized",
      "MCP auth context missing. Pass Authorization: Bearer tci_…"
    );
  }
  return ctx;
}

export function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function toolError(err: unknown) {
  if (err instanceof ApiError) {
    return {
      isError: true as const,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { error: err.message, code: err.code, details: err.details },
            null,
            2
          ),
        },
      ],
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}
