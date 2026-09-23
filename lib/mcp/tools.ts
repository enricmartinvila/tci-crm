import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  createActivity,
  createCompany,
  createContact,
  createDeal,
  createFollowup,
  getCompany,
  getContact,
  getContext,
  getDeal,
  getPipeline,
  globalSearch,
  listActivities,
  listCompanies,
  listContacts,
  listDeals,
  listFollowups,
  patchCompany,
  patchContact,
  patchDeal,
  patchFollowup,
  searchCompanies,
} from "@/lib/api/handlers";
import { getMcpAuth, textResult, toolError } from "@/lib/mcp/context";

export function registerCrmTools(server: McpServer) {
  server.registerTool(
    "get_context",
    {
      title: "get_context",
      description:
        "Load workspace rules, pipeline stages, field defs, and metrics. Call this first.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return textResult(await getContext(getMcpAuth()));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "search",
    {
      title: "search",
      description:
        "Search companies and contacts by name, domain, website, or email.",
      inputSchema: z.object({ q: z.string().min(1) }),
    },
    async ({ q }) => {
      try {
        return textResult(await globalSearch(getMcpAuth(), q));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "list_companies",
    {
      title: "list_companies",
      description: "List companies in the workspace.",
      inputSchema: z.object({
        q: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      }),
    },
    async (filters) => {
      try {
        return textResult(await listCompanies(getMcpAuth(), filters));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "search_companies",
    {
      title: "search_companies",
      description: "Search companies by name/domain/website.",
      inputSchema: z.object({ q: z.string().min(1) }),
    },
    async ({ q }) => {
      try {
        return textResult(await searchCompanies(getMcpAuth(), q));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "get_company",
    {
      title: "get_company",
      description: "Get a company by UUID.",
      inputSchema: z.object({ id: z.string().uuid() }),
    },
    async ({ id }) => {
      try {
        return textResult(await getCompany(getMcpAuth(), id));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "create_company",
    {
      title: "create_company",
      description:
        "Create a company. On duplicates, error includes matches unless force=true.",
      inputSchema: z.object({
        name: z.string().min(1),
        website: z.string().nullable().optional(),
        domain: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        priority: z.enum(["A+", "A", "B", "C"]).nullable().optional(),
        status: z.string().nullable().optional(),
        next_action: z.string().nullable().optional(),
        next_followup: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        force: z.boolean().optional(),
      }),
    },
    async (body) => {
      try {
        return textResult(await createCompany(getMcpAuth(), body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "update_company",
    {
      title: "update_company",
      description: "Patch a company by UUID.",
      inputSchema: z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        website: z.string().nullable().optional(),
        domain: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        priority: z.enum(["A+", "A", "B", "C"]).nullable().optional(),
        status: z.string().nullable().optional(),
        next_action: z.string().nullable().optional(),
        next_followup: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
    },
    async ({ id, ...body }) => {
      try {
        return textResult(await patchCompany(getMcpAuth(), id, body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "list_contacts",
    {
      title: "list_contacts",
      description: "List contacts.",
      inputSchema: z.object({
        company_id: z.string().uuid().optional(),
        q: z.string().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      }),
    },
    async (filters) => {
      try {
        return textResult(await listContacts(getMcpAuth(), filters));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "get_contact",
    {
      title: "get_contact",
      description: "Get a contact by UUID.",
      inputSchema: z.object({ id: z.string().uuid() }),
    },
    async ({ id }) => {
      try {
        return textResult(await getContact(getMcpAuth(), id));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "create_contact",
    {
      title: "create_contact",
      description: "Create a contact on a company.",
      inputSchema: z.object({
        company_id: z.string().uuid(),
        name: z.string().min(1),
        email: z.string().nullable().optional(),
        job_title: z.string().nullable().optional(),
        linkedin_url: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        force: z.boolean().optional(),
      }),
    },
    async (body) => {
      try {
        return textResult(await createContact(getMcpAuth(), body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "update_contact",
    {
      title: "update_contact",
      description: "Patch a contact by UUID.",
      inputSchema: z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        email: z.string().nullable().optional(),
        job_title: z.string().nullable().optional(),
        linkedin_url: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        next_followup: z.string().nullable().optional(),
      }),
    },
    async ({ id, ...body }) => {
      try {
        return textResult(await patchContact(getMcpAuth(), id, body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "list_deals",
    {
      title: "list_deals",
      description: "List deals.",
      inputSchema: z.object({
        company_id: z.string().uuid().optional(),
        stage: z.string().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      }),
    },
    async (filters) => {
      try {
        return textResult(await listDeals(getMcpAuth(), filters));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "get_deal",
    {
      title: "get_deal",
      description: "Get a deal by UUID.",
      inputSchema: z.object({ id: z.string().uuid() }),
    },
    async ({ id }) => {
      try {
        return textResult(await getDeal(getMcpAuth(), id));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "create_deal",
    {
      title: "create_deal",
      description: "Create a deal.",
      inputSchema: z.object({
        company_id: z.string().uuid(),
        name: z.string().min(1),
        stage: z.string().optional(),
        priority: z.enum(["A+", "A", "B", "C"]).nullable().optional(),
        value: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
    },
    async (body) => {
      try {
        return textResult(await createDeal(getMcpAuth(), body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "update_deal",
    {
      title: "update_deal",
      description: "Patch a deal by UUID.",
      inputSchema: z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        stage: z.string().optional(),
        priority: z.enum(["A+", "A", "B", "C"]).nullable().optional(),
        value: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
        next_followup: z.string().nullable().optional(),
      }),
    },
    async ({ id, ...body }) => {
      try {
        return textResult(await patchDeal(getMcpAuth(), id, body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "list_activities",
    {
      title: "list_activities",
      description: "List activities for a company or workspace.",
      inputSchema: z.object({
        company_id: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      }),
    },
    async (filters) => {
      try {
        return textResult(await listActivities(getMcpAuth(), filters));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "create_activity",
    {
      title: "create_activity",
      description: "Log an activity (note, call, email, email_sent, …).",
      inputSchema: z.object({
        company_id: z.string().uuid(),
        contact_id: z.string().uuid().nullable().optional(),
        deal_id: z.string().uuid().nullable().optional(),
        type: z.string().min(1),
        comment: z.string().nullable().optional(),
        subject: z.string().nullable().optional(),
        summary: z.string().nullable().optional(),
        direction: z.enum(["inbound", "outbound"]).nullable().optional(),
        happened_at: z.string().nullable().optional(),
        next_followup: z.string().nullable().optional(),
      }),
    },
    async (body) => {
      try {
        return textResult(await createActivity(getMcpAuth(), body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "list_followups",
    {
      title: "list_followups",
      description: "List open follow-ups across companies, contacts, and deals.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return textResult(await listFollowups(getMcpAuth()));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "create_followup",
    {
      title: "create_followup",
      description: "Set next_followup on a company, contact, or deal.",
      inputSchema: z.object({
        entity_type: z.enum(["company", "contact", "deal"]),
        entity_id: z.string().uuid(),
        next_followup: z.string().min(1),
        next_action: z.string().nullable().optional(),
      }),
    },
    async (body) => {
      try {
        return textResult(await createFollowup(getMcpAuth(), body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "update_followup",
    {
      title: "update_followup",
      description:
        "Update follow-up. id format: company:uuid | contact:uuid | deal:uuid",
      inputSchema: z.object({
        id: z.string().min(1),
        next_followup: z.string().nullable().optional(),
        next_action: z.string().nullable().optional(),
        last_contact: z.string().nullable().optional(),
      }),
    },
    async ({ id, ...body }) => {
      try {
        return textResult(await patchFollowup(getMcpAuth(), id, body));
      } catch (err) {
        return toolError(err);
      }
    }
  );

  server.registerTool(
    "get_pipeline",
    {
      title: "get_pipeline",
      description: "Pipeline stages with deal counts.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return textResult(await getPipeline(getMcpAuth()));
      } catch (err) {
        return toolError(err);
      }
    }
  );
}
