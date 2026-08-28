const ALLOWED_AON_HOSTS = new Set(["2e.aonsrd.com", "2e.aonprd.com"]);

/** Returns true for https URLs on approved Archives of Nethys hosts. */
export function isAllowedAonUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" && ALLOWED_AON_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/** Keeps allowed AoN URLs; drops invalid or disallowed values. */
export function sanitizeOptionalUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return isAllowedAonUrl(trimmed) ? trimmed : undefined;
}
