import { authenticateRequest } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/errors";
import type { ApiScope } from "@/lib/api/scopes";

export type RouteParams = Record<string, string | string[] | undefined>;

export function paramId(params: RouteParams, key = "id"): string {
  const raw = params[key];
  if (Array.isArray(raw)) return String(raw[0] || "");
  return String(raw || "");
}

export function withApi(
  scopes: ApiScope[],
  handler: (
    request: Request,
    ctx: Awaited<ReturnType<typeof authenticateRequest>>,
    params: RouteParams
  ) => Promise<Response>
) {
  return async (
    request: Request,
    context?: { params: Promise<RouteParams> }
  ) => {
    try {
      const auth = await authenticateRequest(request, scopes);
      const params = context?.params ? await context.params : {};
      return await handler(request, auth, params);
    } catch (err) {
      return jsonError(err);
    }
  };
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export { jsonOk };
