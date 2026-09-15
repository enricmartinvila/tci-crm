"use client";

import Link from "next/link";
import { toast } from "sonner";
import { updateCompanyField } from "@/lib/actions/crm";
import type { Company } from "@/lib/types";
import { COMPANY_STATUSES, PRIORITIES } from "@/lib/constants";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { NativeSelect } from "@/components/form-fields";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CompaniesTable({ companies }: { companies: Company[] }) {
  async function onFieldChange(
    id: string,
    field: string,
    value: string
  ) {
    const result = await updateCompanyField(id, field, value || null);
    if (result.error) toast.error(result.error);
    else toast.success("Actualizado");
  }

  if (companies.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hay empresas. Importa el CSV o crea una nueva.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next action</TableHead>
            <TableHead>Follow-up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link
                  href={`/companies/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block text-xs text-muted-foreground hover:underline"
                  >
                    {c.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-sm">
                {c.category || "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <NativeSelect
                    className="h-7 w-16"
                    defaultValue={c.priority || ""}
                    onChange={(e) =>
                      onFieldChange(c.id, "priority", e.target.value)
                    }
                  >
                    <option value="">—</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </TableCell>
              <TableCell>{c.score ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={c.status} />
                  <NativeSelect
                    className="h-7 min-w-[140px]"
                    defaultValue={c.status || ""}
                    onChange={(e) =>
                      onFieldChange(c.id, "status", e.target.value)
                    }
                  >
                    {COMPANY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm">
                {c.next_action || "—"}
              </TableCell>
              <TableCell className="text-sm">{c.next_followup || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
