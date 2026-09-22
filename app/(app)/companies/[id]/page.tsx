import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace";
import type { Activity, Company, Contact, Deal } from "@/lib/types";
import { PriorityBadge, StageBadge, StatusBadge } from "@/components/badges";
import { AddActivityDialog } from "@/components/add-activity-dialog";
import { EditCompanyDialog } from "@/components/companies/edit-company-dialog";
import { CompanyNotesTimeline } from "@/components/companies/company-notes-timeline";
import {
  CreateContactDialog,
  CreateDealDialog,
} from "@/components/companies/company-entity-dialogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { normalizeCompanyStatus } from "@/lib/constants";

function boolLabel(v: boolean | null | undefined) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const workspaceId = await getActiveWorkspaceId();

  const [
    { data: company },
    { data: contacts },
    { data: deals },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("contacts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("company_id", id)
      .order("contact_rank", { ascending: true, nullsFirst: false }),
    supabase
      .from("deals")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("company_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*, contacts(id, name)")
      .eq("workspace_id", workspaceId)
      .eq("company_id", id)
      .order("happened_at", { ascending: false }),
  ]);

  if (!company) notFound();
  const c = company as Company;

  const contactList = (contacts || []) as Contact[];
  const dealList = (deals || []) as Deal[];
  const activityList = (activities || []) as Activity[];

  const followUps = [
    c.next_followup
      ? { label: `Company: ${c.name}`, date: c.next_followup }
      : null,
    ...contactList
      .filter((x) => x.next_followup)
      .map((x) => ({ label: `Contact: ${x.name}`, date: x.next_followup! })),
    ...dealList
      .filter((x) => x.next_followup)
      .map((x) => ({ label: `Deal: ${x.name}`, date: x.next_followup! })),
  ].filter(Boolean) as { label: string; date: string }[];

  followUps.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/companies"
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Companies
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {c.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={normalizeCompanyStatus(c.status)} />
            {c.category ? <Badge variant="outline">{c.category}</Badge> : null}
            {c.score != null ? (
              <Badge variant="secondary">Score {c.score}</Badge>
            ) : null}
          </div>
          {c.website ? (
            <a
              href={c.website}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-sm text-brand hover:underline"
            >
              {c.website}
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <EditCompanyDialog company={c} />
          <AddActivityDialog
            companyId={c.id}
            contacts={contactList}
            dealId={dealList[0]?.id}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Personalization hook</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {c.personalization_hook || "—"}
              </p>
            </div>
            <div>
              <p className="font-medium">Evidence</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {c.evidence || "—"}
              </p>
            </div>
            <div>
              <p className="font-medium">Comparable channels</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {c.comparable_channels || "—"}
              </p>
            </div>
            <div>
              <p className="font-medium">Exclusivity / conflicts</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {c.exclusivity_conflicts || "—"}
              </p>
            </div>
            <div>
              <p className="font-medium">Notes</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {c.notes || "—"}
              </p>
            </div>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="font-medium">Next action:</span>{" "}
                {c.next_action || "—"}
              </p>
              <p>
                <span className="font-medium">Evidence confidence:</span>{" "}
                {c.evidence_confidence || "—"}
              </p>
              <p>
                <span className="font-medium">Outreach channel:</span>{" "}
                {c.primary_outreach_channel || "—"}
              </p>
              <p>
                <span className="font-medium">Influencer email:</span>{" "}
                {c.influencer_email || "—"}
              </p>
              <p>
                <span className="font-medium">Creator form:</span>{" "}
                {c.official_creator_form || "—"}
              </p>
              <p>
                <span className="font-medium">IG DM suitable:</span>{" "}
                {boolLabel(c.instagram_dm_suitable)}
              </p>
              <p>
                <span className="font-medium">Press kit required:</span>{" "}
                {boolLabel(c.press_kit_required)}
              </p>
              <p>
                <span className="font-medium">Affiliate:</span>{" "}
                {boolLabel(c.affiliate_program)}
              </p>
              <p>
                <span className="font-medium">Paid confirmed:</span>{" "}
                {boolLabel(c.paid_sponsorship_confirmed)}
              </p>
              {c.evidence_url ? (
                <p className="sm:col-span-2">
                  <span className="font-medium">Evidence URL:</span>{" "}
                  <a
                    href={c.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-brand hover:underline"
                  >
                    {c.evidence_url}
                  </a>
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scores</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <p>YT: {c.youtube_fit ?? "—"}</p>
              <p>IG: {c.instagram_fit ?? "—"}</p>
              <p>Spend: {c.creator_spend ?? "—"}</p>
              <p>Theme: {c.thematic_fit ?? "—"}</p>
              <p>Contact: {c.contactability ?? "—"}</p>
              <p>Score: {c.score ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {followUps.length === 0 ? (
                <p className="text-muted-foreground">Sin follow-ups</p>
              ) : (
                followUps.map((f) => (
                  <div
                    key={`${f.label}-${f.date}`}
                    className="flex justify-between gap-2"
                  >
                    <span className="min-w-0 truncate">{f.label}</span>
                    <span className="shrink-0 text-muted-foreground">{f.date}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CompanyNotesTimeline
        companyId={c.id}
        contacts={contactList}
        dealId={dealList[0]?.id}
        activities={activityList}
      />

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">
            Contacts ({contactList.length})
          </CardTitle>
          <CreateContactDialog companyId={c.id} />
        </CardHeader>
        <CardContent className="space-y-3">
          {contactList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin contactos</p>
          ) : (
            contactList.map((contact) => (
              <div
                key={contact.id}
                className="rounded-lg border p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    #{contact.contact_rank ?? "?"} {contact.name}
                  </span>
                  {contact.is_placeholder ? (
                    <Badge variant="outline">Placeholder</Badge>
                  ) : null}
                  {contact.contact_type ? (
                    <Badge variant="secondary">{contact.contact_type}</Badge>
                  ) : null}
                  {contact.outreach_status ? (
                    <Badge variant="outline">{contact.outreach_status}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {[contact.job_title, contact.employer]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : null}
                  {contact.linkedin_url ? (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  {contact.next_followup ? (
                    <span>Follow-up: {contact.next_followup}</span>
                  ) : null}
                </div>
                {contact.why_this_contact ? (
                  <p className="mt-2 text-muted-foreground">
                    {contact.why_this_contact}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Deals ({dealList.length})</CardTitle>
          <CreateDealDialog
            companyId={c.id}
            defaultName={`${c.name} — Sponsorship`}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {dealList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin deals</p>
          ) : (
            dealList.map((deal) => (
              <div key={deal.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{deal.name}</span>
                  <StageBadge stage={deal.stage} />
                  <PriorityBadge priority={deal.priority} />
                </div>
                <p className="mt-1 text-muted-foreground">
                  {deal.next_action || "Sin next action"}
                  {deal.next_followup ? ` · Follow-up ${deal.next_followup}` : ""}
                  {deal.value != null
                    ? ` · ${deal.value} ${deal.currency}`
                    : ""}
                </p>
                {deal.notes ? (
                  <p className="mt-2 text-muted-foreground">{deal.notes}</p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
