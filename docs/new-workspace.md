# New workspace checklist (< 10 minutes)

1. **Run migration** `supabase/migrations/005_workspaces_api.sql` in the Supabase SQL editor (once per project). This creates tables, RLS, and seeds workspace `tci`.
2. **Env**: set `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_APP_URL` on Vercel (and locally in `.env.local`).
3. **Open CRM** → sign in → **Settings → Workspaces**.
4. **Create workspace** (or use `tci`):
   - Name + slug
   - Template: Sponsorship / Sales / Generic / Personal
5. Click **Usar** so the cookie `tci_active_workspace` points at it.
6. **Generar API key** → copy `tci_…` once.
7. Optional: add **rules** (appear in `GET /api/v1/context`).
8. Point ChatGPT / Claude / n8n at `{APP_URL}/api/openapi.json` with Bearer auth — see [chatgpt-connection.md](./chatgpt-connection.md).
9. Smoke: `npx tsx scripts/api-smoke.ts` with `API_BASE` + `API_KEY` set.

### Membership

The creator becomes `owner` in `workspace_members`. Other users need a membership row to see the workspace in the UI (RLS).

### Templates seed

| Template | Pipeline | Typical use |
|----------|----------|-------------|
| sponsorship | TCI deal stages | Sponsor CRM (default TCI) |
| sales | Lead → Won/Lost | General B2B sales |
| generic | New → Done | Minimal |
| personal | Todo / Doing / Done | Personal tracking |
