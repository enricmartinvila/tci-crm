import { withApi, jsonOk, paramId } from "@/lib/api/route";
import { getDeal, patchDeal } from "@/lib/api/handlers";

export const GET = withApi(["deals:read"], async (_req, ctx, params) => {
  const data = await getDeal(ctx, paramId(params));
  return jsonOk(data);
});

export const PATCH = withApi(["deals:write"], async (request, ctx, params) => {
  const body = await request.json();
  const data = await patchDeal(ctx, paramId(params), body);
  return jsonOk(data);
});
