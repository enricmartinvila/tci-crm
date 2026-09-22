# OpenAPI

The live OpenAPI 3.1 document is served at:

```
GET /api/openapi.json
```

Use it to import Actions into a ChatGPT Custom GPT, or to generate clients.

## Notes

- Spec is maintained in [`app/api/openapi.json/route.ts`](../app/api/openapi.json/route.ts) and kept aligned with Zod schemas under [`lib/api/schemas`](../lib/api/schemas).
- Security scheme: HTTP Bearer (`tci_…` workspace API key).
- No `DELETE` operations are defined.
- Server URL comes from `NEXT_PUBLIC_APP_URL`.

## Quick check

```bash
curl -s "$NEXT_PUBLIC_APP_URL/api/openapi.json" | head
```
