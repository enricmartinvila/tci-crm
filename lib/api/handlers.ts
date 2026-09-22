import { createServiceClient } from "@/lib/api/supabase";
import { ApiError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/api/audit";
import { extractDomain } from "@/lib/api/domain";
import type { ApiAuthContext } from "@/lib/api/auth";
import {
  activityCreateSchema,
  companyCreateSchema,
  companyPatchSchema,
  contactCreateSchema,
  contactPatchSchema,
  dealCreateSchema,
  dealPatchSchema,
  followupCreateSchema,
  followupPatchSchema,
} from "@/lib/api/schemas";

function parseBody<T>(schema: { parse: (v: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (e) {
    throw new ApiError(400, "validation_error", "Invalid request body", e);
  }
}

export async function listCompanies(
  ctx: ApiAuthContext,
  params: { q?: string; status?: string; priority?: string; limit?: number }
) {
  const supabase = createServiceClient();
  let query = supabase
    .from("companies")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .order("updated_at", { ascending: false })
    .limit(params.limit ?? 50);

  if (params.status) query = query.eq("status", params.status);
  if (params.priority) query = query.eq("priority", params.priority);
  if (params.q) {
    const q = `%${params.q}%`;
    query = query.or(
      `name.ilike.${q},website.ilike.${q},domain.ilike.${q},notes.ilike.${q}`
    );
  }

  const { data, error } = await query;
  if (error) throw new ApiError(500, "internal_error", error.message);
  return { data: data || [] };
}

export async function getCompany(ctx: ApiAuthContext, id: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(500, "internal_error", error.message);
  if (!data) throw new ApiError(404, "not_found", "Company not found");
  return data;
}

export async function searchCompanies(ctx: ApiAuthContext, q: string) {
  return listCompanies(ctx, { q, limit: 25 });
}

export async function createCompany(ctx: ApiAuthContext, body: unknown) {
  const input = parseBody(companyCreateSchema, body);
  const supabase = createServiceClient();
  const domain =
    input.domain || extractDomain(input.website) || null;
  const name = input.name.trim();

  if (!input.force) {
    const matches: unknown[] = [];
    const { data: byName } = await supabase
      .from("companies")
      .select("id, name, website, domain, status, priority")
      .eq("workspace_id", ctx.workspaceId)
      .ilike("name", name);
    if (byName?.length) matches.push(...byName);

    if (domain) {
      const { data: byDomain } = await supabase
        .from("companies")
        .select("id, name, website, domain, status, priority")
        .eq("workspace_id", ctx.workspaceId)
        .eq("domain", domain);
      for (const row of byDomain || []) {
        if (!matches.some((m) => (m as { id: string }).id === row.id)) {
          matches.push(row);
        }
      }
    }

    if (input.website) {
      const { data: byWeb } = await supabase
        .from("companies")
        .select("id, name, website, domain, status, priority")
        .eq("workspace_id", ctx.workspaceId)
        .ilike("website", `%${input.website.replace(/^https?:\/\//i, "")}%`);
      for (const row of byWeb || []) {
        if (!matches.some((m) => (m as { id: string }).id === row.id)) {
          matches.push(row);
        }
      }
    }

    if (matches.length) {
      throw new ApiError(
        409,
        "conflict",
        "Possible duplicate companies found. Pass force=true to create anyway.",
        { matches }
      );
    }
  }

  const rest = { ...input };
  delete rest.force;
  const { data, error } = await supabase
    .from("companies")
    .insert({
      ...rest,
      name,
      domain,
      website: input.website ?? null,
      workspace_id: ctx.workspaceId,
      status: input.status || "Researching",
      custom_data: input.custom_data || {},
    })
    .select("*")
    .single();

  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "company.create",
    entityType: "company",
    entityId: data.id,
    newValue: data,
  });

  return data;
}

export async function patchCompany(
  ctx: ApiAuthContext,
  id: string,
  body: unknown
) {
  const input = parseBody(companyPatchSchema, body);
  const supabase = createServiceClient();
  const previous = await getCompany(ctx, id);

  const patch: Record<string, unknown> = { ...input };
  if (input.website !== undefined) {
    patch.domain = input.domain || extractDomain(input.website);
  }

  const { data, error } = await supabase
    .from("companies")
    .update(patch)
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "company.update",
    entityType: "company",
    entityId: id,
    previousValue: previous,
    newValue: data,
  });

  return data;
}

export async function listContacts(
  ctx: ApiAuthContext,
  params: { company_id?: string; q?: string; limit?: number }
) {
  const supabase = createServiceClient();
  let query = supabase
    .from("contacts")
    .select("*, companies(id, name)")
    .eq("workspace_id", ctx.workspaceId)
    .order("updated_at", { ascending: false })
    .limit(params.limit ?? 50);
  if (params.company_id) query = query.eq("company_id", params.company_id);
  if (params.q) {
    const q = `%${params.q}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q}`);
  }
  const { data, error } = await query;
  if (error) throw new ApiError(500, "internal_error", error.message);
  return { data: data || [] };
}

export async function getContact(ctx: ApiAuthContext, id: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, companies(id, name)")
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(500, "internal_error", error.message);
  if (!data) throw new ApiError(404, "not_found", "Contact not found");
  return data;
}

export async function createContact(ctx: ApiAuthContext, body: unknown) {
  const input = parseBody(contactCreateSchema, body);
  const supabase = createServiceClient();
  const email = input.email?.trim() || null;

  if (email && !input.force) {
    const { data: matches } = await supabase
      .from("contacts")
      .select("id, name, email, company_id")
      .eq("workspace_id", ctx.workspaceId)
      .ilike("email", email);
    if (matches?.length) {
      throw new ApiError(
        409,
        "conflict",
        "Contact with this email already exists. Pass force=true to create anyway.",
        { matches }
      );
    }
  }

  const rest = { ...input };
  delete rest.force;
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      ...rest,
      email,
      workspace_id: ctx.workspaceId,
      custom_data: input.custom_data || {},
    })
    .select("*")
    .single();
  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "contact.create",
    entityType: "contact",
    entityId: data.id,
    newValue: data,
  });
  return data;
}

export async function patchContact(
  ctx: ApiAuthContext,
  id: string,
  body: unknown
) {
  const input = parseBody(contactPatchSchema, body);
  const previous = await getContact(ctx, id);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(input)
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "contact.update",
    entityType: "contact",
    entityId: id,
    previousValue: previous,
    newValue: data,
  });
  return data;
}

export async function listDeals(
  ctx: ApiAuthContext,
  params: { stage?: string; company_id?: string; limit?: number }
) {
  const supabase = createServiceClient();
  let query = supabase
    .from("deals")
    .select("*, companies(id, name)")
    .eq("workspace_id", ctx.workspaceId)
    .order("updated_at", { ascending: false })
    .limit(params.limit ?? 50);
  if (params.stage) query = query.eq("stage", params.stage);
  if (params.company_id) query = query.eq("company_id", params.company_id);
  const { data, error } = await query;
  if (error) throw new ApiError(500, "internal_error", error.message);
  return { data: data || [] };
}

export async function getDeal(ctx: ApiAuthContext, id: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, companies(id, name)")
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(500, "internal_error", error.message);
  if (!data) throw new ApiError(404, "not_found", "Deal not found");
  return data;
}

export async function createDeal(ctx: ApiAuthContext, body: unknown) {
  const input = parseBody(dealCreateSchema, body);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("deals")
    .insert({
      ...input,
      stage: input.stage || "Researching",
      currency: input.currency || "EUR",
      workspace_id: ctx.workspaceId,
      custom_data: input.custom_data || {},
    })
    .select("*")
    .single();
  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "deal.create",
    entityType: "deal",
    entityId: data.id,
    newValue: data,
  });
  return data;
}

export async function patchDeal(
  ctx: ApiAuthContext,
  id: string,
  body: unknown
) {
  const input = parseBody(dealPatchSchema, body);
  const previous = await getDeal(ctx, id);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("deals")
    .update(input)
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new ApiError(500, "internal_error", error.message);

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "deal.update",
    entityType: "deal",
    entityId: id,
    previousValue: previous,
    newValue: data,
  });
  return data;
}

export async function listActivities(
  ctx: ApiAuthContext,
  params: { company_id?: string; limit?: number }
) {
  const supabase = createServiceClient();
  let query = supabase
    .from("activities")
    .select("*, contacts(id, name)")
    .eq("workspace_id", ctx.workspaceId)
    .order("happened_at", { ascending: false })
    .limit(params.limit ?? 50);
  if (params.company_id) query = query.eq("company_id", params.company_id);
  const { data, error } = await query;
  if (error) throw new ApiError(500, "internal_error", error.message);
  return { data: data || [] };
}

export async function createActivity(ctx: ApiAuthContext, body: unknown) {
  const input = parseBody(activityCreateSchema, body);
  const supabase = createServiceClient();
  const happened_at =
    input.occurred_at || input.happened_at || new Date().toISOString();
  const comment = input.comment || input.summary || null;

  const { data, error } = await supabase
    .from("activities")
    .insert({
      company_id: input.company_id,
      contact_id: input.contact_id || null,
      deal_id: input.deal_id || null,
      type: input.type,
      comment,
      subject: input.subject || null,
      summary: input.summary || null,
      direction: input.direction || null,
      external_thread_id: input.external_thread_id || null,
      external_message_id: input.external_message_id || null,
      happened_at,
      workspace_id: ctx.workspaceId,
    })
    .select("*")
    .single();
  if (error) throw new ApiError(500, "internal_error", error.message);

  if (input.next_followup) {
    await supabase
      .from("companies")
      .update({
        next_followup: input.next_followup,
        last_contact: happened_at.slice(0, 10),
      })
      .eq("workspace_id", ctx.workspaceId)
      .eq("id", input.company_id);
  }

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "activity.create",
    entityType: "activity",
    entityId: data.id,
    newValue: data,
  });
  return data;
}

export async function listFollowups(ctx: ApiAuthContext) {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const [companies, contacts, deals] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, next_followup, next_action, priority, status")
      .eq("workspace_id", ctx.workspaceId)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .eq("workspace_id", ctx.workspaceId)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
    supabase
      .from("deals")
      .select("id, name, next_followup, next_action, company_id, companies(id, name)")
      .eq("workspace_id", ctx.workspaceId)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
  ]);

  const rows = [
    ...(companies.data || []).map((c) => ({
      id: `company:${c.id}`,
      entity_type: "company" as const,
      entity_id: c.id,
      title: c.name,
      next_followup: c.next_followup,
      next_action: c.next_action,
      overdue: (c.next_followup as string) < today,
    })),
    ...(contacts.data || []).map((c) => ({
      id: `contact:${c.id}`,
      entity_type: "contact" as const,
      entity_id: c.id,
      title: c.name,
      next_followup: c.next_followup,
      overdue: (c.next_followup as string) < today,
    })),
    ...(deals.data || []).map((d) => ({
      id: `deal:${d.id}`,
      entity_type: "deal" as const,
      entity_id: d.id,
      title: d.name,
      next_followup: d.next_followup,
      next_action: d.next_action,
      overdue: (d.next_followup as string) < today,
    })),
  ].sort((a, b) =>
    String(a.next_followup).localeCompare(String(b.next_followup))
  );

  return { data: rows };
}

export async function createFollowup(ctx: ApiAuthContext, body: unknown) {
  const input = parseBody(followupCreateSchema, body);
  const supabase = createServiceClient();
  const table =
    input.entity_type === "company"
      ? "companies"
      : input.entity_type === "contact"
        ? "contacts"
        : "deals";

  const patch: Record<string, unknown> = {
    next_followup: input.next_followup,
  };
  if (input.next_action !== undefined && input.entity_type !== "contact") {
    patch.next_action = input.next_action;
  }

  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq("workspace_id", ctx.workspaceId)
    .eq("id", input.entity_id)
    .select("*")
    .maybeSingle();
  if (error) throw new ApiError(500, "internal_error", error.message);
  if (!data) throw new ApiError(404, "not_found", "Entity not found");

  await writeAuditLog({
    workspaceId: ctx.workspaceId,
    actorType: "api",
    actorId: ctx.apiKeyId,
    action: "followup.create",
    entityType: input.entity_type,
    entityId: input.entity_id,
    newValue: patch,
  });

  return {
    id: `${input.entity_type}:${input.entity_id}`,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    ...patch,
  };
}

export async function patchFollowup(
  ctx: ApiAuthContext,
  id: string,
  body: unknown
) {
  const input = parseBody(followupPatchSchema, body);
  const [entity_type, entity_id] = id.split(":");
  if (
    !entity_id ||
    !["company", "contact", "deal"].includes(entity_type || "")
  ) {
    throw new ApiError(
      400,
      "validation_error",
      "Followup id must be entity_type:uuid"
    );
  }
  return createFollowup(ctx, {
    entity_type,
    entity_id,
    next_followup: input.next_followup || "",
    next_action: input.next_action,
  });
}

export async function getPipeline(ctx: ApiAuthContext) {
  const supabase = createServiceClient();
  const [{ data: stages }, { data: deals }] = await Promise.all([
    supabase
      .from("pipeline_stages")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("deals")
      .select("id, stage")
      .eq("workspace_id", ctx.workspaceId),
  ]);

  const counts = new Map<string, number>();
  for (const d of deals || []) {
    counts.set(d.stage, (counts.get(d.stage) || 0) + 1);
  }

  return {
    stages: (stages || []).map((s) => ({
      ...s,
      count: counts.get(s.name) || 0,
    })),
  };
}

export async function globalSearch(ctx: ApiAuthContext, q: string) {
  const supabase = createServiceClient();
  const pattern = `%${q}%`;
  const [companies, contacts] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, website, domain, status, priority")
      .eq("workspace_id", ctx.workspaceId)
      .or(`name.ilike.${pattern},website.ilike.${pattern},domain.ilike.${pattern}`)
      .limit(20),
    supabase
      .from("contacts")
      .select("id, name, email, company_id, companies(id, name)")
      .eq("workspace_id", ctx.workspaceId)
      .or(`name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(20),
  ]);

  return {
    companies: companies.data || [],
    contacts: contacts.data || [],
  };
}

export async function getContext(ctx: ApiAuthContext) {
  const supabase = createServiceClient();
  const [workspace, stages, fields, rules, metrics] = await Promise.all([
    supabase
      .from("workspaces")
      .select("*")
      .eq("id", ctx.workspaceId)
      .single(),
    supabase
      .from("pipeline_stages")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("sort_order"),
    supabase
      .from("workspace_field_defs")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("sort_order"),
    supabase
      .from("workspace_rules")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("sort_order"),
    supabase
      .from("workspace_metrics")
      .select("*")
      .eq("workspace_id", ctx.workspaceId)
      .order("sort_order"),
  ]);

  return {
    workspace: workspace.data,
    pipeline_stages: stages.data || [],
    fields: fields.data || [],
    rules: (rules.data || []).map((r) => r.content),
    metrics: metrics.data || [],
  };
}
