export type PriorityLevel = "A+" | "A" | "B" | "C";

export type DealStage =
  | "Researching"
  | "Ready to Contact"
  | "Contacted"
  | "Waiting Reply"
  | "Follow-up"
  | "Interested"
  | "Media Kit Sent"
  | "Negotiating"
  | "Sponsor Won"
  | "Not Now"
  | "Lost";

export type ActivityType =
  | "email_sent"
  | "linkedin_message"
  | "instagram_dm"
  | "form_submitted"
  | "follow_up"
  | "reply"
  | "call"
  | "note";

export type Company = {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  category: string | null;
  priority: PriorityLevel | null;
  youtube_fit: number | null;
  instagram_fit: number | null;
  creator_spend: number | null;
  thematic_fit: number | null;
  contactability: number | null;
  score: number | null;
  evidence: string | null;
  comparable_channels: string | null;
  personalization_hook: string | null;
  exclusivity_conflicts: string | null;
  evidence_url: string | null;
  evidence_confidence: string | null;
  primary_outreach_channel: string | null;
  official_creator_form: string | null;
  influencer_email: string | null;
  instagram_dm_suitable: boolean | null;
  press_kit_required: boolean | null;
  affiliate_program: boolean | null;
  paid_sponsorship_confirmed: boolean | null;
  status: string | null;
  next_action: string | null;
  last_contact: string | null;
  next_followup: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  contact_rank: number | null;
  job_title: string | null;
  employer: string | null;
  contact_type: string | null;
  email: string | null;
  linkedin_url: string | null;
  why_this_contact: string | null;
  verification_confidence: string | null;
  researched_at: string | null;
  source_url: string | null;
  personalization: string | null;
  outreach_status: string | null;
  last_contact: string | null;
  next_followup: string | null;
  notes: string | null;
  is_placeholder: boolean;
  created_at: string;
  updated_at: string;
  companies?: Pick<Company, "id" | "name"> | null;
};

export type Deal = {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  stage: DealStage;
  priority: PriorityLevel | null;
  category: string | null;
  score: number | null;
  value: number | null;
  currency: string;
  youtube_rate: number | null;
  instagram_rate: number | null;
  bundle_rate: number | null;
  next_action: string | null;
  last_contact: string | null;
  next_followup: string | null;
  exclusivity: string | null;
  evidence_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  companies?: Pick<Company, "id" | "name"> | null;
};

export type Activity = {
  id: string;
  user_id: string;
  company_id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: ActivityType;
  happened_at: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  contacts?: Pick<Contact, "id" | "name"> | null;
};
