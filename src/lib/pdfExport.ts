/**
 * Utility to print clean, professional reports or download / print them on Mobile and Desktop.
 * 
 * In mobile browsers (especially Chrome/Safari in an iframe or Android WebView):
 * 1. window.print() inside an iframe can be blocked, blank, or fail to render background colors/fonts.
 * 2. This helper constructs a dedicated, clean, standalone print document with high-contrast formatting,
 *    Devenagari font support, currency formatting, clear table layouts, and automatic print trigger.
 * 3. It also provides print stylesheet support for the in-app view.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  dateRangeText?: string;
  generatedDate?: string;
  summaryCards?: {
    label: string;
    value: string;
    color?: string;
  }[];
  tableHeaders: string[];
  tableRows: {
    cells: (string | number)[];
    typeBadge?: {
      label: string;
      color: "red" | "green" | "blue" | "gray";
    };
  }[];
  footerNotes?: string;
  lang?: "hi" | "en";
}

/**
 * Directly renders any HTML element (such as #printable-farm-report) into a downloadable PDF
 * with high DPI (2x), crystal clear Devanagari Hindi text and numbers, proper A4 pagination.
 */
export async function exportElementToPdf(
  element: HTMLElement | null,
  filename: string = "bahi-khata-statement.pdf"
): Promise<void> {
  if (!element) {
    throw new Error("No report element found to export to PDF");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth || 1024,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const marginX = 8;
  const marginY = 8;
  const printableWidth = pageWidth - marginX * 2;
  const imgHeight = (canvas.height * printableWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = marginY;

  // First page
  pdf.addImage(imgData, "PNG", marginX, position, printableWidth, imgHeight, undefined, "FAST");
  heightLeft -= (pageHeight - marginY * 2);

  // Subsequent pages if statement is long
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + marginY;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", marginX, position, printableWidth, imgHeight, undefined, "FAST");
    heightLeft -= (pageHeight - marginY * 2);
  }

  const cleanName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(cleanName);
}

/**
 * Triggers clean, isolated native printing for any element via a dedicated sandbox iframe.
 */
export function printElement(element: HTMLElement | null): void {
  if (!element) {
    window.print();
    return;
  }

  try {
    let iframe = document.getElementById("sk-print-sandbox") as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }
    iframe = document.createElement("iframe");
    iframe.id = "sk-print-sandbox";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    iframe.style.opacity = "0.01";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <title>Smart Khaata Print</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 8mm 12mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", "Helvetica Neue", sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 12px;
      margin: 0;
      font-size: 10pt;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border-color: #cbd5e1;
    }
    tr, .summary-card, .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .print\\:hidden, .no-print {
      display: none !important;
    }
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 400);
      return;
    }
  } catch (e) {
    console.warn("Iframe sandbox print error, falling back to window.print", e);
  }

  window.print();
}

export function printFinancialReport(options: PrintReportOptions): void {
  const isHi = options.lang !== "en";
  const today = options.generatedDate || new Date().toLocaleDateString("hi-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const cardsHtml = options.summaryCards && options.summaryCards.length > 0
    ? `
    <div class="summary-grid">
      ${options.summaryCards
        .map(
          (c) => `
        <div class="summary-card">
          <div class="card-label">${escapeHtml(c.label)}</div>
          <div class="card-value" style="color: ${c.color || '#111827'}">${escapeHtml(c.value)}</div>
        </div>
      `
        )
        .join("")}
    </div>
    `
    : "";

  const rowsHtml = options.tableRows
    .map((r, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `
        <tr style="background-color: ${bg};">
          ${r.cells
            .map((cell, cellIdx) => {
              const align = cellIdx === r.cells.length - 1 ? 'text-align: right; font-weight: 700; font-family: monospace;' : '';
              return `<td style="${align}">${escapeHtml(String(cell))}</td>`;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  const printHtml = `<!DOCTYPE html>
<html lang="${isHi ? 'hi' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", "Helvetica Neue", sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header-bar {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 10pt;
      color: #475569;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
      font-size: 9pt;
      color: #64748b;
    }
    .report-meta strong {
      color: #0f172a;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .card-label {
      font-size: 8.5pt;
      color: #64748b;
      margin-bottom: 3px;
    }
    .card-value {
      font-size: 12pt;
      font-weight: 800;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-top: 8px;
      border: 1px solid #cbd5e1;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1.5px solid #cbd5e1;
      border-right: 1px solid #e2e8f0;
      font-size: 9pt;
    }
    th:last-child {
      text-align: right;
      border-right: none;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
    }
    td:last-child {
      border-right: none;
    }
    .footer-bar {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #64748b;
    }
    .no-print-toolbar {
      position: sticky;
      top: 0;
      background: #1e293b;
      color: #ffffff;
      padding: 10px 16px;
      margin: -16px -16px 16px -16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-close {
      background: #475569;
      margin-left: 8px;
    }
    @media print {
      .no-print-toolbar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div>
      <strong>${escapeHtml(options.title)}</strong>
      <span style="font-size: 11px; opacity: 0.8; margin-left: 8px;">(PDF / प्रिंट तैयार)</span>
    </div>
    <div>
      <button class="btn" onclick="window.print()">🖨️ ${isHi ? "प्रिंट / PDF सेव करें" : "Print / Save PDF"}</button>
      <button class="btn btn-close" onclick="window.close()">✕ ${isHi ? "बंद करें" : "Close"}</button>
    </div>
  </div>

  <div class="header-bar">
    <div>
      <h1 class="brand-title">🌾 स्मार्ट खाता (Smart Khaata)</h1>
      <div class="brand-subtitle">${escapeHtml(options.subtitle || "डिजिटल कृषि, किराया एवं घरेलू बहीखाता विवरण")}</div>
    </div>
    <div class="report-meta">
      <div>${isHi ? "तारीख:" : "Date:"} <strong>${today}</strong></div>
      ${options.dateRangeText ? `<div>${isHi ? "अवधि:" : "Period:"} <strong>${escapeHtml(options.dateRangeText)}</strong></div>` : ""}
    </div>
  </div>

  ${cardsHtml}

  <table>
    <thead>
      <tr>
        ${options.tableHeaders.map((h, idx) => `<th style="${idx === options.tableHeaders.length - 1 ? 'text-align: right;' : ''}">${escapeHtml(h)}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="${options.tableHeaders.length}" style="text-align: center; padding: 20px; color: #94a3b8;">${isHi ? "कोई रिकॉर्ड उपलब्ध नहीं है" : "No records available"}</td></tr>`}
    </tbody>
  </table>

  <div class="footer-bar">
    <div>${escapeHtml(options.footerNotes || "Smart Khaata द्वारा डिजिटल प्रमाणित रिपोर्ट")}</div>
    <div>Page 1 of 1</div>
  </div>

  <script>
    // Automatically trigger print on desktop & compatible mobile browsers
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {}
      }, 400);
    });
  </script>
</body>
</html>`;

  // Sandbox iframe print trigger
  try {
    let iframe = document.getElementById("sk-print-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }
    iframe = document.createElement("iframe");
    iframe.id = "sk-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    iframe.style.opacity = "0.01";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          window.print();
        }
      }, 450);
      return;
    }
  } catch (err) {
    console.warn("Failed iframe print fallback:", err);
  }

  // Fallback: Direct window.print()
  window.print();
}

export interface PrintableHtmlOptions {
  title: string;
  subtitle?: string;
  lang?: "hi" | "en";
  season?: string;
  summaryCards?: {
    label: string;
    value: string;
    color?: string;
  }[];
  tableHeaders: string[];
  tableRows: {
    cells: (string | number)[];
  }[];
  footerNotes?: string;
}

export function downloadPrintableHtml(options: PrintableHtmlOptions): void {
  const isHi = options.lang !== "en";
  const today = new Date().toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const cardsHtml = options.summaryCards && options.summaryCards.length > 0
    ? `
    <div class="summary-grid">
      ${options.summaryCards
        .map(
          (c) => `
        <div class="summary-card">
          <div class="card-label">${escapeHtml(c.label)}</div>
          <div class="card-value" style="color: ${c.color || '#111827'}">${escapeHtml(c.value)}</div>
        </div>
      `
        )
        .join("")}
    </div>
    `
    : "";

  const rowsHtml = options.tableRows
    .map((r, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `
        <tr style="background-color: ${bg};">
          ${r.cells
            .map((cell, cellIdx) => {
              const align = cellIdx === r.cells.length - 1 ? 'text-align: right; font-weight: 700; font-family: monospace;' : '';
              return `<td style="${align}">${escapeHtml(String(cell))}</td>`;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  const printHtml = `<!DOCTYPE html>
<html lang="${isHi ? 'hi' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", "Helvetica Neue", sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header-bar {
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18pt;
      font-weight: 800;
      color: #065f46;
      margin: 0;
    }
    .sub-title {
      font-size: 10pt;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 9pt;
      color: #475569;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
    }
    .card-label {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .card-value {
      font-size: 13pt;
      font-weight: 800;
      margin-top: 4px;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-top: 8px;
    }
    th {
      background: #065f46;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #065f46;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      font-size: 8.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h1 class="brand-title">🌾 ${escapeHtml(options.title)}</h1>
      ${options.subtitle ? `<div class="sub-title">${escapeHtml(options.subtitle)}</div>` : ''}
    </div>
    <div class="meta-box">
      <div><b>${isHi ? 'दिनांक' : 'Date'}:</b> ${today}</div>
      ${options.season ? `<div>${escapeHtml(options.season)}</div>` : ''}
    </div>
  </div>

  ${cardsHtml}

  <table>
    <thead>
      <tr>
        ${options.tableHeaders.map((h, i) => `<th style="${i === options.tableHeaders.length - 1 ? 'text-align: right;' : ''}">${escapeHtml(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>${escapeHtml(options.footerNotes || 'Generated by Smart Khaata')}</div>
    <div style="text-align: center; width: 140px; border-top: 1px solid #94a3b8; padding-top: 4px;">
      ${isHi ? 'हस्ताक्षर' : 'Authorized Signature'}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([printHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kisan-report-${today.replace(/[/\\?%*:|"<>]/g, "-")}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

