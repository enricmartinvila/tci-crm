import { withApi, jsonOk, paramId } from "@/lib/api/route";
import { getContact, patchContact } from "@/lib/api/handlers";

export const GET = withApi(["contacts:read"], async (_req, ctx, params) => {
  const data = await getContact(ctx, paramId(params));
  return jsonOk(data);
});

export const PATCH = withApi(["contacts:write"], async (request, ctx, params) => {
  const body = await request.json();
  const data = await patchContact(ctx, paramId(params), body);
  return jsonOk(data);
});
