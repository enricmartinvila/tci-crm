"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/form-fields";
import { DEAL_STAGES, PRIORITIES } from "@/lib/constants";

export function DealsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${pending ? "opacity-70" : ""}`}
    >
      <Field label="Buscar">
        <Input
          defaultValue={searchParams.get("q") || ""}
          placeholder="Deal o empresa…"
          onBlur={(e) => update("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </Field>
      <Field label="Stage">
        <NativeSelect
          defaultValue={searchParams.get("stage") || ""}
          onChange={(e) => update("stage", e.target.value)}
        >
          <option value="">Todos</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Priority">
        <NativeSelect
          defaultValue={searchParams.get("priority") || ""}
          onChange={(e) => update("priority", e.target.value)}
        >
          <option value="">Todas</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Orden">
        <NativeSelect
          defaultValue={searchParams.get("sort") || "updated_desc"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="updated_desc">Recientes</option>
          <option value="name_asc">Nombre A–Z</option>
          <option value="name_desc">Nombre Z–A</option>
          <option value="priority_asc">Priority</option>
          <option value="value_desc">Value ↓</option>
          <option value="followup_asc">Follow-up ↑</option>
        </NativeSelect>
      </Field>
    </div>
  );
}
