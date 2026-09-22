import { API_SCOPES } from "@/lib/api/scopes";

const servers = [
  {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://YOUR_DOMAIN",
    description: "Production",
  },
];

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "TCI CRM API",
      version: "1.0.0",
      description:
        "Neutral multi-workspace CRM API for ChatGPT, Claude, n8n, Zapier, and scripts. Authenticate with a workspace API key. No delete endpoints.",
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Workspace API key (tci_...)",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            code: { type: "string" },
            details: {},
          },
        },
        Company: { type: "object", additionalProperties: true },
        Contact: { type: "object", additionalProperties: true },
        Deal: { type: "object", additionalProperties: true },
        Activity: { type: "object", additionalProperties: true },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/v1/companies": {
        get: {
          operationId: "listCompanies",
          summary: "List companies",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "priority", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createCompany",
          summary: "Create company (dedupe unless force=true)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "409": { description: "Possible duplicates" },
          },
        },
      },
      "/api/v1/companies/search": {
        get: {
          operationId: "searchCompanies",
          summary: "Search companies",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/companies/{id}": {
        get: {
          operationId: "getCompany",
          summary: "Get company",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateCompany",
          summary: "Update company",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" },
              },
            },
          },
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/contacts": {
        get: {
          operationId: "listContacts",
          summary: "List contacts",
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createContact",
          summary: "Create contact",
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/contacts/{id}": {
        get: {
          operationId: "getContact",
          summary: "Get contact",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateContact",
          summary: "Update contact",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/deals": {
        get: {
          operationId: "listDeals",
          summary: "List deals",
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createDeal",
          summary: "Create deal",
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/deals/{id}": {
        get: {
          operationId: "getDeal",
          summary: "Get deal",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateDeal",
          summary: "Update deal",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/activities": {
        get: {
          operationId: "listActivities",
          summary: "List activities",
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createActivity",
          summary: "Create activity (supports Gmail email payloads)",
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/followups": {
        get: {
          operationId: "listFollowups",
          summary: "List follow-ups across companies, contacts, deals",
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createFollowup",
          summary: "Set next_followup on an entity",
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/followups/{entity_type}/{entity_id}": {
        patch: {
          operationId: "updateFollowup",
          summary: "Update follow-up dates/actions",
          parameters: [
            {
              name: "entity_type",
              in: "path",
              required: true,
              schema: { type: "string", enum: ["company", "contact", "deal"] },
            },
            {
              name: "entity_id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/pipeline": {
        get: {
          operationId: "getPipeline",
          summary: "Pipeline stages with deal counts",
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/search": {
        get: {
          operationId: "globalSearch",
          summary: "Search companies and contacts",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/context": {
        get: {
          operationId: "getContext",
          summary: "Workspace context for assistants (rules, fields, stages)",
          responses: { "200": { description: "OK" } },
        },
      },
    },
    "x-scopes": API_SCOPES,
  };

  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
