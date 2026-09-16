"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { NotebookPen, Trash2 } from "lucide-react";
import { createActivity, deleteActivity } from "@/lib/actions/crm";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { Activity, Contact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field, NativeSelect } from "@/components/form-fields";
import { AddActivityDialog } from "@/components/add-activity-dialog";

function activityLabel(type: string) {
  return ACTIVITY_TYPES.find((t) => t.value === type)?.label || type;
}

function activityAccent(type: string) {
  switch (type) {
    case "meeting":
      return "bg-primary";
    case "note":
      return "bg-[#4cc9f0]";
    case "call":
      return "bg-[#f5c518]";
    case "follow_up":
      return "bg-[#2b4a9b]";
    case "reply":
      return "bg-emerald-500";
    default:
      return "bg-[#6b7799]";
  }
}

export function CompanyNotesTimeline({
  companyId,
  contacts,
  dealId,
  activities,
}: {
  companyId: string;
  contacts: Pick<Contact, "id" | "name">[];
  dealId?: string | null;
  activities: Activity[];
}) {
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
    toast.success("Nota guardada en la timeline");
    // reset form by clearing via native form - use form reset
    const form = document.getElementById(
      "company-note-form"
    ) as HTMLFormElement | null;
    form?.reset();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Borrar esta entrada de la timeline?")) return;
    const result = await deleteActivity(id, companyId);
    if (result.error) toast.error(result.error);
    else toast.success("Entrada eliminada");
  }

  return (
    <Card className="tci-panel">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <NotebookPen className="size-5 text-primary" />
            Notas y timeline
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Reuniones, llamadas y lo que va pasando con este sponsor.
          </p>
        </div>
        <AddActivityDialog
          companyId={companyId}
          contacts={contacts}
          dealId={dealId}
          label="Otra actividad"
          variant="outline"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          id="company-note-form"
          action={onSubmit}
          className="rounded-xl border border-border bg-muted/40 p-4"
        >
          <p className="mb-3 text-sm font-semibold text-foreground">Nueva nota</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <NativeSelect name="type" defaultValue="meeting" required>
                <option value="meeting">Reunión</option>
                <option value="note">Nota</option>
                <option value="call">Call</option>
                <option value="follow_up">Follow-up</option>
                <option value="reply">Reply</option>
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
            <Field label="Próximo follow-up (opcional)">
              <Input name="next_followup" type="date" />
            </Field>
            <Field label="Qué pasó / resumen" className="sm:col-span-2">
              <Textarea
                name="comment"
                rows={4}
                required
                placeholder="Ej: Reunión con partnerships. Interesados en YouTube bundle. Pedir media kit y volver el viernes…"
              />
            </Field>
          </div>
          <Button type="submit" disabled={pending} className="mt-3">
            {pending ? "Guardando…" : "Añadir a la timeline"}
          </Button>
        </form>

        {activities.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavía no hay entradas. Escribe la primera reunión o nota arriba.
          </p>
        ) : (
          <ol className="relative space-y-0 border-l border-border pl-6">
            {activities.map((a) => (
              <li key={a.id} className="relative pb-6 last:pb-0">
                <span
                  className={`absolute -left-[1.6rem] top-1.5 size-3 rounded-full ring-4 ring-background ${activityAccent(a.type)}`}
                />
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {activityLabel(a.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(a.happened_at), "dd MMM yyyy · HH:mm")}
                        </span>
                        {a.contacts?.name ? (
                          <span className="text-sm text-muted-foreground">
                            · {a.contacts.name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(a.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {a.comment ? (
                    <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground">
                      {a.comment}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Sin comentario
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
