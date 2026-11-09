import type { OccurrenceStatus } from "@/lib/schedule";

/** The label for a schedule state, or null for an ordinary scheduled occurrence. */
export function statusLabel(status: OccurrenceStatus, changedBoth = false): string | null {
  if (status === "cancelled") return "Cancelled";
  if (changedBoth) return "Time and meeting point changed";
  if (status === "changed-time") return "Time changed";
  if (status === "changed-location") return "New meeting point";
  return null;
}
