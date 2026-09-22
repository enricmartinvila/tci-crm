import { withApi, jsonOk } from "@/lib/api/route";
import { listCompanies, createCompany } from "@/lib/api/handlers";

export const GET = withApi(["companies:read"], async (request, ctx) => {
  const url = new URL(request.url);
  const data = await listCompanies(ctx, {
    q: url.searchParams.get("q") || undefined,
    status: url.searchParams.get("status") || undefined,
    priority: url.searchParams.get("priority") || undefined,
    limit: Number(url.searchParams.get("limit") || 50) || 50,
  });
  return jsonOk(data);
});

export const POST = withApi(["companies:write"], async (request, ctx) => {
  const body = await request.json();
  const data = await createCompany(ctx, body);
  return jsonOk(data, 201);
});
