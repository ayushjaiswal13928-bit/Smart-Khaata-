import React, { useState, useEffect } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Info,
} from "lucide-react";
import {
  CSVExportOptions,
  downloadCsvBlob,
  shareCsvViaWebShare,
  onCSVModalRequested,
} from "../../lib/csvExport";

export const CSVPreviewModal: React.FC = () => {
  const [data, setData] = useState<CSVExportOptions | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const unsub = onCSVModalRequested((options) => {
      setData(options);
    });
    return () => unsub();
  }, []);

  if (!data) return null;

  const isHi = data.lang !== "en";

  // Parse CSV string into rows & columns for mobile preview table
  const parseCSVRows = (raw: string): string[][] => {
    const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
    return lines.map((line) => {
      const row: string[] = [];
      let inQuotes = false;
      let current = "";
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      row.push(current);
      return row;
    });
  };

  const rows = parseCSVRows(data.csvString);
  const headers = rows.length > 0 ? rows[0] : [];
  const bodyRows = rows.slice(1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.csvString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    const success = await shareCsvViaWebShare(data.filename, data.csvString, data.title);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const handleDownload = () => {
    downloadCsvBlob(data.filename, data.csvString);
  };

  const handleOpenGoogleSheets = () => {
    // Open Google Sheets import URL or web spreadsheet
    window.open("https://docs.google.com/spreadsheets/u/0/", "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setData(null);
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--sk-border2)] bg-[var(--sk-card)] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--sk-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)] flex items-center gap-1.5">
                {data.title || data.filename}
              </h3>
              <p className="text-[11px] text-[var(--sk-muted)]">
                {data.filename} • {rows.length} {isHi ? "पंक्तियां" : "rows"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setData(null)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--sk-muted)] hover:bg-white/10 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* MOBILE NOTICE & EXPLANATION */}
        <div className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
          <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-300">
              {isHi
                ? "मोबाइल में CSV फाइल कैसे खोलें?"
                : "How to open CSV on mobile?"}
            </p>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              {isHi
                ? "1. नीचे 'Share (WhatsApp / Sheets)' दबाकर सीधे Google Sheets, Excel या WhatsApp में भेजें। 2. या नीचे स्क्रीन पर ही पूरी टेबल देखें और कॉपी करें।"
                : "1. Tap 'Share' below to open directly in Google Sheets, Excel or WhatsApp. 2. Or view the full table right here."}
            </p>
          </div>
        </div>

        {/* TABLE PREVIEW (SCROLLABLE ON MOBILE) */}
        <div className="flex-1 overflow-auto rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)] p-1">
          <div className="overflow-x-auto max-h-[42vh] sm:max-h-[48vh]">
            <table className="w-full text-left text-xs border-collapse">
              {headers.length > 0 && (
                <thead>
                  <tr className="bg-slate-800/80 sticky top-0 border-b border-slate-700">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="py-2 px-2.5 font-bold text-slate-200 whitespace-nowrap text-[11px]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-800/50 hover:bg-white/5 ${
                      rIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="py-1.5 px-2.5 text-slate-300 text-[11px] whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="pt-3 border-t border-[var(--sk-border)] mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
              >
                {shared ? <Check size={14} /> : <Share2 size={14} />}
                <span>{isHi ? "शेयर करें (Sheets / WhatsApp)" : "Share to Sheets / Apps"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-[var(--sk-card2)] hover:bg-white/10 border border-[var(--sk-border)] text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <Download size={14} />
              <span>{isHi ? "डाउनलोड करें" : "Download Again"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-[var(--sk-card2)] hover:bg-white/10 border border-[var(--sk-border)] text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              <span>{copied ? (isHi ? "कॉपी हो गया!" : "Copied!") : (isHi ? "टेक्स्ट कॉपी" : "Copy CSV")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setData(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition ml-auto"
          >
            {isHi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVPreviewModal;

