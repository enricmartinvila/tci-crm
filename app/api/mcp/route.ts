import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { authenticateApiKey } from "@/lib/api/auth";
import { registerCrmTools } from "@/lib/mcp/tools";
import { runWithMcpAuth } from "@/lib/mcp/context";

export const maxDuration = 60;

const mcpHandler = createMcpHandler(
  (server) => {
    registerCrmTools(server);
  },
  {
    serverInfo: {
      name: "tci-crm",
      version: "1.0.0",
    },
    instructions: `TCI Sponsor CRM tools. Always call get_context first.
Follow workspace rules. Prefer search/list before create.
If create_company reports duplicates, show matches and ask before force=true.
Never invent contacts. Log outreach with create_activity (type email or email_sent).`,
  }
);

async function resolveAuth(
  _req: Request,
  bearerToken?: string
): Promise<
  | {
      token: string;
      clientId: string;
      scopes: string[];
    }
  | undefined
> {
  const raw =
    bearerToken?.trim() ||
    process.env.MCP_CRM_API_KEY?.trim() ||
    "";
  if (!raw) return undefined;
  try {
    const ctx = await authenticateApiKey(raw);
    return {
      token: raw,
      clientId: ctx.apiKeyId,
      scopes: ctx.scopes,
    };
  } catch {
    return undefined;
  }
}

const authed = withMcpAuth(mcpHandler, resolveAuth, {
  required: true,
  requiredScopes: [],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

async function handle(request: Request) {
  // Allow CORS preflight for ChatGPT / browsers
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const raw =
    match?.[1]?.trim() || process.env.MCP_CRM_API_KEY?.trim() || "";

  if (raw) {
    try {
      const ctx = await authenticateApiKey(raw);
      return runWithMcpAuth(ctx, () => authed(request));
    } catch {
      // fall through to withMcpAuth 401
    }
  }

  return authed(request);
}

export { handle as GET, handle as POST, handle as DELETE };
