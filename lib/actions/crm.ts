"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { statusToDealStage } from "@/lib/constants";
import type { ActivityType, DealStage, PriorityLevel } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

async function syncDealsStageFromCompanyStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  status: string | null | undefined
) {
  const stage = statusToDealStage(status);
  if (!stage) return;
  await supabase.from("deals").update({ stage }).eq("company_id", companyId);
}

async function syncCompanyStatusFromDealStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  stage: DealStage
) {
  await supabase
    .from("companies")
    .update({ status: stage })
    .eq("id", companyId);
}

function emptyToNull(v: FormDataEntryValue | null | undefined) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toInt(v: FormDataEntryValue | null | undefined) {
  const s = emptyToNull(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toBool(v: FormDataEntryValue | null | undefined) {
  if (v === null || v === undefined || v === "") return null;
  return v === "true" || v === "on" || v === "1" || v === "Yes";
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function createCompany(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = {
    user_id: user.id,
    name: String(formData.get("name") || "").trim(),
    website: emptyToNull(formData.get("website")),
    category: emptyToNull(formData.get("category")),
    priority: emptyToNull(formData.get("priority")) as PriorityLevel | null,
    status: emptyToNull(formData.get("status")) || "Not contacted",
    next_action: emptyToNull(formData.get("next_action")),
    notes: emptyToNull(formData.get("notes")),
    youtube_fit: toInt(formData.get("youtube_fit")),
    instagram_fit: toInt(formData.get("instagram_fit")),
    creator_spend: toInt(formData.get("creator_spend")),
    thematic_fit: toInt(formData.get("thematic_fit")),
    contactability: toInt(formData.get("contactability")),
    score: toInt(formData.get("score")),
  };
  if (!payload.name) return { error: "El nombre es obligatorio" };
  const { error } = await supabase.from("companies").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/companies");
  revalidatePath("/");
  return { error: null };
}

export async function updateCompany(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const payload = {
    name: String(formData.get("name") || "").trim(),
    website: emptyToNull(formData.get("website")),
    category: emptyToNull(formData.get("category")),
    priority: emptyToNull(formData.get("priority")) as PriorityLevel | null,
    youtube_fit: toInt(formData.get("youtube_fit")),
    instagram_fit: toInt(formData.get("instagram_fit")),
    creator_spend: toInt(formData.get("creator_spend")),
    thematic_fit: toInt(formData.get("thematic_fit")),
    contactability: toInt(formData.get("contactability")),
    score: toInt(formData.get("score")),
    evidence: emptyToNull(formData.get("evidence")),
    comparable_channels: emptyToNull(formData.get("comparable_channels")),
    personalization_hook: emptyToNull(formData.get("personalization_hook")),
    exclusivity_conflicts: emptyToNull(formData.get("exclusivity_conflicts")),
    evidence_url: emptyToNull(formData.get("evidence_url")),
    evidence_confidence: emptyToNull(formData.get("evidence_confidence")),
    primary_outreach_channel: emptyToNull(
      formData.get("primary_outreach_channel")
    ),
    official_creator_form: emptyToNull(formData.get("official_creator_form")),
    influencer_email: emptyToNull(formData.get("influencer_email")),
    instagram_dm_suitable: toBool(formData.get("instagram_dm_suitable")),
    press_kit_required: toBool(formData.get("press_kit_required")),
    affiliate_program: toBool(formData.get("affiliate_program")),
    paid_sponsorship_confirmed: toBool(
      formData.get("paid_sponsorship_confirmed")
    ),
    status: emptyToNull(formData.get("status")),
    next_action: emptyToNull(formData.get("next_action")),
    last_contact: emptyToNull(formData.get("last_contact")),
    next_followup: emptyToNull(formData.get("next_followup")),
    notes: emptyToNull(formData.get("notes")),
  };
  const { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };
  await syncDealsStageFromCompanyStatus(supabase, id, payload.status);
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  revalidatePath("/deals");
  revalidatePath("/");
  revalidatePath("/follow-ups");
  return { error: null };
}

export async function updateCompanyField(
  id: string,
  field: string,
  value: string | number | boolean | null
) {
  const { supabase } = await requireUser();
  const nextValue = value === "" ? null : value;
  const { error } = await supabase
    .from("companies")
    .update({ [field]: nextValue })
    .eq("id", id);
  if (error) return { error: error.message };
  if (field === "status") {
    await syncDealsStageFromCompanyStatus(
      supabase,
      id,
      typeof nextValue === "string" ? nextValue : null
    );
  }
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  revalidatePath("/deals");
  revalidatePath("/");
  return { error: null };
}

export async function deleteCompany(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/companies");
  revalidatePath("/");
  return { error: null };
}

export async function createContact(formData: FormData) {
  const { supabase, user } = await requireUser();
  const company_id = String(formData.get("company_id") || "");
  const payload = {
    user_id: user.id,
    company_id,
    name: String(formData.get("name") || "").trim(),
    contact_rank: toInt(formData.get("contact_rank")),
    job_title: emptyToNull(formData.get("job_title")),
    employer: emptyToNull(formData.get("employer")),
    contact_type: emptyToNull(formData.get("contact_type")),
    email: emptyToNull(formData.get("email")),
    linkedin_url: emptyToNull(formData.get("linkedin_url")),
    why_this_contact: emptyToNull(formData.get("why_this_contact")),
    verification_confidence: emptyToNull(
      formData.get("verification_confidence")
    ),
    source_url: emptyToNull(formData.get("source_url")),
    personalization: emptyToNull(formData.get("personalization")),
    outreach_status: emptyToNull(formData.get("outreach_status")),
    last_contact: emptyToNull(formData.get("last_contact")),
    next_followup: emptyToNull(formData.get("next_followup")),
    notes: emptyToNull(formData.get("notes")),
    is_placeholder: toBool(formData.get("is_placeholder")) ?? false,
  };
  if (!payload.name || !company_id)
    return { error: "Nombre y empresa son obligatorios" };
  const { error } = await supabase.from("contacts").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/contacts");
  revalidatePath(`/companies/${company_id}`);
  revalidatePath("/follow-ups");
  return { error: null };
}

export async function updateContact(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const company_id = String(formData.get("company_id") || "");
  const payload = {
    name: String(formData.get("name") || "").trim(),
    company_id,
    contact_rank: toInt(formData.get("contact_rank")),
    job_title: emptyToNull(formData.get("job_title")),
    employer: emptyToNull(formData.get("employer")),
    contact_type: emptyToNull(formData.get("contact_type")),
    email: emptyToNull(formData.get("email")),
    linkedin_url: emptyToNull(formData.get("linkedin_url")),
    why_this_contact: emptyToNull(formData.get("why_this_contact")),
    verification_confidence: emptyToNull(
      formData.get("verification_confidence")
    ),
    source_url: emptyToNull(formData.get("source_url")),
    personalization: emptyToNull(formData.get("personalization")),
    outreach_status: emptyToNull(formData.get("outreach_status")),
    last_contact: emptyToNull(formData.get("last_contact")),
    next_followup: emptyToNull(formData.get("next_followup")),
    notes: emptyToNull(formData.get("notes")),
    is_placeholder: toBool(formData.get("is_placeholder")) ?? false,
  };
  const { error } = await supabase.from("contacts").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/contacts");
  revalidatePath(`/companies/${company_id}`);
  revalidatePath("/follow-ups");
  return { error: null };
}

export async function deleteContact(id: string, companyId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/contacts");
  revalidatePath(`/companies/${companyId}`);
  return { error: null };
}

export async function createDeal(formData: FormData) {
  const { supabase, user } = await requireUser();
  const company_id = String(formData.get("company_id") || "");
  const payload = {
    user_id: user.id,
    company_id,
    name: String(formData.get("name") || "").trim(),
    stage: (emptyToNull(formData.get("stage")) ||
      "Researching") as DealStage,
    priority: emptyToNull(formData.get("priority")) as PriorityLevel | null,
    value: toInt(formData.get("value")),
    currency: emptyToNull(formData.get("currency")) || "EUR",
    youtube_rate: toInt(formData.get("youtube_rate")),
    instagram_rate: toInt(formData.get("instagram_rate")),
    bundle_rate: toInt(formData.get("bundle_rate")),
    next_action: emptyToNull(formData.get("next_action")),
    next_followup: emptyToNull(formData.get("next_followup")),
    exclusivity: emptyToNull(formData.get("exclusivity")),
    notes: emptyToNull(formData.get("notes")),
  };
  if (!payload.name || !company_id)
    return { error: "Nombre y empresa son obligatorios" };
  const { error } = await supabase.from("deals").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/deals");
  revalidatePath(`/companies/${company_id}`);
  revalidatePath("/");
  return { error: null };
}

export async function updateDeal(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const company_id = String(formData.get("company_id") || "");
  const payload = {
    name: String(formData.get("name") || "").trim(),
    company_id,
    stage: (emptyToNull(formData.get("stage")) ||
      "Researching") as DealStage,
    priority: emptyToNull(formData.get("priority")) as PriorityLevel | null,
    value: toInt(formData.get("value")),
    currency: emptyToNull(formData.get("currency")) || "EUR",
    youtube_rate: toInt(formData.get("youtube_rate")),
    instagram_rate: toInt(formData.get("instagram_rate")),
    bundle_rate: toInt(formData.get("bundle_rate")),
    next_action: emptyToNull(formData.get("next_action")),
    next_followup: emptyToNull(formData.get("next_followup")),
    exclusivity: emptyToNull(formData.get("exclusivity")),
    notes: emptyToNull(formData.get("notes")),
  };
  const { error } = await supabase.from("deals").update(payload).eq("id", id);
  if (error) return { error: error.message };
  if (company_id) {
    await syncCompanyStatusFromDealStage(supabase, company_id, payload.stage);
  }
  revalidatePath("/deals");
  revalidatePath(`/companies/${company_id}`);
  revalidatePath("/companies");
  revalidatePath("/");
  revalidatePath("/follow-ups");
  return { error: null };
}

export async function updateDealStage(id: string, stage: DealStage) {
  const { supabase } = await requireUser();
  const { data: deal, error: fetchError } = await supabase
    .from("deals")
    .select("company_id")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };

  const { error } = await supabase.from("deals").update({ stage }).eq("id", id);
  if (error) return { error: error.message };

  if (deal?.company_id) {
    await syncCompanyStatusFromDealStage(supabase, deal.company_id, stage);
    revalidatePath(`/companies/${deal.company_id}`);
  }
  revalidatePath("/deals");
  revalidatePath("/companies");
  revalidatePath("/");
  return { error: null };
}

export async function deleteDeal(id: string, companyId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/deals");
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/");
  return { error: null };
}

export async function createActivity(formData: FormData) {
  const { supabase, user } = await requireUser();
  const company_id = String(formData.get("company_id") || "");
  const contact_id = emptyToNull(formData.get("contact_id"));
  const deal_id = emptyToNull(formData.get("deal_id"));
  const happened_at =
    emptyToNull(formData.get("happened_at")) || new Date().toISOString();
  const next_followup = emptyToNull(formData.get("next_followup"));
  const payload = {
    user_id: user.id,
    company_id,
    contact_id,
    deal_id,
    type: String(formData.get("type") || "note") as ActivityType,
    happened_at,
    comment: emptyToNull(formData.get("comment")),
  };
  if (!company_id) return { error: "Empresa obligatoria" };
  const { error } = await supabase.from("activities").insert(payload);
  if (error) return { error: error.message };

  if (next_followup) {
    await supabase
      .from("companies")
      .update({ next_followup })
      .eq("id", company_id);
  }

  revalidatePath(`/companies/${company_id}`);
  revalidatePath("/");
  revalidatePath("/follow-ups");
  return { error: null };
}

export async function deleteActivity(id: string, companyId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/companies/${companyId}`);
  return { error: null };
}
