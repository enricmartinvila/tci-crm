import { withApi, jsonOk, paramId } from "@/lib/api/route";
import { getCompany, patchCompany } from "@/lib/api/handlers";

export const GET = withApi(["companies:read"], async (_req, ctx, params) => {
  const data = await getCompany(ctx, paramId(params));
  return jsonOk(data);
});

export const PATCH = withApi(["companies:write"], async (request, ctx, params) => {
  const body = await request.json();
  const data = await patchCompany(ctx, paramId(params), body);
  return jsonOk(data);
});
