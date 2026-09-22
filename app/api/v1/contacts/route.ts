import { withApi, jsonOk } from "@/lib/api/route";
import { listContacts, createContact } from "@/lib/api/handlers";

export const GET = withApi(["contacts:read"], async (request, ctx) => {
  const url = new URL(request.url);
  const data = await listContacts(ctx, {
    company_id: url.searchParams.get("company_id") || undefined,
    q: url.searchParams.get("q") || undefined,
    limit: Number(url.searchParams.get("limit") || 50) || 50,
  });
  return jsonOk(data);
});

export const POST = withApi(["contacts:write"], async (request, ctx) => {
  const body = await request.json();
  const data = await createContact(ctx, body);
  return jsonOk(data, 201);
});
