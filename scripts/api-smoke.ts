/**
 * Manual smoke against a running app.
 *
 *   API_BASE=http://localhost:3000 API_KEY=tci_... npx tsx scripts/api-smoke.ts
 *
 * Expects migration 005 applied and a valid workspace API key.
 */

const base = (process.env.API_BASE || "http://localhost:3000").replace(/\/$/, "");
const key = process.env.API_KEY;

if (!key) {
  console.error("Set API_KEY=tci_...");
  process.exit(1);
}

async function req(path: string, init: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { status: res.status, body };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log("OpenAPI…");
  const openapi = await req("/api/openapi.json");
  assert(openapi.status === 200, `openapi ${openapi.status}`);
  const spec = openapi.body as { paths?: Record<string, unknown> };
  const paths = Object.keys(spec.paths || {});
  assert(paths.length > 0, "openapi has no paths");
  for (const p of paths) {
    const methods = Object.keys(spec.paths![p] as object).map((m) =>
      m.toUpperCase()
    );
    assert(!methods.includes("DELETE"), `DELETE found on ${p}`);
  }
  console.log(`  ok (${paths.length} paths, no DELETE)`);

  console.log("Context…");
  const ctx = await req("/api/v1/context");
  assert(ctx.status === 200, `context ${ctx.status}`);
  console.log("  ok");

  console.log("Companies list…");
  const companies = await req("/api/v1/companies?limit=5");
  assert(companies.status === 200, `companies ${companies.status}`);
  console.log("  ok");

  console.log("Search…");
  const search = await req("/api/v1/search?q=a");
  assert(search.status === 200, `search ${search.status}`);
  console.log("  ok");

  console.log("Pipeline…");
  const pipeline = await req("/api/v1/pipeline");
  assert(pipeline.status === 200, `pipeline ${pipeline.status}`);
  console.log("  ok");

  console.log("Unauthorized without key…");
  const bare = await fetch(`${base}/api/v1/context`);
  assert(bare.status === 401, `expected 401 got ${bare.status}`);
  console.log("  ok");

  console.log("\nSmoke passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
