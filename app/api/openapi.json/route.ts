import { API_SCOPES } from "@/lib/api/scopes";

const nullableString = { type: "string", nullable: true };
const nullableNumber = { type: "number", nullable: true };
const nullableInteger = { type: "integer", nullable: true };

const CompanyCreate = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", description: "Company name" },
    website: nullableString,
    domain: nullableString,
    category: nullableString,
    priority: {
      type: "string",
      enum: ["A+", "A", "B", "C"],
      nullable: true,
    },
    status: nullableString,
    next_action: nullableString,
    next_followup: { type: "string", nullable: true, description: "ISO date" },
    last_contact: { type: "string", nullable: true, description: "ISO date" },
    notes: nullableString,
    youtube_fit: { type: "integer", minimum: 1, maximum: 5, nullable: true },
    instagram_fit: { type: "integer", minimum: 1, maximum: 5, nullable: true },
    score: nullableNumber,
    custom_data: { type: "object", additionalProperties: true },
    force: {
      type: "boolean",
      description: "Create even if possible duplicates exist",
    },
  },
};

const CompanyPatch = {
  type: "object",
  properties: {
    name: { type: "string" },
    website: nullableString,
    domain: nullableString,
    category: nullableString,
    priority: {
      type: "string",
      enum: ["A+", "A", "B", "C"],
      nullable: true,
    },
    status: nullableString,
    next_action: nullableString,
    next_followup: nullableString,
    last_contact: nullableString,
    notes: nullableString,
    youtube_fit: nullableInteger,
    instagram_fit: nullableInteger,
    score: nullableNumber,
    custom_data: { type: "object", additionalProperties: true },
  },
};

const ContactCreate = {
  type: "object",
  required: ["company_id", "name"],
  properties: {
    company_id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: nullableString,
    job_title: nullableString,
    contact_type: nullableString,
    linkedin_url: nullableString,
    outreach_status: nullableString,
    next_followup: nullableString,
    notes: nullableString,
    custom_data: { type: "object", additionalProperties: true },
    force: { type: "boolean" },
  },
};

const ContactPatch = {
  type: "object",
  properties: {
    company_id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: nullableString,
    job_title: nullableString,
    contact_type: nullableString,
    linkedin_url: nullableString,
    outreach_status: nullableString,
    next_followup: nullableString,
    notes: nullableString,
    custom_data: { type: "object", additionalProperties: true },
  },
};

const DealCreate = {
  type: "object",
  required: ["company_id", "name"],
  properties: {
    company_id: { type: "string", format: "uuid" },
    name: { type: "string" },
    stage: { type: "string" },
    priority: {
      type: "string",
      enum: ["A+", "A", "B", "C"],
      nullable: true,
    },
    value: nullableNumber,
    currency: { type: "string" },
    next_action: nullableString,
    next_followup: nullableString,
    notes: nullableString,
    custom_data: { type: "object", additionalProperties: true },
  },
};

const DealPatch = {
  type: "object",
  properties: {
    company_id: { type: "string", format: "uuid" },
    name: { type: "string" },
    stage: { type: "string" },
    priority: {
      type: "string",
      enum: ["A+", "A", "B", "C"],
      nullable: true,
    },
    value: nullableNumber,
    currency: { type: "string" },
    next_action: nullableString,
    next_followup: nullableString,
    notes: nullableString,
    custom_data: { type: "object", additionalProperties: true },
  },
};

const ActivityCreate = {
  type: "object",
  required: ["company_id", "type"],
  properties: {
    company_id: { type: "string", format: "uuid" },
    contact_id: { type: "string", format: "uuid", nullable: true },
    deal_id: { type: "string", format: "uuid", nullable: true },
    type: {
      type: "string",
      description: "note | meeting | call | email | email_sent | …",
    },
    comment: nullableString,
    subject: nullableString,
    summary: nullableString,
    direction: {
      type: "string",
      enum: ["inbound", "outbound"],
      nullable: true,
    },
    external_thread_id: nullableString,
    external_message_id: nullableString,
    happened_at: nullableString,
    occurred_at: nullableString,
    next_followup: nullableString,
  },
};

const FollowupCreate = {
  type: "object",
  required: ["entity_type", "entity_id", "next_followup"],
  properties: {
    entity_type: { type: "string", enum: ["company", "contact", "deal"] },
    entity_id: { type: "string", format: "uuid" },
    next_followup: { type: "string", description: "ISO date" },
    next_action: nullableString,
  },
};

const FollowupPatch = {
  type: "object",
  properties: {
    next_followup: nullableString,
    next_action: nullableString,
    last_contact: nullableString,
  },
};

function jsonBody(schema: object) {
  return {
    required: true,
    content: {
      "application/json": { schema },
    },
  };
}

function pathId() {
  return {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
  };
}

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://tci-crm.vercel.app";

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "TCI CRM API",
      version: "1.0.0",
      description:
        "Multi-workspace CRM API for ChatGPT Custom GPTs. Use Bearer workspace API key (tci_...). No delete endpoints.",
    },
    servers: [{ url: base.replace(/\/$/, "") }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Workspace API key starting with tci_",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            code: { type: "string" },
            details: { type: "object", additionalProperties: true },
          },
        },
        CompanyCreate,
        CompanyPatch,
        ContactCreate,
        ContactPatch,
        DealCreate,
        DealPatch,
        ActivityCreate,
        FollowupCreate,
        FollowupPatch,
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
          summary: "Create company (409 if duplicates unless force=true)",
          requestBody: jsonBody({
            $ref: "#/components/schemas/CompanyCreate",
          }),
          responses: {
            "201": { description: "Created" },
            "409": { description: "Possible duplicates" },
          },
        },
      },
      "/api/v1/companies/search": {
        get: {
          operationId: "searchCompanies",
          summary: "Search companies by name/domain/website",
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
          summary: "Get company by id",
          parameters: [pathId()],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateCompany",
          summary: "Update company",
          parameters: [pathId()],
          requestBody: jsonBody({
            $ref: "#/components/schemas/CompanyPatch",
          }),
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/contacts": {
        get: {
          operationId: "listContacts",
          summary: "List contacts",
          parameters: [
            { name: "company_id", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createContact",
          summary: "Create contact",
          requestBody: jsonBody({
            $ref: "#/components/schemas/ContactCreate",
          }),
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/contacts/{id}": {
        get: {
          operationId: "getContact",
          summary: "Get contact",
          parameters: [pathId()],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateContact",
          summary: "Update contact",
          parameters: [pathId()],
          requestBody: jsonBody({
            $ref: "#/components/schemas/ContactPatch",
          }),
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/deals": {
        get: {
          operationId: "listDeals",
          summary: "List deals",
          parameters: [
            { name: "company_id", in: "query", schema: { type: "string" } },
            { name: "stage", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createDeal",
          summary: "Create deal",
          requestBody: jsonBody({
            $ref: "#/components/schemas/DealCreate",
          }),
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/deals/{id}": {
        get: {
          operationId: "getDeal",
          summary: "Get deal",
          parameters: [pathId()],
          responses: { "200": { description: "OK" } },
        },
        patch: {
          operationId: "updateDeal",
          summary: "Update deal",
          parameters: [pathId()],
          requestBody: jsonBody({
            $ref: "#/components/schemas/DealPatch",
          }),
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/activities": {
        get: {
          operationId: "listActivities",
          summary: "List activities",
          parameters: [
            { name: "company_id", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          operationId: "createActivity",
          summary: "Create activity (supports email payloads)",
          requestBody: jsonBody({
            $ref: "#/components/schemas/ActivityCreate",
          }),
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
          requestBody: jsonBody({
            $ref: "#/components/schemas/FollowupCreate",
          }),
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
              schema: {
                type: "string",
                enum: ["company", "contact", "deal"],
              },
            },
            {
              name: "entity_id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: jsonBody({
            $ref: "#/components/schemas/FollowupPatch",
          }),
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
          summary: "Workspace context (rules, fields, stages)",
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
