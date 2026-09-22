import { withApi, jsonOk } from "@/lib/api/route";
import { listFollowups, createFollowup } from "@/lib/api/handlers";

export const GET = withApi(["followups:read"], async (_req, ctx) => {
  const data = await listFollowups(ctx);
  return jsonOk(data);
});

export const POST = withApi(["followups:write"], async (request, ctx) => {
  const body = await request.json();
  const data = await createFollowup(ctx, body);
  return jsonOk(data, 201);
});
