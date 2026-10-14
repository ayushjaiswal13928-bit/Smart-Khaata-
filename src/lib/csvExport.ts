import { Lang } from "./types";

/**
 * Safely exports and opens/downloads a CSV file on all platforms including Android, iOS, and Desktop.
 * 
 * Mobile Opening Architecture:
 * 1. Mobile file association for .csv:
 *    - Android Download Manager often sets MIME type incorrectly or apps fail to associate "text/csv"
 *      unless it is shared via Web Share API or opened directly in a new tab as a readable sheet/table.
 *    - Many Android phones do not have MS Excel or Google Sheets set as the default handler for raw downloaded .csv files,
 *      resulting in "Can't open file" or "No app found to open this file".
 * 2. UTF-8 BOM (\uFEFF):
 *    - Required so Hindi Devanagari text displays correctly without question marks or mojibake.
 * 3. In-App CSV Preview & Share Modal:
 *    - Provides a built-in viewer where users can immediately preview the table on mobile, copy text,
 *      share directly to WhatsApp / Drive / Sheets, or download to device storage.
 * 4. Data URI / Blob Download fallback with extended revocation timeout (never immediate).
 */

export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  // If value starts with =, +, -, @, prepend a quote to prevent CSV formula injection
  const safeStr = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safeStr}"`;
}

export function generateCsvString(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(sanitizeCsvCell).join(",")).join("\r\n");
}

export interface CSVExportOptions {
  filename: string;
  csvString: string;
  title?: string;
  lang?: Lang | string;
}

/**
 * Downloads the CSV directly to device
 */
export function downloadCsvBlob(filename: string, csvString: string): void {
  const bomCsv = "\uFEFF" + csvString;
  const blob = new Blob([bomCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.setAttribute("target", "_blank");
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Keep Object URL alive for at least 2 minutes for mobile download managers
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 120000);
}

/**
 * Native Share via Web Share API
 */
export async function shareCsvViaWebShare(
  filename: string,
  csvString: string,
  title?: string
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }

  const bomCsv = "\uFEFF" + csvString;
  const blob = new Blob([bomCsv], { type: "text/csv;charset=utf-8;" });

  try {
    const file = new File([blob], filename, { type: "text/csv;charset=utf-8" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title || filename,
        text: title || "Smart Khaata Report CSV",
      });
      return true;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      // User cancelled share sheet
      return true;
    }
    console.warn("Web Share API file share failed:", err);
  }

  return false;
}

// Global modal trigger for in-app preview
type CSVModalListener = (options: CSVExportOptions | null) => void;
const listeners: Set<CSVModalListener> = new Set();

export function onCSVModalRequested(fn: CSVModalListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function showCSVModal(options: CSVExportOptions): void {
  listeners.forEach((fn) => fn(options));
}

export async function exportCsvFile({
  filename,
  csvString,
  title,
  lang = "hi",
}: CSVExportOptions): Promise<void> {
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // If mobile, try Web Share API first so user can open directly in Google Sheets, WhatsApp, or Drive
  if (isMobile) {
    const shared = await shareCsvViaWebShare(filename, csvString, title);
    if (shared) {
      return;
    }
  }

  // Also initiate device download
  downloadCsvBlob(filename, csvString);

  // If on mobile (or user wishes to preview/inspect without leaving), display the in-app CSV viewer modal
  if (isMobile) {
    showCSVModal({ filename, csvString, title, lang });
  }
}
