"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  COMPANY_CSV_DEFAULTS,
  CONTACT_CSV_DEFAULTS,
  DEAL_CSV_DEFAULTS,
  STAGE_IMPORT_MAP,
} from "@/lib/constants";
import type { DealStage, PriorityLevel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, NativeSelect } from "@/components/form-fields";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Entity = "companies" | "contacts" | "deals";

const ENTITY_FIELDS: Record<Entity, string[]> = {
  companies: Object.keys(COMPANY_CSV_DEFAULTS),
  contacts: Object.keys(CONTACT_CSV_DEFAULTS),
  deals: Object.keys(DEAL_CSV_DEFAULTS),
};

const DEFAULTS: Record<Entity, Record<string, string>> = {
  companies: COMPANY_CSV_DEFAULTS,
  contacts: CONTACT_CSV_DEFAULTS,
  deals: DEAL_CSV_DEFAULTS,
};

function normalizeHeader(h: string) {
  return h.replace(/^\uFEFF/, "").trim();
}

function parseYesNo(v: string | undefined) {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}

function parseNum(v: string | undefined) {
  if (!v || !String(v).trim()) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseDate(v: string | undefined) {
  if (!v || !String(v).trim()) return null;
  return String(v).trim().slice(0, 10);
}

function mapStage(raw: string | undefined): DealStage {
  if (!raw) return "Researching";
  return STAGE_IMPORT_MAP[raw.trim()] || "Researching";
}

function mapPriority(raw: string | undefined): PriorityLevel | null {
  if (!raw) return null;
  const p = raw.trim();
  if (p === "A+" || p === "A" || p === "B" || p === "C") return p;
  return null;
}

export default function ImportPage() {
  const [entity, setEntity] = useState<Entity>("companies");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [omitPlaceholders, setOmitPlaceholders] = useState(true);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  function onFile(file: File | null) {
    if (!file) return;
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (res) => {
        const cols = (res.meta.fields || []).map(normalizeHeader);
        setHeaders(cols);
        setRows(res.data);
        const defaults = DEFAULTS[entity];
        const next: Record<string, string> = {};
        for (const field of ENTITY_FIELDS[entity]) {
          const preferred = defaults[field];
          next[field] = cols.includes(preferred)
            ? preferred
            : cols.find((c) => c.toLowerCase() === preferred.toLowerCase()) ||
              "";
        }
        setMapping(next);
        toast.success(`${res.data.length} filas leídas`);
      },
      error: (err) => toast.error(err.message),
    });
  }

  function getMapped(row: Record<string, string>, field: string) {
    const col = mapping[field];
    if (!col) return undefined;
    return row[col];
  }

  async function runImport() {
    if (rows.length === 0) {
      toast.error("Sube un CSV primero");
      return;
    }
    setPending(true);
    setResult(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      toast.error("No autenticado");
      return;
    }

    try {
      if (entity === "companies") {
        const payloads = rows.flatMap((row) => {
          const name = getMapped(row, "name")?.trim();
          if (!name) return [];
          return [
            {
              user_id: user.id,
              name,
              website: getMapped(row, "website")?.trim() || null,
              category: getMapped(row, "category")?.trim() || null,
              priority: mapPriority(getMapped(row, "priority")),
              youtube_fit: parseNum(getMapped(row, "youtube_fit")),
              instagram_fit: parseNum(getMapped(row, "instagram_fit")),
              creator_spend: parseNum(getMapped(row, "creator_spend")),
              thematic_fit: parseNum(getMapped(row, "thematic_fit")),
              contactability: parseNum(getMapped(row, "contactability")),
              score: parseNum(getMapped(row, "score")),
              evidence: getMapped(row, "evidence")?.trim() || null,
              comparable_channels:
                getMapped(row, "comparable_channels")?.trim() || null,
              personalization_hook:
                getMapped(row, "personalization_hook")?.trim() || null,
              exclusivity_conflicts:
                getMapped(row, "exclusivity_conflicts")?.trim() || null,
              evidence_url: getMapped(row, "evidence_url")?.trim() || null,
              evidence_confidence:
                getMapped(row, "evidence_confidence")?.trim() || null,
              status:
                STAGE_IMPORT_MAP[
                  (getMapped(row, "status")?.trim() || "Not contacted") as string
                ] ||
                getMapped(row, "status")?.trim() ||
                "Researching",
              next_action: getMapped(row, "next_action")?.trim() || null,
              last_contact: parseDate(getMapped(row, "last_contact")),
              next_followup: parseDate(getMapped(row, "next_followup")),
              notes: getMapped(row, "notes")?.trim() || null,
            },
          ];
        });

        let inserted = 0;
        let errors = 0;
        for (let i = 0; i < payloads.length; i += 50) {
          const chunk = payloads.slice(i, i + 50);
          const { error, count } = await supabase
            .from("companies")
            .upsert(chunk, { onConflict: "user_id,name", count: "exact" });
          if (error) {
            errors += chunk.length;
            console.error(error);
          } else {
            inserted += count ?? chunk.length;
          }
        }
        setResult(
          `Companies: ${inserted} insertadas/actualizadas` +
            (errors ? `, ${errors} con error` : "")
        );
        toast.success("Importación de companies completada");
      }

      if (entity === "contacts") {
        const { data: companies, error: cErr } = await supabase
          .from("companies")
          .select("id, name");
        if (cErr) throw cErr;
        const byName = new Map(
          (companies || []).map((c) => [c.name.trim().toLowerCase(), c.id])
        );

        const payloads = [];
        let skippedPlaceholder = 0;
        let missingCompany = 0;

        for (const row of rows) {
          const isPlaceholder = parseYesNo(getMapped(row, "is_placeholder"));
          if (omitPlaceholders && isPlaceholder) {
            skippedPlaceholder++;
            continue;
          }
          const name = getMapped(row, "name")?.trim();
          const companyName = getMapped(row, "company")?.trim();
          if (!name || !companyName) continue;
          const company_id = byName.get(companyName.toLowerCase());
          if (!company_id) {
            missingCompany++;
            continue;
          }
          payloads.push({
            user_id: user.id,
            company_id,
            name,
            contact_rank: parseNum(getMapped(row, "contact_rank")),
            job_title: getMapped(row, "job_title")?.trim() || null,
            employer: getMapped(row, "employer")?.trim() || null,
            contact_type: getMapped(row, "contact_type")?.trim() || null,
            email: getMapped(row, "email")?.trim() || null,
            linkedin_url: getMapped(row, "linkedin_url")?.trim() || null,
            why_this_contact:
              getMapped(row, "why_this_contact")?.trim() || null,
            verification_confidence:
              getMapped(row, "verification_confidence")?.trim() || null,
            researched_at: parseDate(getMapped(row, "researched_at")),
            source_url: getMapped(row, "source_url")?.trim() || null,
            personalization: getMapped(row, "personalization")?.trim() || null,
            outreach_status: getMapped(row, "outreach_status")?.trim() || null,
            last_contact: parseDate(getMapped(row, "last_contact")),
            next_followup: parseDate(getMapped(row, "next_followup")),
            notes: getMapped(row, "notes")?.trim() || null,
            is_placeholder: isPlaceholder,
          });
        }

        let inserted = 0;
        let errors = 0;
        for (let i = 0; i < payloads.length; i += 50) {
          const chunk = payloads.slice(i, i + 50);
          const { error } = await supabase.from("contacts").insert(chunk);
          if (error) {
            errors += chunk.length;
            console.error(error);
          } else {
            inserted += chunk.length;
          }
        }
        setResult(
          `Contacts: ${inserted} insertados` +
            (skippedPlaceholder
              ? `, ${skippedPlaceholder} placeholders omitidos`
              : "") +
            (missingCompany
              ? `, ${missingCompany} sin empresa coincidente`
              : "") +
            (errors ? `, ${errors} con error` : "")
        );
        toast.success("Importación de contacts completada");
      }

      if (entity === "deals") {
        const { data: companies, error: cErr } = await supabase
          .from("companies")
          .select("id, name");
        if (cErr) throw cErr;
        const byName = new Map(
          (companies || []).map((c) => [c.name.trim().toLowerCase(), c.id])
        );

        const payloads = [];
        let missingCompany = 0;
        for (const row of rows) {
          const name = getMapped(row, "name")?.trim();
          const companyName = getMapped(row, "company")?.trim();
          if (!name || !companyName) continue;
          const company_id = byName.get(companyName.toLowerCase());
          if (!company_id) {
            missingCompany++;
            continue;
          }
          payloads.push({
            user_id: user.id,
            company_id,
            name,
            stage: mapStage(getMapped(row, "stage")),
            priority: mapPriority(getMapped(row, "priority")),
            category: getMapped(row, "category")?.trim() || null,
            score: parseNum(getMapped(row, "score")),
            value: parseNum(getMapped(row, "value")),
            currency: getMapped(row, "currency")?.trim() || "EUR",
            next_action: getMapped(row, "next_action")?.trim() || null,
            last_contact: parseDate(getMapped(row, "last_contact")),
            next_followup: parseDate(getMapped(row, "next_followup")),
            exclusivity: getMapped(row, "exclusivity")?.trim() || null,
            evidence_url: getMapped(row, "evidence_url")?.trim() || null,
            notes: getMapped(row, "notes")?.trim() || null,
          });
        }

        let inserted = 0;
        let errors = 0;
        for (let i = 0; i < payloads.length; i += 50) {
          const chunk = payloads.slice(i, i + 50);
          const { error } = await supabase.from("deals").insert(chunk);
          if (error) {
            errors += chunk.length;
            console.error(error);
          } else {
            inserted += chunk.length;
          }
        }
        setResult(
          `Deals: ${inserted} insertados` +
            (missingCompany
              ? `, ${missingCompany} sin empresa coincidente`
              : "") +
            (errors ? `, ${errors} con error` : "") +
            `. Stages "Not contacted" → Researching.`
        );
        toast.success("Importación de deals completada");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error de importación";
      toast.error(msg);
      setResult(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Import CSV
        </h1>
        <p className="text-sm text-muted-foreground">
          Orden recomendado: Companies → Contacts → Deals (pack Attio).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Entidad y archivo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Entidad">
            <NativeSelect
              value={entity}
              onChange={(e) => {
                const next = e.target.value as Entity;
                setEntity(next);
                setHeaders([]);
                setRows([]);
                setMapping({});
                setResult(null);
              }}
            >
              <option value="companies">Companies</option>
              <option value="contacts">Contacts (People.csv)</option>
              <option value="deals">Deals</option>
            </NativeSelect>
          </Field>
          <Field label="Archivo CSV">
            <input
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </Field>
          {entity === "contacts" ? (
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox
                checked={omitPlaceholders}
                onCheckedChange={(v) => setOmitPlaceholders(Boolean(v))}
              />
              Omitir placeholders (`Is Placeholder = Yes`)
            </label>
          ) : null}
        </CardContent>
      </Card>

      {headers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              2. Mapear columnas ({rows.length} filas)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {ENTITY_FIELDS[entity].map((field) => (
              <Field key={field} label={field}>
                <NativeSelect
                  value={mapping[field] || ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field]: e.target.value }))
                  }
                >
                  <option value="">— ignorar —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {preview.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Preview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {ENTITY_FIELDS[entity].slice(0, 6).map((f) => (
                    <TableHead key={f}>{f}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, i) => (
                  <TableRow key={i}>
                    {ENTITY_FIELDS[entity].slice(0, 6).map((f) => (
                      <TableCell key={f} className="max-w-[180px] truncate">
                        {getMapped(row, f) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              className="mt-4"
              onClick={runImport}
              disabled={pending}
            >
              {pending ? "Importando…" : `Importar ${rows.length} filas`}
            </Button>
            {result ? (
              <p className="mt-3 text-sm text-muted-foreground">{result}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
