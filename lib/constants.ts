import type { ActivityType, DealStage, PriorityLevel } from "@/lib/types";

export const PRIORITIES: PriorityLevel[] = ["A+", "A", "B", "C"];

export const DEAL_STAGES: DealStage[] = [
  "Researching",
  "Contacted",
  "Follow-up",
  "Interested",
  "Negotiating",
  "Sponsor Won",
  "Not Now",
  "Lost",
];

export const CLOSED_DEAL_STAGES: DealStage[] = [
  "Sponsor Won",
  "Not Now",
  "Lost",
];

export const ACTIVE_DEAL_STAGES: DealStage[] = [
  "Researching",
  "Ready to Contact",
  "Contacted",
  "Waiting Reply",
  "Follow-up",
  "Interested",
  "Media Kit Sent",
  "Negotiating",
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "email_sent", label: "Email sent" },
  { value: "linkedin_message", label: "LinkedIn message" },
  { value: "instagram_dm", label: "Instagram DM" },
  { value: "form_submitted", label: "Form submitted" },
  { value: "follow_up", label: "Follow-up" },
  { value: "reply", label: "Reply" },
  { value: "call", label: "Call" },
  { value: "note", label: "Note" },
];

export const COMPANY_STATUSES = [
  "Not contacted",
  "Researching",
  "Ready to Contact",
  "Contacted",
  "Waiting Reply",
  "Follow-up",
  "Interested",
  "Negotiating",
  "Sponsor Won",
  "Not Now",
  "Lost",
] as const;

/** Map Attio/CSV pipeline labels → CRM deal stages */
export const STAGE_IMPORT_MAP: Record<string, DealStage> = {
  "Not contacted": "Researching",
  Researching: "Researching",
  "Ready to Contact": "Contacted",
  Contacted: "Contacted",
  "Waiting Reply": "Follow-up",
  "Follow-up": "Follow-up",
  Interested: "Interested",
  "Media Kit Sent": "Interested",
  Negotiating: "Negotiating",
  "Sponsor Won": "Sponsor Won",
  "Not Now": "Not Now",
  Lost: "Lost",
};

/** Normalize legacy stages removed from the UI pipeline */
export function normalizeDealStage(stage: string | null | undefined): DealStage {
  if (!stage) return "Researching";
  return STAGE_IMPORT_MAP[stage] || (stage as DealStage);
}

export const COMPANY_CSV_DEFAULTS: Record<string, string> = {
  name: "Company Name",
  website: "Website",
  category: "Category",
  priority: "Priority",
  youtube_fit: "YouTube Fit",
  instagram_fit: "Instagram Fit",
  creator_spend: "Proven Creator Spend",
  thematic_fit: "Thematic Fit",
  contactability: "Contactability",
  score: "Weighted Score",
  evidence: "Evidence of Creator Sponsorship",
  comparable_channels: "Comparable Channels",
  personalization_hook: "Personalization Hook",
  exclusivity_conflicts: "Likely Exclusivity / Conflict",
  evidence_url: "Research / Evidence URL",
  evidence_confidence: "Evidence Confidence",
  status: "Company Status",
  next_action: "Next Action",
  last_contact: "Last Contact",
  next_followup: "Next Follow-up",
  notes: "Notes",
};

export const CONTACT_CSV_DEFAULTS: Record<string, string> = {
  name: "Full Name",
  company: "Company",
  contact_rank: "Contact Rank",
  job_title: "Job Title",
  employer: "Employer / Agency",
  contact_type: "Contact Type",
  why_this_contact: "Why This Contact",
  linkedin_url: "LinkedIn / Route",
  email: "Email",
  verification_confidence: "Verification Confidence",
  researched_at: "Verified / Researched",
  source_url: "Source URL",
  personalization: "Suggested Personalization",
  outreach_status: "Outreach Status",
  last_contact: "Last Contact",
  next_followup: "Next Follow-up",
  notes: "Notes",
  is_placeholder: "Is Placeholder",
};

export const DEAL_CSV_DEFAULTS: Record<string, string> = {
  name: "Deal Name",
  company: "Company",
  stage: "Pipeline Stage",
  priority: "Priority",
  category: "Category",
  score: "Weighted Score",
  next_action: "Next Action",
  last_contact: "Last Contact",
  next_followup: "Next Follow-up",
  exclusivity: "Potential Exclusivity / Conflict",
  evidence_url: "Research / Evidence URL",
  notes: "Notes",
  value: "Deal Value",
  currency: "Currency",
};

export function priorityBadgeClass(priority: string | null | undefined): string {
  switch (priority) {
    case "A+":
      return "bg-[#e11d2e] text-white hover:bg-[#e11d2e]";
    case "A":
      return "bg-[#f5c518] text-[#1a1200] hover:bg-[#f5c518]";
    case "B":
      return "bg-[#2b4a9b] text-white hover:bg-[#2b4a9b]";
    case "C":
      return "bg-[#3d4a6b] text-[#c8d0e6] hover:bg-[#3d4a6b]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function stageBadgeClass(stage: string | null | undefined): string {
  switch (stage) {
    case "Sponsor Won":
      return "bg-emerald-500 text-white hover:bg-emerald-500";
    case "Lost":
    case "Not Now":
      return "bg-[#3d4a6b] text-[#c8d0e6] hover:bg-[#3d4a6b]";
    case "Negotiating":
    case "Interested":
      return "bg-[#e11d2e] text-white hover:bg-[#e11d2e]";
    case "Contacted":
    case "Waiting Reply":
    case "Follow-up":
      return "bg-[#2b4a9b] text-white hover:bg-[#2b4a9b]";
    case "Ready to Contact":
    case "Media Kit Sent":
      return "bg-[#152047] text-[#c8d0e6] hover:bg-[#152047]";
    default:
      return "bg-[#152047] text-[#c8d0e6] hover:bg-[#152047]";
  }
}
