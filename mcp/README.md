# MCP stub (future)

This folder documents how a future MCP server would map tools to the existing HTTP API. **There is no MCP server implemented yet.**

Base: Bearer API key → same scopes as `/api/v1` (see [docs/api.md](../docs/api.md)).

## Tool map

| MCP tool (proposed) | HTTP |
|---------------------|------|
| `get_context` | `GET /api/v1/context` |
| `search` | `GET /api/v1/search?q=` |
| `list_companies` / `get_company` / `create_company` / `update_company` | `/api/v1/companies` |
| `list_contacts` / `get_contact` / `create_contact` / `update_contact` | `/api/v1/contacts` |
| `list_deals` / `get_deal` / `create_deal` / `update_deal` | `/api/v1/deals` |
| `list_activities` / `create_activity` | `/api/v1/activities` |
| `list_followups` / `create_followup` / `update_followup` | `/api/v1/followups` |
| `get_pipeline` | `GET /api/v1/pipeline` |

## Non-goals for MCP v1

- No delete tools (API has no DELETE).
- No Gmail OAuth inside MCP — email payloads are written via `create_activity`.
- One API key = one workspace (same isolation as HTTP).

## Implementation sketch

1. Thin MCP server (stdio or HTTP) that holds `CRM_API_BASE` + `CRM_API_KEY`.
2. Each tool validates args with Zod, then `fetch` the matching route.
3. Surface `409` company matches to the model as structured content (do not auto-force).

Until then, use Custom GPT Actions or direct HTTP against OpenAPI.
