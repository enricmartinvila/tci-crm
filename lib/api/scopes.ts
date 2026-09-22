export const API_SCOPES = [
  "companies:read",
  "companies:write",
  "contacts:read",
  "contacts:write",
  "deals:read",
  "deals:write",
  "activities:read",
  "activities:write",
  "followups:read",
  "followups:write",
] as const;

export type ApiScope = (typeof API_SCOPES)[number];

export const ALL_SCOPES: ApiScope[] = [...API_SCOPES];

export const TCI_WORKSPACE_ID = "a0000000-0000-4000-8000-000000000001";
export const ACTIVE_WORKSPACE_COOKIE = "tci_active_workspace";
