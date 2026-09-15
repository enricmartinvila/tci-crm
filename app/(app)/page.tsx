import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_DEAL_STAGES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/badges";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [
    { data: companies },
    { data: deals },
    { data: companyFollowups },
    { data: contactFollowups },
    { data: dealFollowups },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, status, priority, score"),
    supabase.from("deals").select("id, stage, priority"),
    supabase
      .from("companies")
      .select("id, name, next_followup, priority, status")
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(10),
    supabase
      .from("contacts")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(10),
    supabase
      .from("deals")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .lte("next_followup", today)
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true })
      .limit(10),
  ]);

  const statusCounts = new Map<string, number>();
  for (const c of companies || []) {
    const key = c.status || "Sin status";
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
  }

  const priorityA = (companies || []).filter(
    (c) => c.priority === "A+" || c.priority === "A"
  ).length;
  const activeDeals = (deals || []).filter((d) =>
    ACTIVE_DEAL_STAGES.includes(d.stage)
  ).length;
  const wonDeals = (deals || []).filter((d) => d.stage === "Sponsor Won").length;

  const followupCount =
    (companyFollowups?.length || 0) +
    (contactFollowups?.length || 0) +
    (dealFollowups?.length || 0);

  const cards = [
    {
      title: "Prioritarias A+ / A",
      value: priorityA,
      href: "/companies?priority=A",
    },
    {
      title: "Follow-ups pendientes",
      value: followupCount,
      href: "/follow-ups",
    },
    {
      title: "Deals activos",
      value: activeDeals,
      href: "/deals",
    },
    {
      title: "Sponsors ganados",
      value: wonDeals,
      href: "/deals",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1430] via-[#0a1230] to-[#1a0a14] p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/20 blur-3xl"
        />
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9aa6c4] uppercase">
          The Cartel Insider
        </p>
        <h1 className="font-display mt-1 text-4xl tracking-[0.08em] text-white uppercase md:text-5xl">
          Sponsor Desk
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#9aa6c4]">
          Pipeline de sponsors, follow-ups y deals activos.
        </p>
      </div>

      <div className="tci-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="tci-animate-in">
            <Card className="tci-panel border-white/10 bg-card/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl tracking-wide text-white">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="tci-panel border-white/10 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Empresas por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...statusCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <StatusBadge status={status} />
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {statusCounts.size === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin empresas todavía. Usa Import para cargar el CSV.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="tci-panel border-white/10 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Follow-ups hoy / overdue</CardTitle>
            <Link
              href="/follow-ups"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(companyFollowups || []).map((c) => (
              <div key={`co-${c.id}`} className="flex justify-between gap-2">
                <Link
                  href={`/companies/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <span className="text-muted-foreground">{c.next_followup}</span>
                </div>
              </div>
            ))}
            {(contactFollowups || []).map((c) => {
              const company = Array.isArray(c.companies)
                ? c.companies[0]
                : c.companies;
              return (
                <div key={`ct-${c.id}`} className="flex justify-between gap-2">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    {company ? (
                      <Link
                        href={`/companies/${company.id}`}
                        className="ml-1 text-muted-foreground hover:underline"
                      >
                        · {company.name}
                      </Link>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground">{c.next_followup}</span>
                </div>
              );
            })}
            {(dealFollowups || []).map((d) => {
              const company = Array.isArray(d.companies)
                ? d.companies[0]
                : d.companies;
              return (
                <div key={`de-${d.id}`} className="flex justify-between gap-2">
                  <div>
                    <span className="font-medium">{d.name}</span>
                    {company ? (
                      <Link
                        href={`/companies/${company.id}`}
                        className="ml-1 text-muted-foreground hover:underline"
                      >
                        · {company.name}
                      </Link>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground">{d.next_followup}</span>
                </div>
              );
            })}
            {followupCount === 0 ? (
              <p className="text-muted-foreground">No hay follow-ups pendientes</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="tci-panel border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">Empresas prioritarias A+ / A</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(companies || [])
            .filter((c) => c.priority === "A+" || c.priority === "A")
            .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
            .slice(0, 12)
            .map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <Link
                  href={`/companies/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <span className="text-muted-foreground">
                    {c.score ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          {priorityA === 0 ? (
            <p className="text-sm text-muted-foreground">Sin prioritarias</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
