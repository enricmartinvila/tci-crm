import { z } from "zod";

export const prioritySchema = z.enum(["A+", "A", "B", "C"]).nullable().optional();

export const companyCreateSchema = z.object({
  name: z.string().min(1),
  website: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  priority: prioritySchema,
  status: z.string().nullable().optional(),
  next_action: z.string().nullable().optional(),
  next_followup: z.string().nullable().optional(),
  last_contact: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  youtube_fit: z.number().int().min(1).max(5).nullable().optional(),
  instagram_fit: z.number().int().min(1).max(5).nullable().optional(),
  score: z.number().nullable().optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  force: z.boolean().optional(),
});

export const companyPatchSchema = companyCreateSchema
  .partial()
  .omit({ force: true });

export const contactCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().nullable().optional().or(z.literal("")),
  job_title: z.string().nullable().optional(),
  contact_type: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  outreach_status: z.string().nullable().optional(),
  next_followup: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  force: z.boolean().optional(),
});

export const contactPatchSchema = contactCreateSchema
  .partial()
  .omit({ force: true });

export const dealCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1),
  stage: z.string().optional(),
  priority: prioritySchema,
  value: z.number().nullable().optional(),
  currency: z.string().optional(),
  next_action: z.string().nullable().optional(),
  next_followup: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
});

export const dealPatchSchema = dealCreateSchema.partial();

export const activityCreateSchema = z.object({
  company_id: z.string().uuid(),
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  type: z.string().min(1),
  comment: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  direction: z.enum(["inbound", "outbound"]).nullable().optional(),
  external_thread_id: z.string().nullable().optional(),
  external_message_id: z.string().nullable().optional(),
  happened_at: z.string().nullable().optional(),
  occurred_at: z.string().nullable().optional(),
  next_followup: z.string().nullable().optional(),
});

export const followupCreateSchema = z.object({
  entity_type: z.enum(["company", "contact", "deal"]),
  entity_id: z.string().uuid(),
  next_followup: z.string().min(1),
  next_action: z.string().nullable().optional(),
});

export const followupPatchSchema = z.object({
  next_followup: z.string().nullable().optional(),
  next_action: z.string().nullable().optional(),
  last_contact: z.string().nullable().optional(),
});
