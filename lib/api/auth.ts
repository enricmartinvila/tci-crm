import { createHash, randomBytes } from "crypto";
import { createServiceClient } from "@/lib/api/supabase";
import { ApiError } from "@/lib/api/errors";
import type { ApiScope } from "@/lib/api/scopes";
import { ALL_SCOPES } from "@/lib/api/scopes";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

export type ApiAuthContext = {
  workspaceId: string;
  apiKeyId: string;
  scopes: ApiScope[];
  keyName: string;
};

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey() {
  const raw = `tci_${randomBytes(24).toString("base64url")}`;
  return {
    raw,
    hash: hashApiKey(raw),
    prefix: raw.slice(0, 12),
  };
}

function checkRateLimit(apiKeyId: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(apiKeyId);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(apiKeyId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    throw new ApiError(
      429,
      "rate_limited",
      `Rate limit exceeded (${RATE_LIMIT_MAX}/min)`
    );
  }
}

export async function authenticateApiKey(
  raw: string,
  requiredScopes: ApiScope[] = []
): Promise<ApiAuthContext> {
  const keyRaw = raw.trim();
  if (!keyRaw) {
    throw new ApiError(401, "unauthorized", "Missing Bearer API key");
  }

  const supabase = createServiceClient();
  const keyHash = hashApiKey(keyRaw);
  const { data: key, error } = await supabase
    .from("api_keys")
    .select("id, workspace_id, name, scopes, active")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) throw new ApiError(500, "internal_error", error.message);
  if (!key || !key.active) {
    throw new ApiError(401, "unauthorized", "Invalid or inactive API key");
  }

  checkRateLimit(key.id);

  const scopes = (key.scopes || []) as ApiScope[];
  for (const needed of requiredScopes) {
    if (!scopes.includes(needed)) {
      throw new ApiError(
        403,
        "forbidden",
        `Missing required scope: ${needed}`
      );
    }
  }

  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  return {
    workspaceId: key.workspace_id,
    apiKeyId: key.id,
    scopes: scopes.length ? scopes : ALL_SCOPES,
    keyName: key.name,
  };
}

export async function authenticateRequest(
  request: Request,
  requiredScopes: ApiScope[] = []
): Promise<ApiAuthContext> {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new ApiError(401, "unauthorized", "Missing Bearer API key");
  }
  return authenticateApiKey(match[1], requiredScopes);
}
