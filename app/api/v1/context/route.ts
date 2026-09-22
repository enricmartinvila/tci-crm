import { withApi, jsonOk } from "@/lib/api/route";
import { getContext } from "@/lib/api/handlers";

export const GET = withApi(["companies:read"], async (_req, ctx) => {
  const data = await getContext(ctx);
  return jsonOk(data);
});
