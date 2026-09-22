import { withApi, jsonOk } from "@/lib/api/route";
import { listActivities, createActivity } from "@/lib/api/handlers";

export const GET = withApi(["activities:read"], async (request, ctx) => {
  const url = new URL(request.url);
  const data = await listActivities(ctx, {
    company_id: url.searchParams.get("company_id") || undefined,
    limit: Number(url.searchParams.get("limit") || 50) || 50,
  });
  return jsonOk(data);
});

export const POST = withApi(["activities:write"], async (request, ctx) => {
  const body = await request.json();
  const data = await createActivity(ctx, body);
  return jsonOk(data, 201);
});
