"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/form-fields";

export function ContactsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div
      className={`grid gap-3 sm:grid-cols-3 ${pending ? "opacity-70" : ""}`}
    >
      <Field label="Buscar">
        <Input
          defaultValue={searchParams.get("q") || ""}
          placeholder="Nombre, email…"
          onBlur={(e) => update("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              update("q", (e.target as HTMLInputElement).value);
          }}
        />
      </Field>
      <Field label="Placeholders">
        <NativeSelect
          defaultValue={searchParams.get("placeholder") || "no"}
          onChange={(e) => update("placeholder", e.target.value)}
        >
          <option value="">Todos</option>
          <option value="no">Solo reales</option>
          <option value="yes">Solo placeholders</option>
        </NativeSelect>
      </Field>
      <Field label="Outreach">
        <NativeSelect
          defaultValue={searchParams.get("outreach") || ""}
          onChange={(e) => update("outreach", e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Not contacted">Not contacted</option>
          <option value="Research needed">Research needed</option>
          <option value="Contacted">Contacted</option>
          <option value="Waiting Reply">Waiting Reply</option>
        </NativeSelect>
      </Field>
    </div>
  );
}
