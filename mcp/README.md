# MCP servers (TCI CRM)

## ChatGPT Plugin / Connector (remoto)

Servidor HTTP en producción:

```
https://tci-crm.vercel.app/api/mcp
```

Guía paso a paso: [docs/chatgpt-plugin-mcp.md](../docs/chatgpt-plugin-mcp.md).

Implementación:

- `app/api/mcp/route.ts` — Streamable HTTP via `mcp-handler`
- `lib/mcp/tools.ts` — tools → mismos handlers que `/api/v1`

## Tool map

| MCP tool | HTTP |
|----------|------|
| `get_context` | `GET /api/v1/context` |
| `search` | `GET /api/v1/search?q=` |
| `list_companies` / `get_company` / `create_company` / `update_company` | `/api/v1/companies` |
| `list_contacts` / `get_contact` / `create_contact` / `update_contact` | `/api/v1/contacts` |
| `list_deals` / `get_deal` / `create_deal` / `update_deal` | `/api/v1/deals` |
| `list_activities` / `create_activity` | `/api/v1/activities` |
| `list_followups` / `create_followup` / `update_followup` | `/api/v1/followups` |
| `get_pipeline` | `GET /api/v1/pipeline` |

## Auth

Bearer workspace API key (`tci_…`). Optional env `MCP_CRM_API_KEY` as fallback.

## Gmail (futuro)

No incluido. Será otro MCP (OAuth Google), estilo Mercura Link, no Actions de ChatGPT.
