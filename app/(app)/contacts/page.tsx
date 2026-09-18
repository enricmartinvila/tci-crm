import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactsFilters } from "@/components/contacts/contacts-filters";

type SearchParams = Promise<{
  q?: string;
  placeholder?: string;
  outreach?: string;
}>;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("*, companies(id, name)")
    .order("contact_rank", { ascending: true, nullsFirst: false });

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,email.ilike.%${params.q}%,job_title.ilike.%${params.q}%`
    );
  }
  const placeholder = params.placeholder ?? "no";
  if (placeholder === "yes") query = query.eq("is_placeholder", true);
  if (placeholder === "no") query = query.eq("is_placeholder", false);
  if (params.outreach) query = query.eq("outreach_status", params.outreach);

  const { data, error } = await query;
  const contacts = (data || []) as Contact[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Contacts
        </h1>
        <p className="text-sm text-muted-foreground">
          {contacts.length} contacto{contacts.length === 1 ? "" : "s"}
          {error ? ` · Error: ${error.message}` : ""}
        </p>
      </div>
      <Suspense>
        <ContactsFilters />
      </Suspense>

      <div className="space-y-3 md:hidden">
        {contacts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Sin contactos</p>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="space-y-2 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.job_title || "Sin cargo"}
                </p>
              </div>
              {c.companies ? (
                <Link
                  href={`/companies/${c.companies.id}`}
                  className="block text-sm text-brand hover:underline"
                >
                  {c.companies.name}
                </Link>
              ) : null}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {c.contact_rank != null ? <span>Rank {c.contact_rank}</span> : null}
                {c.outreach_status ? <Badge variant="outline">{c.outreach_status}</Badge> : null}
                {c.is_placeholder ? <Badge variant="outline">Placeholder</Badge> : null}
                {c.next_followup ? <span>{c.next_followup}</span> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="break-all text-brand hover:underline">
                    {c.email}
                  </a>
                ) : null}
                {c.linkedin_url ? (
                  <a
                    href={c.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:underline"
                  >
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Outreach</TableHead>
              <TableHead>Email / LinkedIn</TableHead>
              <TableHead>Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin contactos
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.job_title || "—"}
                    </div>
                    {c.is_placeholder ? (
                      <Badge variant="outline" className="mt-1">
                        Placeholder
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {c.companies ? (
                      <Link
                        href={`/companies/${c.companies.id}`}
                        className="hover:underline"
                      >
                        {c.companies.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{c.contact_rank ?? "—"}</TableCell>
                  <TableCell>{c.contact_type || "—"}</TableCell>
                  <TableCell>{c.outreach_status || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="block text-blue-600 hover:underline"
                      >
                        {c.email}
                      </a>
                    ) : null}
                    {c.linkedin_url ? (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {!c.email && !c.linkedin_url ? "—" : null}
                  </TableCell>
                  <TableCell>{c.next_followup || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
