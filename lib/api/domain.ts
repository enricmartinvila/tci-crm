export function extractDomain(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const withProto = /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`;
    const host = new URL(withProto).hostname.toLowerCase();
    return host.replace(/^www\./, "") || null;
  } catch {
    return (
      website
        .replace(/^https?:\/\//i, "")
        .split("/")[0]
        ?.toLowerCase()
        .replace(/^www\./, "") || null
    );
  }
}
