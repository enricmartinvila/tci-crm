"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createActivity } from "@/lib/actions/crm";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { Contact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, NativeSelect } from "@/components/form-fields";

export function AddActivityDialog({
  companyId,
  contacts,
  dealId,
  label = "Add activity",
  variant = "default",
}: {
  companyId: string;
  contacts: Pick<Contact, "id" | "name">[];
  dealId?: string | null;
  label?: string;
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    formData.set("company_id", companyId);
    if (dealId) formData.set("deal_id", dealId);
    const result = await createActivity(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Actividad registrada");
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        size="default"
        variant={variant}
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva actividad</DialogTitle>
          </DialogHeader>
          <form action={onSubmit} className="flex flex-col gap-3">
            <Field label="Tipo">
              <NativeSelect name="type" defaultValue="follow_up" required>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Fecha">
              <Input
                name="happened_at"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </Field>
            <Field label="Contacto (opcional)">
              <NativeSelect name="contact_id" defaultValue="">
                <option value="">—</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Comentario">
              <Textarea name="comment" rows={3} />
            </Field>
            <Field label="Próximo follow-up (opcional)">
              <Input name="next_followup" type="date" />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
