"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createContact, createDeal } from "@/lib/actions/crm";
import { DEAL_STAGES, PRIORITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, NativeSelect } from "@/components/form-fields";

export function CreateContactDialog({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    formData.set("company_id", companyId);
    const result = await createContact(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Contacto creado");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
        <Plus className="size-3.5" />
        Contacto
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo contacto</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre" className="sm:col-span-2">
            <Input name="name" required />
          </Field>
          <Field label="Rank">
            <Input name="contact_rank" type="number" min={1} />
          </Field>
          <Field label="Type">
            <Input name="contact_type" />
          </Field>
          <Field label="Job title">
            <Input name="job_title" />
          </Field>
          <Field label="Employer">
            <Input name="employer" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" />
          </Field>
          <Field label="LinkedIn">
            <Input name="linkedin_url" />
          </Field>
          <Field label="Outreach status" className="sm:col-span-2">
            <Input name="outreach_status" defaultValue="Not contacted" />
          </Field>
          <Field label="Why this contact" className="sm:col-span-2">
            <Textarea name="why_this_contact" rows={2} />
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
  );
}

export function CreateDealDialog({
  companyId,
  defaultName,
}: {
  companyId: string;
  defaultName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    formData.set("company_id", companyId);
    const result = await createDeal(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Deal creado");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
        <Plus className="size-3.5" />
        Deal
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo deal</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre" className="sm:col-span-2">
            <Input
              name="name"
              required
              defaultValue={defaultName || ""}
            />
          </Field>
          <Field label="Stage">
            <NativeSelect name="stage" defaultValue="Researching">
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Priority">
            <NativeSelect name="priority" defaultValue="">
              <option value="">—</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Value">
            <Input name="value" type="number" step="0.01" />
          </Field>
          <Field label="Currency">
            <Input name="currency" defaultValue="EUR" />
          </Field>
          <Field label="YouTube rate">
            <Input name="youtube_rate" type="number" step="0.01" />
          </Field>
          <Field label="Instagram rate">
            <Input name="instagram_rate" type="number" step="0.01" />
          </Field>
          <Field label="Bundle rate">
            <Input name="bundle_rate" type="number" step="0.01" />
          </Field>
          <Field label="Next follow-up">
            <Input name="next_followup" type="date" />
          </Field>
          <Field label="Next action" className="sm:col-span-2">
            <Input name="next_action" />
          </Field>
          <Field label="Exclusivity" className="sm:col-span-2">
            <Textarea name="exclusivity" rows={2} />
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
  );
}
