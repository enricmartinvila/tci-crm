import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_DEAL_STAGES,
  DEAL_STAGES,
  normalizeDealStage,
} from "@/lib/constants";
import type { DealStage } from "@/lib/types";
import { getActiveWorkspaceId } from "@/lib/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StageBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysOverdue(date: string, today: string) {
  const diff = Math.floor(
    (new Date(today).getTime() - new Date(date).getTime()) / 86400000
  );
  return diff > 0 ? diff : 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const workspaceId = await getActiveWorkspaceId();
  const today = todayISO();

  const [
    { count: companyCount },
    { data: deals },
    { count: followupCompanyCount },
    { count: followupContactCount },
    { count: followupDealCount },
    { data: companyFollowups },
    { data: contactFollowups },
    { data: dealFollowups },
    { data: recentActivities },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("deals")
      .select("id, stage, value, currency")
      .eq("workspace_id", workspaceId),
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null),
    supabase
      .from("companies")
      .select("id, name, next_followup, priority, status")
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(12),
    supabase
      .from("contacts")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(8),
    supabase
      .from("deals")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .eq("workspace_id", workspaceId)
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(8),
    supabase
      .from("activities")
      .select(
        "id, type, comment, happened_at, company_id, companies(id, name)"
      )
      .eq("workspace_id", workspaceId)
      .order("happened_at", { ascending: false })
      .limit(6),
  ]);

  const stageCounts = new Map<DealStage, number>();
  for (const stage of DEAL_STAGES) stageCounts.set(stage, 0);
  let pipelineValue = 0;
  let wonValue = 0;
  for (const d of deals || []) {
    const stage = normalizeDealStage(d.stage);
    stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
    const value = Number(d.value) || 0;
    if (ACTIVE_DEAL_STAGES.includes(stage)) pipelineValue += value;
    if (stage === "Sponsor Won") wonValue += value;
  }

  const activeDeals = (deals || []).filter((d) =>
    ACTIVE_DEAL_STAGES.includes(normalizeDealStage(d.stage))
  ).length;
  const negotiating = stageCounts.get("Negotiating") || 0;
  const interested = stageCounts.get("Interested") || 0;
  const wonDeals = stageCounts.get("Sponsor Won") || 0;
  const closedLost =
    (stageCounts.get("Lost") || 0) + (stageCounts.get("Not Now") || 0);
  const decided = wonDeals + closedLost;
  const winRate = decided > 0 ? Math.round((wonDeals / decided) * 100) : null;

  const followupCount =
    (followupCompanyCount || 0) +
    (followupContactCount || 0) +
    (followupDealCount || 0);

  type FollowRow = {
    key: string;
    href: string;
    title: string;
    subtitle?: string;
    date: string;
    priority?: string | null;
    kind: "Empresa" | "Contacto" | "Deal";
  };

  const followRows: FollowRow[] = [
    ...(companyFollowups || []).map((c) => ({
      key: `co-${c.id}`,
      href: `/companies/${c.id}`,
      title: c.name,
      date: c.next_followup as string,
      priority: c.priority,
      kind: "Empresa" as const,
    })),
    ...(contactFollowups || []).map((c) => {
      const company = Array.isArray(c.companies) ? c.companies[0] : c.companies;
      return {
        key: `ct-${c.id}`,
        href: company ? `/companies/${company.id}` : "/contacts",
        title: c.name,
        subtitle: company?.name,
        date: c.next_followup as string,
        kind: "Contacto" as const,
      };
    }),
    ...(dealFollowups || []).map((d) => {
      const company = Array.isArray(d.companies) ? d.companies[0] : d.companies;
      return {
        key: `de-${d.id}`,
        href: company ? `/companies/${company.id}` : "/deals",
        title: d.name,
        subtitle: company?.name,
        date: d.next_followup as string,
        kind: "Deal" as const,
      };
    }),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const overdueCount = followRows.filter((r) => r.date < today).length;
  const maxStage = Math.max(1, ...stageCounts.values());

  const cards = [
    {
      title: "Follow-ups pendientes",
      value: followupCount,
      hint:
        overdueCount > 0
          ? `${overdueCount} overdue`
          : followupCount > 0
            ? "Hoy o antes"
            : "Al día",
      href: "/follow-ups",
      accent: overdueCount > 0,
    },
    {
      title: "En negociación",
      value: negotiating,
      hint: interested > 0 ? `${interested} interested` : "Pipeline caliente",
      href: "/deals?stage=Negotiating",
    },
    {
      title: "Deals activos",
      value: activeDeals,
      hint:
        pipelineValue > 0
          ? `${pipelineValue.toLocaleString("es-ES")} € en pipeline`
          : `${companyCount || 0} empresas`,
      href: "/deals",
    },
    {
      title: "Sponsors ganados",
      value: wonDeals,
      hint:
        winRate != null
          ? `${winRate}% win rate`
          : wonValue > 0
            ? `${wonValue.toLocaleString("es-ES")} €`
            : "Cerrados",
      href: "/deals?stage=Sponsor%20Won",
    },
  ];

  const activityLabel: Record<string, string> = {
    note: "Nota",
    meeting: "Reunión",
    call: "Call",
    email_sent: "Email",
    linkedin_message: "LinkedIn",
    instagram_dm: "IG DM",
    form_submitted: "Form",
    follow_up: "Follow-up",
    reply: "Reply",
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <p className="text-sm font-semibold text-muted-foreground">
          The Cartel Insider
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-foreground md:text-4xl">
          Sponsor Desk
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Qué toca hoy: follow-ups, negociación y estado del pipeline.
        </p>
      </div>

      <div className="tci-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="tci-animate-in">
            <Card
              className={`tci-panel h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 ${
                card.accent ? "border-primary/40" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold tracking-tight text-foreground">
                  {card.value}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    card.accent ? "font-medium text-primary" : "text-muted-foreground"
                  }`}
                >
                  {card.hint}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="tci-panel lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Follow-ups hoy / overdue</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Lo primero que deberías tocar hoy.
              </p>
            </div>
            <Link
              href="/follow-ups"
              className="shrink-0 text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {followRows.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No hay follow-ups pendientes. Buen momento para avanzar deals.
              </p>
            ) : (
              followRows.map((row) => {
                const overdue = daysOverdue(row.date, today);
                return (
                  <Link
                    key={row.key}
                    href={row.href}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">
                          {row.title}
                        </span>
                        <Badge variant="secondary" className="text-[11px]">
                          {row.kind}
                        </Badge>
                        {row.priority ? (
                          <PriorityBadge priority={row.priority} />
                        ) : null}
                      </div>
                      {row.subtitle ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {row.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-medium ${
                          overdue > 0 ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {row.date}
                      </p>
                      {overdue > 0 ? (
                        <p className="text-xs text-primary">
                          {overdue === 1 ? "1 día overdue" : `${overdue} días overdue`}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Hoy</p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="tci-panel lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pipeline por stage</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dónde están los deals ahora mismo.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEAL_STAGES.map((stage) => {
              const count = stageCounts.get(stage) || 0;
              const pct = Math.round((count / maxStage) * 100);
              return (
                <Link
                  key={stage}
                  href={`/deals?stage=${encodeURIComponent(stage)}`}
                  className="block space-y-1.5 rounded-md p-1 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <StageBadge stage={stage} />
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${count === 0 ? 0 : Math.max(pct, 8)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
            {(deals || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin deals todavía. Crea uno desde una empresa.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="tci-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimas notas, calls y reuniones.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {(recentActivities || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay actividad registrada.
            </p>
          ) : (
            (recentActivities || []).map((a) => {
              const company = Array.isArray(a.companies)
                ? a.companies[0]
                : a.companies;
              const when = a.happened_at
                ? new Date(a.happened_at).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
              return (
                <Link
                  key={a.id}
                  href={company ? `/companies/${company.id}` : "/companies"}
                  className="flex items-start justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {activityLabel[a.type] || a.type}
                      </Badge>
                      {company ? (
                        <span className="truncate text-sm font-medium">
                          {company.name}
                        </span>
                      ) : null}
                    </div>
                    {a.comment ? (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {a.comment}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {when}
                  </span>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
