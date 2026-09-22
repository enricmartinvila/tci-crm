"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_WORKSPACE_COOKIE,
  TCI_WORKSPACE_ID,
} from "@/lib/api/scopes";

export async function getActiveWorkspaceId(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return TCI_WORKSPACE_ID;

  if (fromCookie) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("workspace_id", fromCookie)
      .maybeSingle();
    if (data?.workspace_id) return data.workspace_id;
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);

  return memberships?.[0]?.workspace_id || TCI_WORKSPACE_ID;
}

export async function setActiveWorkspaceId(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function listUserWorkspaces() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug, type, template)")
    .eq("user_id", user.id);

  return (memberships || []).map((m) => {
    const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces;
    return {
      id: m.workspace_id as string,
      role: m.role as string,
      name: ws?.name || "Workspace",
      slug: ws?.slug || "",
      type: ws?.type || "crm",
      template: ws?.template || "generic",
    };
  });
}
