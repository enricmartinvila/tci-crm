import { withApi, jsonOk } from "@/lib/api/route";
import { getPipeline } from "@/lib/api/handlers";

export const GET = withApi(["deals:read"], async (_req, ctx) => {
  const data = await getPipeline(ctx);
  return jsonOk(data);
});
