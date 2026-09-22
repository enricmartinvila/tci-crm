import { withApi, jsonOk } from "@/lib/api/route";
import { listDeals, createDeal } from "@/lib/api/handlers";

export const GET = withApi(["deals:read"], async (request, ctx) => {
  const url = new URL(request.url);
  const data = await listDeals(ctx, {
    stage: url.searchParams.get("stage") || undefined,
    company_id: url.searchParams.get("company_id") || undefined,
    limit: Number(url.searchParams.get("limit") || 50) || 50,
  });
  return jsonOk(data);
});

export const POST = withApi(["deals:write"], async (request, ctx) => {
  const body = await request.json();
  const data = await createDeal(ctx, body);
  return jsonOk(data, 201);
});
