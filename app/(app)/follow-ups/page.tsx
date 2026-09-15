import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PriorityBadge } from "@/components/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type FollowupRow = {
  kind: "company" | "contact" | "deal";
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  date: string;
  priority?: string | null;
  overdue: boolean;
};

export default async function FollowUpsPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [
    { data: companies },
    { data: contacts },
    { data: deals },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, next_followup, priority")
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, name, next_followup, company_id, companies(id, name)")
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
    supabase
      .from("deals")
      .select("id, name, next_followup, priority, company_id, companies(id, name)")
      .not("next_followup", "is", null)
      .order("next_followup", { ascending: true }),
  ]);

  const rows: FollowupRow[] = [];

  for (const c of companies || []) {
    if (!c.next_followup) continue;
    rows.push({
      kind: "company",
      id: c.id,
      title: c.name,
      companyId: c.id,
      companyName: c.name,
      date: c.next_followup,
      priority: c.priority,
      overdue: c.next_followup < today,
    });
  }

  for (const c of contacts || []) {
    if (!c.next_followup) continue;
    const company = Array.isArray(c.companies) ? c.companies[0] : c.companies;
    rows.push({
      kind: "contact",
      id: c.id,
      title: c.name,
      companyId: company?.id || c.company_id,
      companyName: company?.name || "—",
      date: c.next_followup,
      overdue: c.next_followup < today,
    });
  }

  for (const d of deals || []) {
    if (!d.next_followup) continue;
    const company = Array.isArray(d.companies) ? d.companies[0] : d.companies;
    rows.push({
      kind: "deal",
      id: d.id,
      title: d.name,
      companyId: company?.id || d.company_id,
      companyName: company?.name || "—",
      date: d.next_followup,
      priority: d.priority,
      overdue: d.next_followup < today,
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const due = rows.filter((r) => r.date <= today);
  const upcoming = rows.filter((r) => r.date > today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          {due.length} hoy/overdue · {upcoming.length} próximos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hoy / overdue</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowupTable rows={due} empty="No hay follow-ups pendientes" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowupTable rows={upcoming} empty="Sin follow-ups futuros" />
        </CardContent>
      </Card>
    </div>
  );
}

function FollowupTable({
  rows,
  empty,
}: {
  rows: FollowupRow[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ítem</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.kind}-${r.id}`}>
              <TableCell>
                <span className={r.overdue ? "font-medium text-destructive" : ""}>
                  {r.date}
                </span>
              </TableCell>
              <TableCell className="capitalize">{r.kind}</TableCell>
              <TableCell className="font-medium">{r.title}</TableCell>
              <TableCell>
                <Link
                  href={`/companies/${r.companyId}`}
                  className="hover:underline"
                >
                  {r.companyName}
                </Link>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={r.priority} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
