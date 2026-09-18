"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateDealStage } from "@/lib/actions/crm";
import { DEAL_STAGES, normalizeDealStage } from "@/lib/constants";
import type { Deal, DealStage } from "@/lib/types";
import { PriorityBadge, StageBadge } from "@/components/badges";
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
  const draggingIdRef = useRef<string | null>(null);
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

    void (async () => {
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
    })();
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => setView("kanban")}
          className={`min-h-10 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            view === "kanban"
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`min-h-10 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            view === "table"
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tabla
        </button>
      </div>

      {view === "table" ? (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {localDeals.map((d) => {
              const stage = normalizeDealStage(d.stage) as DealStage;
              return (
                <div
                  key={d.id}
                  className="space-y-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">{d.name}</p>
                    {d.companies ? (
                      <Link
                        href={`/companies/${d.companies.id}`}
                        className="mt-0.5 block text-sm text-muted-foreground hover:underline"
                      >
                        {d.companies.name}
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={d.priority} />
                    {d.value != null ? (
                      <span className="text-sm text-muted-foreground">
                        {d.value} {d.currency}
                      </span>
                    ) : null}
                    {d.next_followup ? (
                      <span className="text-sm text-muted-foreground">
                        Follow-up {d.next_followup}
                      </span>
                    ) : null}
                  </div>
                  {d.next_action ? (
                    <p className="text-sm text-muted-foreground">{d.next_action}</p>
                  ) : null}
                  <NativeSelect
                    className="h-11 w-full"
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
              );
            })}
            {localDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin deals</p>
            ) : null}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
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
        </>
      ) : (
        <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 sm:mx-0 sm:px-0">
          {DEAL_STAGES.map((stage) => {
            const column = localDeals.filter(
              (d) => normalizeDealStage(d.stage) === stage
            );
            return (
              <div
                key={stage}
                data-stage={stage}
                className="flex w-[min(85vw,18rem)] shrink-0 snap-center flex-col rounded-lg border bg-muted/30 transition-colors data-[drag-over=true]:border-brand data-[drag-over=true]:bg-brand/5 sm:w-64"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const el = e.currentTarget;
                  if (el.dataset.dragOver !== "true") {
                    el.dataset.dragOver = "true";
                  }
                }}
                onDragLeave={(e) => {
                  const el = e.currentTarget;
                  if (el.contains(e.relatedTarget as Node)) return;
                  el.dataset.dragOver = "false";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.dataset.dragOver = "false";
                  const id =
                    draggingIdRef.current ||
                    e.dataTransfer.getData("text/plain") ||
                    e.dataTransfer.getData("text/deal-id");
                  draggingIdRef.current = null;
                  if (id) moveDeal(id, stage);
                }}
              >
                <div className="sticky top-0 z-10 border-b border-border bg-muted/80 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {stage}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {column.length} deal{column.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
                  {column.map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={(e) => {
                        draggingIdRef.current = d.id;
                        e.dataTransfer.setData("text/plain", d.id);
                        e.dataTransfer.setData("text/deal-id", d.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.currentTarget.style.opacity = "0.4";
                      }}
                      onDragEnd={(e) => {
                        draggingIdRef.current = null;
                        e.currentTarget.style.opacity = "";
                        document
                          .querySelectorAll("[data-drag-over='true']")
                          .forEach((node) => {
                            (node as HTMLElement).dataset.dragOver = "false";
                          });
                      }}
                      className="cursor-grab rounded-md border bg-background p-3 shadow-sm active:cursor-grabbing"
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
                          onDragStart={(e) => e.preventDefault()}
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
                      {/* Touch-friendly stage change (DnD is weak on mobile) */}
                      <NativeSelect
                        className="mt-2 h-10 w-full text-sm md:hidden"
                        value={normalizeDealStage(d.stage)}
                        onChange={(e) =>
                          moveDeal(d.id, e.target.value as DealStage)
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </NativeSelect>
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
