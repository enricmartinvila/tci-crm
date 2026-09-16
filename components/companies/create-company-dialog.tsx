"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createCompany } from "@/lib/actions/crm";
import { COMPANY_STATUSES, PRIORITIES } from "@/lib/constants";
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

export function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await createCompany(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Empresa creada");
    setOpen(false);
  }

  return (
    <>
      <Button type="button" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nueva empresa
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva empresa</DialogTitle>
          </DialogHeader>
          <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <Input name="name" required />
            </Field>
          <Field label="Website">
            <Input name="website" type="url" placeholder="https://" />
          </Field>
          <Field label="Category">
            <Input name="category" />
          </Field>
          <Field label="Priority">
            <NativeSelect name="priority" defaultValue="B">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Status">
            <NativeSelect name="status" defaultValue="Researching">
              {COMPANY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="YouTube fit">
            <Input name="youtube_fit" type="number" min={1} max={5} />
          </Field>
          <Field label="Instagram fit">
            <Input name="instagram_fit" type="number" min={1} max={5} />
          </Field>
          <Field label="Creator spend">
            <Input name="creator_spend" type="number" min={1} max={5} />
          </Field>
          <Field label="Thematic fit">
            <Input name="thematic_fit" type="number" min={1} max={5} />
          </Field>
          <Field label="Score">
            <Input name="score" type="number" step="0.1" min={0} max={5} />
          </Field>
          <Field label="Next action" className="sm:col-span-2">
            <Input name="next_action" />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea name="notes" rows={2} />
          </Field>
          <Button type="submit" disabled={pending} className="sm:col-span-2">
            {pending ? "Guardando…" : "Crear"}
          </Button>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
