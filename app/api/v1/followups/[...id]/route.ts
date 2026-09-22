import { withApi, jsonOk } from "@/lib/api/route";
import { patchFollowup } from "@/lib/api/handlers";

export const PATCH = withApi(
  ["followups:write"],
  async (request, ctx, params) => {
    const body = await request.json();
    const raw = params.id;
    const parts: string[] = Array.isArray(raw)
      ? raw.map(String)
      : String(raw || "")
          .split("/")
          .filter(Boolean);
    const id =
      parts.length >= 2
        ? `${parts[0]}:${parts.slice(1).join(":")}`
        : decodeURIComponent(parts[0] || "");
    const data = await patchFollowup(ctx, id, body);
    return jsonOk(data);
  }
);
