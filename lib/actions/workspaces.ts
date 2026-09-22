"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api/auth";
import { ALL_SCOPES } from "@/lib/api/scopes";
import { DEAL_STAGES } from "@/lib/constants";
import {
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "@/lib/workspace";

const TEMPLATES: Record<
  string,
  {
    type: string;
    stages: string[];
    rules: { key: string; content: string }[];
    fields: {
      entity: string;
      key: string;
      label: string;
      field_type: string;
    }[];
  }
> = {
  sponsorship: {
    type: "sponsorship",
    stages: [...DEAL_STAGES],
    rules: [
      {
        key: "email_signature",
        content: 'Sign emails as "The Cartel Insider Team"',
      },
      {
        key: "creator_privacy",
        content:
          "Creator identity is private. Never expose creator personal information.",
      },
      {
        key: "paid_preferred",
        content: "Paid sponsorship preferred; affiliate can be secondary.",
      },
      {
        key: "no_invented_contacts",
        content: "Never invent contact information.",
      },
    ],
    fields: [
      { entity: "company", key: "priority", label: "Priority", field_type: "select" },
      { entity: "company", key: "status", label: "Status", field_type: "select" },
      {
        entity: "company",
        key: "next_followup",
        label: "Next Follow-up",
        field_type: "date",
      },
    ],
  },
  sales: {
    type: "sales",
    stages: ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"],
    rules: [
      {
        key: "no_invented_contacts",
        content: "Never invent contact information.",
      },
    ],
    fields: [
      { entity: "company", key: "status", label: "Status", field_type: "select" },
    ],
  },
  generic: {
    type: "crm",
    stages: ["New", "In Progress", "Won", "Lost"],
    rules: [],
    fields: [],
  },
  personal: {
    type: "personal",
    stages: ["Todo", "Doing", "Done"],
    rules: [],
    fields: [],
  },
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export async function switchWorkspaceAction(workspaceId: string) {
  await setActiveWorkspaceId(workspaceId);
  revalidatePath("/", "layout");
  return { error: null };
}

export async function createWorkspaceAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const template = String(formData.get("template") || "generic");
  if (!name || !slug) return { error: "Nombre y slug obligatorios" };

  const tpl = TEMPLATES[template] || TEMPLATES.generic;

  const { data: ws, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug,
      type: tpl.type,
      template,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await supabase.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: "owner",
  });

  if (tpl.stages.length) {
    await supabase.from("pipeline_stages").insert(
      tpl.stages.map((s, i) => ({
        workspace_id: ws.id,
        name: s,
        sort_order: i,
        is_closed: ["Won", "Lost", "Sponsor Won", "Not Now", "Done"].includes(s),
      }))
    );
  }
  if (tpl.rules.length) {
    await supabase.from("workspace_rules").insert(
      tpl.rules.map((r, i) => ({
        workspace_id: ws.id,
        key: r.key,
        content: r.content,
        sort_order: i,
      }))
    );
  }
  if (tpl.fields.length) {
    await supabase.from("workspace_field_defs").insert(
      tpl.fields.map((f, i) => ({
        workspace_id: ws.id,
        ...f,
        sort_order: i,
      }))
    );
  }

  await setActiveWorkspaceId(ws.id);
  revalidatePath("/settings/workspaces");
  revalidatePath("/", "layout");
  return { error: null, workspaceId: ws.id };
}

export async function createApiKeyAction(formData: FormData) {
  const { supabase } = await requireUser();
  const workspaceId =
    String(formData.get("workspace_id") || "") ||
    (await getActiveWorkspaceId());
  const name = String(formData.get("name") || "ChatGPT").trim();
  const { raw, hash, prefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    workspace_id: workspaceId,
    name,
    key_hash: hash,
    key_prefix: prefix,
    scopes: ALL_SCOPES,
    active: true,
  });
  if (error) return { error: error.message, key: null };

  revalidatePath("/settings/workspaces");
  return { error: null, key: raw };
}

export async function revokeApiKeyAction(keyId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("api_keys")
    .update({ active: false })
    .eq("id", keyId);
  if (error) return { error: error.message };
  revalidatePath("/settings/workspaces");
  return { error: null };
}

export async function addWorkspaceRuleAction(formData: FormData) {
  const { supabase } = await requireUser();
  const workspaceId =
    String(formData.get("workspace_id") || "") ||
    (await getActiveWorkspaceId());
  const key = String(formData.get("key") || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const content = String(formData.get("content") || "").trim();
  if (!key || !content) return { error: "Key y contenido obligatorios" };

  const { error } = await supabase.from("workspace_rules").upsert(
    {
      workspace_id: workspaceId,
      key,
      content,
      sort_order: 100,
    },
    { onConflict: "workspace_id,key" }
  );
  if (error) return { error: error.message };
  revalidatePath("/settings/workspaces");
  return { error: null };
}
