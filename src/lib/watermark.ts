/**
 * Central branding for document watermarks (PDF / image viewer).
 * Change this string once to update the repeated overlay app-wide.
 */
export const WATERMARK_BRAND = "chhattisgarh coaching institute";

/**
 * Viewer overlay line: institute brand + viewer display name (no email).
 */
export function buildWatermarkText(viewerDisplayName: string | null | undefined): string {
  const name = (viewerDisplayName ?? "Student").trim() || "Student";
  return `${WATERMARK_BRAND} · ${name}`;
}
