import { formatSigned } from "@/lib/format-signed";

export function formatAttributeMod(value: number) {
  return formatSigned(value);
}

export { formatSigned } from "@/lib/format-signed";

export function statModClass(delta: number): string | undefined {
  if (delta < 0) return "stat-penalized";
  if (delta > 0) return "stat-boosted";
  return undefined;
}
