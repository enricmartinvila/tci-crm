"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  addWorkspaceRuleAction,
  createApiKeyAction,
  createWorkspaceAction,
  revokeApiKeyAction,
  switchWorkspaceAction,
} from "@/lib/actions/workspaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, NativeSelect } from "@/components/form-fields";
import { Badge } from "@/components/ui/badge";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  template: string;
  role: string;
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
};

type RuleRow = {
  id: string;
  key: string;
  content: string;
  sort_order: number;
};

type FieldRow = {
  id: string;
  entity: string;
  key: string;
  label: string;
  field_type: string;
  required: boolean;
};

type StageRow = {
  id: string;
  name: string;
  sort_order: number;
  is_closed: boolean;
};

export function WorkspacesSettings({
  workspaces,
  activeWorkspaceId,
  apiKeys,
  rules,
  fields,
  stages,
}: {
  workspaces: WorkspaceRow[];
  activeWorkspaceId: string;
  apiKeys: ApiKeyRow[];
  rules: RuleRow[];
  fields: FieldRow[];
  stages: StageRow[];
}) {
  const [pending, setPending] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function onCreateWorkspace(formData: FormData) {
    setPending(true);
    const result = await createWorkspaceAction(formData);
    setPending(false);
    if (result.error) toast.error(result.error);
    else toast.success("Workspace creado");
  }

  async function onSwitch(id: string) {
    await switchWorkspaceAction(id);
    toast.success("Workspace activo actualizado");
  }

  async function onCreateKey(formData: FormData) {
    setPending(true);
    formData.set("workspace_id", activeWorkspaceId);
    const result = await createApiKeyAction(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setNewKey(result.key);
    toast.success("API key creada — cópiala ahora");
  }

  async function onRevoke(id: string) {
    if (!confirm("¿Revocar esta API key?")) return;
    const result = await revokeApiKeyAction(id);
    if (result.error) toast.error(result.error);
    else toast.success("API key revocada");
  }

  async function onAddRule(formData: FormData) {
    formData.set("workspace_id", activeWorkspaceId);
    const result = await addWorkspaceRuleAction(formData);
    if (result.error) toast.error(result.error);
    else toast.success("Regla guardada");
  }

  return (
    <div className="space-y-6">
      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">Workspaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <p className="font-medium">
                  {ws.name}{" "}
                  {ws.id === activeWorkspaceId ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ws.slug} · {ws.template} · {ws.role}
                </p>
              </div>
              {ws.id !== activeWorkspaceId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSwitch(ws.id)}
                >
                  Usar
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">Crear workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onCreateWorkspace} className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <Input name="name" required placeholder="Mercura" />
            </Field>
            <Field label="Slug">
              <Input name="slug" required placeholder="mercura" />
            </Field>
            <Field label="Template">
              <NativeSelect name="template" defaultValue="sponsorship">
                <option value="sponsorship">Sponsorship CRM</option>
                <option value="sales">Sales CRM</option>
                <option value="generic">Generic CRM</option>
                <option value="personal">Personal CRM</option>
              </NativeSelect>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full">
                Crear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">API keys (workspace activo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {newKey ? (
            <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
              <p className="font-medium">Copia la key ahora (no se volverá a mostrar):</p>
              <code className="mt-2 block break-all text-xs">{newKey}</code>
            </div>
          ) : null}
          <form action={onCreateKey} className="flex flex-wrap gap-2">
            <Input
              name="name"
              placeholder="ChatGPT / Claude / n8n"
              className="min-w-[12rem] flex-1"
              required
            />
            <Button type="submit" disabled={pending}>
              Generar key
            </Button>
          </form>
          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin API keys</p>
            ) : (
              apiKeys.map((k) => (
                <div
                  key={k.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {k.name}{" "}
                      {!k.active ? (
                        <Badge variant="outline">Revocada</Badge>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground">
                      {k.key_prefix}… · creada{" "}
                      {new Date(k.created_at).toLocaleDateString("es-ES")}
                      {k.last_used_at
                        ? ` · último uso ${new Date(k.last_used_at).toLocaleString("es-ES")}`
                        : ""}
                    </p>
                  </div>
                  {k.active ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onRevoke(k.id)}
                    >
                      Revocar
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">Reglas del workspace (para /context)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {rules.map((r) => (
              <li key={r.id} className="rounded-lg border p-3">
                <p className="font-medium text-muted-foreground">{r.key}</p>
                <p>{r.content}</p>
              </li>
            ))}
            {rules.length === 0 ? (
              <p className="text-muted-foreground">Sin reglas todavía</p>
            ) : null}
          </ul>
          <form action={onAddRule} className="grid gap-2">
            <Field label="Key">
              <Input name="key" placeholder="email_signature" required />
            </Field>
            <Field label="Contenido">
              <Textarea name="content" required rows={2} />
            </Field>
            <Button type="submit">Añadir / actualizar regla</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">Field defs (catálogo API)</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin field defs</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {fields.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <span>
                    <span className="font-medium">{f.label}</span>{" "}
                    <span className="text-muted-foreground">
                      ({f.entity}.{f.key} · {f.field_type}
                      {f.required ? " · required" : ""})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="tci-panel">
        <CardHeader>
          <CardTitle className="text-base">Pipeline stages</CardTitle>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin stages</p>
          ) : (
            <ol className="flex flex-wrap gap-2 text-sm">
              {stages.map((s) => (
                <li key={s.id}>
                  <Badge variant={s.is_closed ? "outline" : "secondary"}>
                    {s.sort_order + 1}. {s.name}
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
