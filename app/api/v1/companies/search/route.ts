import { withApi, jsonOk } from "@/lib/api/route";
import { searchCompanies } from "@/lib/api/handlers";
import { ApiError } from "@/lib/api/errors";

export const GET = withApi(["companies:read"], async (request, ctx) => {
  const q = new URL(request.url).searchParams.get("q") || "";
  if (!q.trim()) {
    throw new ApiError(400, "validation_error", "Query param q is required");
  }
  const data = await searchCompanies(ctx, q.trim());
  return jsonOk(data);
});
