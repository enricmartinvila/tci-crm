"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateDealStage } from "@/lib/actions/crm";
import { DEAL_STAGES, normalizeDealStage } from "@/lib/constants";
import type { Deal, DealStage } from "@/lib/types";
import { PriorityBadge, StageBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/form-fields";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DealsViews({ deals }: { deals: Deal[] }) {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [pending, startTransition] = useTransition();

  function moveDeal(id: string, stage: DealStage) {
    startTransition(async () => {
      const result = await updateDealStage(id, stage);
      if (result.error) toast.error(result.error);
      else toast.success("Stage actualizado");
    });
  }

  return (
    <div className={`space-y-4 ${pending ? "opacity-80" : ""}`}>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "kanban" ? "default" : "outline"}
          onClick={() => setView("kanban")}
        >
          Kanban
        </Button>
        <Button
          size="sm"
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
        >
          Tabla
        </Button>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Next action</TableHead>
                <TableHead>Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    {d.companies ? (
                      <Link
                        href={`/companies/${d.companies.id}`}
                        className="hover:underline"
                      >
                        {d.companies.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <StageBadge stage={normalizeDealStage(d.stage)} />
                      <NativeSelect
                        className="h-10 min-w-[160px]"
                        defaultValue={normalizeDealStage(d.stage)}
                        onChange={(e) =>
                          moveDeal(d.id, e.target.value as DealStage)
                        }
                      >
                        {DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={d.priority} />
                  </TableCell>
                  <TableCell>
                    {d.value != null ? `${d.value} ${d.currency}` : "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {d.next_action || "—"}
                  </TableCell>
                  <TableCell>{d.next_followup || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const column = deals.filter(
              (d) => normalizeDealStage(d.stage) === stage
            );
            return (
              <div
                key={stage}
                className="flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/deal-id");
                  if (id) moveDeal(id, stage);
                }}
              >
                <div className="border-b px-3 py-2">
                  <p className="text-sm font-medium">{stage}</p>
                  <p className="text-xs text-muted-foreground">
                    {column.length}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2">
                  {column.map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/deal-id", d.id)
                      }
                      className="cursor-grab rounded-md border bg-background p-3 shadow-sm active:cursor-grabbing"
                    >
                      <p className="text-sm font-medium leading-snug">
                        {d.name}
                      </p>
                      {d.companies ? (
                        <Link
                          href={`/companies/${d.companies.id}`}
                          className="mt-1 block text-xs text-muted-foreground hover:underline"
                        >
                          {d.companies.name}
                        </Link>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <PriorityBadge priority={d.priority} />
                        {d.next_followup ? (
                          <span className="text-[11px] text-muted-foreground">
                            {d.next_followup}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
