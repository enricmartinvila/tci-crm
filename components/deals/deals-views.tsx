"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
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
  const [localDeals, setLocalDeals] = useState(deals);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DealStage | null>(null);
  const [, startTransition] = useTransition();
  const pendingIds = useRef(new Set<string>());
  const rollbackStages = useRef(new Map<string, DealStage>());

  useEffect(() => {
    setLocalDeals((prev) => {
      if (pendingIds.current.size === 0) return deals;
      return deals.map((serverDeal) => {
        if (!pendingIds.current.has(serverDeal.id)) return serverDeal;
        const local = prev.find((d) => d.id === serverDeal.id);
        return local ?? serverDeal;
      });
    });
  }, [deals]);

  function moveDeal(id: string, stage: DealStage) {
    const current = localDeals.find((d) => d.id === id);
    if (!current) return;
    const fromStage = normalizeDealStage(current.stage) as DealStage;
    if (fromStage === stage) return;

    rollbackStages.current.set(id, fromStage);
    pendingIds.current.add(id);
    setLocalDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage } : d))
    );
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      const result = await updateDealStage(id, stage);
      pendingIds.current.delete(id);
      if (result.error) {
        const restore = rollbackStages.current.get(id) ?? fromStage;
        setLocalDeals((prev) =>
          prev.map((d) => (d.id === id ? { ...d, stage: restore } : d))
        );
        toast.error(result.error);
      }
      rollbackStages.current.delete(id);
    });
  }

  return (
    <div className="space-y-4">
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
              {localDeals.map((d) => {
                const stage = normalizeDealStage(d.stage) as DealStage;
                return (
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
                        <StageBadge stage={stage} />
                        <NativeSelect
                          className="h-10 min-w-[160px]"
                          value={stage}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const column = localDeals.filter(
              (d) => normalizeDealStage(d.stage) === stage
            );
            const isTarget = dropTarget === stage;
            return (
              <div
                key={stage}
                className={`flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
                  isTarget ? "border-primary bg-primary/5" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropTarget !== stage) setDropTarget(stage);
                }}
                onDragLeave={() => {
                  if (dropTarget === stage) setDropTarget(null);
                }}
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
                <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
                  {column.map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/deal-id", d.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(d.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      className={`cursor-grab rounded-md border bg-background p-3 shadow-sm transition-opacity active:cursor-grabbing ${
                        draggingId === d.id ? "opacity-40" : ""
                      }`}
                    >
                      <p className="text-sm font-medium leading-snug">
                        {d.name}
                      </p>
                      {d.companies ? (
                        <Link
                          href={`/companies/${d.companies.id}`}
                          className="mt-1 block text-xs text-muted-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          draggable={false}
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
