"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { updateCompany } from "@/lib/actions/crm";
import type { Company } from "@/lib/types";
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

function boolVal(v: boolean | null | undefined) {
  if (v === true) return "true";
  if (v === false) return "false";
  return "";
}

export function EditCompanyDialog({ company }: { company: Company }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await updateCompany(company.id, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Empresa actualizada");
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" />
        Editar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar {company.name}</DialogTitle>
          </DialogHeader>
          <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <Input name="name" defaultValue={company.name} required />
            </Field>
          <Field label="Website">
            <Input name="website" defaultValue={company.website || ""} />
          </Field>
          <Field label="Category">
            <Input name="category" defaultValue={company.category || ""} />
          </Field>
          <Field label="Priority">
            <NativeSelect name="priority" defaultValue={company.priority || ""}>
              <option value="">—</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Status">
            <NativeSelect name="status" defaultValue={company.status || ""}>
              {COMPANY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {(
            [
              ["youtube_fit", "YouTube fit"],
              ["instagram_fit", "Instagram fit"],
              ["creator_spend", "Creator spend"],
              ["thematic_fit", "Thematic fit"],
              ["contactability", "Contactability"],
              ["score", "Score"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                name={key}
                type="number"
                step={key === "score" ? "0.1" : "1"}
                min={0}
                max={5}
                defaultValue={company[key] ?? ""}
              />
            </Field>
          ))}
          <Field label="Evidence" className="sm:col-span-2">
            <Textarea name="evidence" rows={2} defaultValue={company.evidence || ""} />
          </Field>
          <Field label="Comparable channels" className="sm:col-span-2">
            <Textarea
              name="comparable_channels"
              rows={2}
              defaultValue={company.comparable_channels || ""}
            />
          </Field>
          <Field label="Personalization hook" className="sm:col-span-2">
            <Textarea
              name="personalization_hook"
              rows={2}
              defaultValue={company.personalization_hook || ""}
            />
          </Field>
          <Field label="Exclusivity conflicts" className="sm:col-span-2">
            <Textarea
              name="exclusivity_conflicts"
              rows={2}
              defaultValue={company.exclusivity_conflicts || ""}
            />
          </Field>
          <Field label="Evidence URL">
            <Input name="evidence_url" defaultValue={company.evidence_url || ""} />
          </Field>
          <Field label="Evidence confidence">
            <Input
              name="evidence_confidence"
              defaultValue={company.evidence_confidence || ""}
            />
          </Field>
          <Field label="Primary outreach channel">
            <Input
              name="primary_outreach_channel"
              defaultValue={company.primary_outreach_channel || ""}
            />
          </Field>
          <Field label="Official creator form">
            <Input
              name="official_creator_form"
              defaultValue={company.official_creator_form || ""}
            />
          </Field>
          <Field label="Influencer email">
            <Input
              name="influencer_email"
              defaultValue={company.influencer_email || ""}
            />
          </Field>
          <Field label="Instagram DM suitable">
            <NativeSelect
              name="instagram_dm_suitable"
              defaultValue={boolVal(company.instagram_dm_suitable)}
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </Field>
          <Field label="Press kit required">
            <NativeSelect
              name="press_kit_required"
              defaultValue={boolVal(company.press_kit_required)}
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </Field>
          <Field label="Affiliate program">
            <NativeSelect
              name="affiliate_program"
              defaultValue={boolVal(company.affiliate_program)}
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </Field>
          <Field label="Paid sponsorship confirmed">
            <NativeSelect
              name="paid_sponsorship_confirmed"
              defaultValue={boolVal(company.paid_sponsorship_confirmed)}
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </Field>
          <Field label="Next action" className="sm:col-span-2">
            <Input name="next_action" defaultValue={company.next_action || ""} />
          </Field>
          <Field label="Last contact">
            <Input
              name="last_contact"
              type="date"
              defaultValue={company.last_contact || ""}
            />
          </Field>
          <Field label="Next follow-up">
            <Input
              name="next_followup"
              type="date"
              defaultValue={company.next_followup || ""}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea name="notes" rows={3} defaultValue={company.notes || ""} />
          </Field>
          <Button type="submit" disabled={pending} className="sm:col-span-2">
            {pending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
