import {
  getActiveWorkspaceId,
  listUserWorkspaces,
} from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { WorkspacesSettings } from "@/components/settings/workspaces-settings";

export default async function WorkspacesSettingsPage() {
  const supabase = await createClient();
  const [workspaces, activeWorkspaceId] = await Promise.all([
    listUserWorkspaces(),
    getActiveWorkspaceId(),
  ]);

  const [{ data: apiKeys }, { data: rules }, { data: fields }, { data: stages }] =
    await Promise.all([
      supabase
        .from("api_keys")
        .select("id, name, key_prefix, active, last_used_at, created_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("workspace_rules")
        .select("id, key, content, sort_order")
        .eq("workspace_id", activeWorkspaceId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("workspace_field_defs")
        .select("id, entity, key, label, field_type, required")
        .eq("workspace_id", activeWorkspaceId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("pipeline_stages")
        .select("id, name, sort_order, is_closed")
        .eq("workspace_id", activeWorkspaceId)
        .order("sort_order", { ascending: true }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Settings · Workspaces
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Multi-workspace, API keys para ChatGPT/Claude/n8n, y reglas de contexto.
        </p>
      </div>
      <WorkspacesSettings
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        apiKeys={apiKeys || []}
        rules={rules || []}
        fields={fields || []}
        stages={stages || []}
      />
    </div>
  );
}
