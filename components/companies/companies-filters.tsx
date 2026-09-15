"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/form-fields";
import { COMPANY_STATUSES, PRIORITIES } from "@/lib/constants";

export function CompaniesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
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
          placeholder="Nombre o categoría…"
          onChange={(e) => {
            const v = e.target.value;
            const t = setTimeout(() => update("q", v), 300);
            return () => clearTimeout(t);
          }}
          onBlur={(e) => update("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
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
      <Field label="Status">
        <NativeSelect
          defaultValue={searchParams.get("status") || ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">Todos</option>
          {COMPANY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Orden">
        <NativeSelect
          defaultValue={searchParams.get("sort") || "score_desc"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="score_desc">Score ↓</option>
          <option value="score_asc">Score ↑</option>
          <option value="name_asc">Nombre A–Z</option>
          <option value="name_desc">Nombre Z–A</option>
          <option value="priority_asc">Priority</option>
        </NativeSelect>
      </Field>
    </div>
  );
}
