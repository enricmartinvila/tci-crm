import { createServiceClient } from "@/lib/api/supabase";

export async function writeAuditLog(input: {
  workspaceId: string;
  actorType: "user" | "api" | "integration" | "assistant";
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("audit_logs").insert({
    workspace_id: input.workspaceId,
    actor_type: input.actorType,
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    previous_value: input.previousValue ?? null,
    new_value: input.newValue ?? null,
  });
  if (error) console.error("audit_log failed", error.message);
}
