# Connect ChatGPT (Custom GPT Actions)

The CRM does **not** embed ChatGPT. You connect a Custom GPT (or any HTTP client) to `/api/v1` with a workspace API key.

## 1. Create an API key

1. Open the CRM → **Settings → Workspaces**.
2. Select the target workspace (e.g. TCI).
3. **Generar key** (name it `ChatGPT`).
4. Copy the `tci_…` secret immediately — it is shown once.

## 2. Create a Custom GPT

1. ChatGPT → Create a GPT → **Configure** → **Actions**.
2. Import from URL: `{APP_URL}/api/openapi.json`
3. Authentication: **API Key** → Auth Type **Bearer** → paste the key.
4. Save.

## 3. Suggested instructions (paste into GPT)

```
You are an assistant for The Cartel Insider sponsorship CRM.

Always call GET /api/v1/context first to load workspace rules, pipeline stages, and field definitions.

Follow workspace rules strictly (e.g. sign as team, never invent contacts, never expose creator PII).

Prefer search/list before create. If POST /companies returns 409 with matches, show matches and ask before using force=true.

Never attempt DELETE — the API has no delete endpoints.
When logging outreach, use POST /activities (type email or email_sent) with subject/summary when available.
```

## 4. Smoke prompts

- “List high-priority companies without a recent follow-up.”
- “Search for company Soft2Bet and summarize open deals.”
- “Log that I emailed contact X yesterday about Q2 package.”
- “What are the workspace rules?”

## 5. Rotate / revoke

Settings → Workspaces → **Revocar** on the key. Create a new key and update the Custom GPT auth. Old keys stop working immediately.

## Alternatives

Same Bearer key works with Claude tools, n8n HTTP nodes, Zapier, or `curl` — see [api.md](./api.md).
