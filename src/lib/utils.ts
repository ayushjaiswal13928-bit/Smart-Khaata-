export function fmt(value: number | string | undefined | null): string {
  const num = Number(value || 0);
  if (isNaN(num)) return "₹0";
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
  if (num < 0) {
    return `-₹${formatted}`;
  }
  return `₹${formatted}`;
}

export function fmtNum(value: number | string | undefined | null): string {
  const num = Number(value || 0);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return "";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}
