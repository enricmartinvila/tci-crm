# ChatGPT Plugin via MCP (reemplazo de Custom Actions)

Las **Custom Actions** del GPT antiguo **no migran** al Plugin. El sustituto es un **MCP server** remoto sobre la misma API del CRM.

## Endpoint

```
https://tci-crm.vercel.app/api/mcp
```

Auth: `Authorization: Bearer tci_…` (misma API key de Settings → Workspaces).

Opcional en Vercel: `MCP_CRM_API_KEY=tci_…` para que el servidor use esa key si ChatGPT conecta sin header (menos seguro; preferible Bearer).

## Conectar en ChatGPT (Developer mode)

1. Settings → **Security and login** (o Apps → Advanced) → activa **Developer mode**.
2. Ve a **Plugins** / **Connectors** → **+** / Create.
3. Nombre: `TCI CRM`
4. Connection URL: `https://tci-crm.vercel.app/api/mcp`
5. Auth:
   - Si pide **API Key / Bearer**: pega tu `tci_…`
   - Si solo ofrece OAuth y falla: pon `MCP_CRM_API_KEY` en Vercel, redeploy, y prueba “No authentication” / connector sin OAuth.
6. Revisa que aparezcan tools (`get_context`, `search`, `list_companies`, …).
7. **Nuevo chat** → activa el connector / plugin TCI CRM en el menú de tools.
8. Prueba: “What are the workspace rules?” / “Search Soft2Bet”.

Si las tools no se actualizan tras un deploy: abre el connector → **Refresh**.

## Relación con el Plugin migrado

El plugin que salió de “Migrate GPT” tiene las **instructions** (Skill) pero **sin** tools.  
Opciones:

- Usar el **connector MCP** en chats normales (recomendado), y opcionalmente pegar las mismas instructions en un Skill del plugin; **o**
- Seguir usando el Custom GPT antiguo **si** aún tiene Actions (hasta dic 2026).

No busques un botón “Add Action” en el editor del Plugin: ya no existe.

## Cursor (local)

En Cursor MCP settings:

```json
{
  "tci-crm": {
    "url": "https://tci-crm.vercel.app/api/mcp",
    "headers": {
      "Authorization": "Bearer tci_TU_KEY"
    }
  }
}
```

## Tools (= antiguas Actions)

| MCP tool | Antes (OpenAPI) |
|----------|-----------------|
| `get_context` | GET /api/v1/context |
| `search` | GET /api/v1/search |
| `list_companies` / `get_company` / `create_company` / `update_company` | /companies |
| `list_contacts` / … | /contacts |
| `list_deals` / … | /deals |
| `list_activities` / `create_activity` | /activities |
| `list_followups` / `create_followup` / `update_followup` | /followups |
| `get_pipeline` | GET /pipeline |

El backend `/api/v1` no cambia.
