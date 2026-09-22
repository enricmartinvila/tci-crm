# CRM External API (`/api/v1`)

Neutral multi-workspace CRM API for ChatGPT Custom GPTs, Claude, n8n, Zapier, and scripts.

There is **no AI chat inside the CRM**. External tools call this API with a workspace API key.

## Auth

```http
Authorization: Bearer tci_...
Content-Type: application/json
```

Keys are created in **Settings → Workspaces**. The raw secret is shown **once**. Only a SHA-256 hash is stored.

### Scopes

| Scope | Access |
|-------|--------|
| `companies:read` / `companies:write` | Companies list/search/create/patch |
| `contacts:read` / `contacts:write` | Contacts |
| `deals:read` / `deals:write` | Deals |
| `activities:read` / `activities:write` | Activities (incl. email payload) |
| `followups:read` / `followups:write` | Follow-ups facade |

New keys receive all scopes by default.

### Rate limit

In-memory **120 requests / minute / API key** (MVP on Vercel). Returns `429` with `{ error, code: "rate_limited" }`. Prefer Redis/Upstash for multi-instance production.

## Base URL

`{NEXT_PUBLIC_APP_URL}/api/v1`

OpenAPI: `GET /api/openapi.json` (see [openapi.md](./openapi.md)).

## Endpoints (no DELETE)

| Area | Methods |
|------|---------|
| Companies | `GET /companies`, `GET /companies/search`, `GET /companies/:id`, `POST /companies`, `PATCH /companies/:id` |
| Contacts | `GET /contacts`, `GET /contacts/:id`, `POST /contacts`, `PATCH /contacts/:id` |
| Deals | `GET /deals`, `GET /deals/:id`, `POST /deals`, `PATCH /deals/:id` |
| Activities | `GET /activities`, `POST /activities` |
| Followups | `GET /followups`, `POST /followups`, `PATCH /followups/:id` |
| Pipeline | `GET /pipeline` |
| Search | `GET /search?q=` |
| Context | `GET /context` (workspace, stages, field defs, rules, metrics) |

### Company create + dedupe

`POST /companies` checks name/domain. On matches returns **409** with `{ matches: [...] }` and does **not** create. Pass `"force": true` to create anyway.

### Followups

Facade over `next_followup` / `next_action` on company, contact, or deal. IDs look like `company:uuid`.

### Errors

```json
{ "error": "Human message", "code": "unauthorized|forbidden|validation_error|not_found|conflict|rate_limited|internal_error", "details": {} }
```

## Env (server only)

- `SUPABASE_SERVICE_ROLE_KEY` — never expose to the browser
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Security notes

- API keys map to a single `workspace_id`; the service-role client always filters by that workspace.
- UI uses SSR cookies + RLS membership; API never uses the user’s session cookie.
- Revoke keys in Settings when a Custom GPT or integration is retired.
