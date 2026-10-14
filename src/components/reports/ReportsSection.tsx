"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Printer,
  Filter,
} from "lucide-react";

import { FarmRecord, HomeExpense, Lang, RentRecord } from "../../lib/types";
import { fmt } from "../../lib/utils";
import { exportCsvFile, generateCsvString } from "../../lib/csvExport";
import { printFinancialReport } from "../../lib/pdfExport";
import { FormCard } from "../common/UI";

interface ReportsSectionProps {
  home: HomeExpense[];
  rent: RentRecord[];
  farm: FarmRecord[];
  lang: Lang;
}

type ReportRange = "today" | "month" | "year" | "all";

export function ReportsSection({ home, rent, farm, lang }: ReportsSectionProps) {
  const isHi = lang === "hi";

  const [range, setRange] = useState<ReportRange>("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const currentYear = today.slice(0, 4);

  const isInRange = (date: string) => {
    if (!date) return false;
    if (range === "today") return date === today;
    if (range === "month") return date.startsWith(currentMonth);
    if (range === "year") return date.startsWith(currentYear);
    return true;
  };

  const homeFiltered = useMemo(() => {
    return home.filter((h) => isInRange(h.date));
  }, [home, range, today, currentMonth, currentYear]);

  const rentFiltered = useMemo(() => {
    return rent.filter((r) => {
      if (!isInRange(r.date)) return false;
      if (tenantFilter !== "all" && r.tenant !== tenantFilter) return false;
      return true;
    });
  }, [rent, range, tenantFilter, today, currentMonth, currentYear]);

  const farmFiltered = useMemo(() => {
    return farm.filter((f) => {
      if (!isInRange(f.date)) return false;
      if (cropFilter !== "all" && f.crop !== cropFilter) return false;
      return true;
    });
  }, [farm, range, cropFilter, today, currentMonth, currentYear]);

  const homeTotal = useMemo(
    () => homeFiltered.reduce((sum, h) => sum + Number(h.amount || 0), 0),
    [homeFiltered]
  );

  const rentReceived = useMemo(
    () =>
      rentFiltered
        .filter((r) => r.status === "Received")
        .reduce((sum, r) => sum + Number(r.total || 0), 0),
    [rentFiltered]
  );

  const rentPending = useMemo(
    () =>
      rentFiltered
        .filter((r) => r.status !== "Received")
        .reduce((sum, r) => sum + Number(r.remainingAmount || r.total || 0), 0),
    [rentFiltered]
  );

  const farmSale = useMemo(
    () =>
      farmFiltered
        .filter((f) => f.type === "Sale")
        .reduce((sum, f) => {
          const q = Number(f.quantity || 0);
          const p = Number(f.price || 0);
          return sum + (q * p > 0 ? q * p : Number(f.amount || 0));
        }, 0),
    [farmFiltered]
  );

  const farmExpense = useMemo(
    () =>
      farmFiltered
        .filter((f) => f.type === "Expense")
        .reduce((sum, f) => {
          const q = Number(f.quantity || 0);
          const p = Number(f.price || 0);
          return sum + (q * p > 0 ? q * p : Number(f.amount || 0));
        }, 0),
    [farmFiltered]
  );

  const farmProfit = farmSale - farmExpense;
  const totalIncome = rentReceived + farmSale;
  const totalExpense = homeTotal + farmExpense;
  const netBalance = totalIncome - totalExpense;

  const exportAllCSV = async () => {
    const isHindi = lang === "hi";
    const headers = isHindi
      ? ["प्रकार (Type)", "मद / फसल / किरायेदार", "तारीख", "राशि (₹)", "विवरण / स्थिति"]
      : ["Type", "Category / Item / Tenant", "Date", "Amount (INR)", "Status / Details"];

    const rows = [
      headers,
      ...homeFiltered.map((h) => [
        isHindi ? "घर का खर्च" : "Home Expense",
        h.category,
        h.date,
        h.amount,
        h.note || "",
      ]),
      ...rentFiltered.map((r) => [
        isHindi ? "किराया" : "Rent",
        r.tenant,
        r.date,
        r.total,
        `${r.month} (${r.status})`,
      ]),
      ...farmFiltered.map((f) => {
        const amt = Number(f.amount || 0) > 0 ? Number(f.amount) : Number(f.quantity || 0) * Number(f.price || 0);
        return [
          isHindi ? "खेती" : "Farm",
          `${f.crop} (${f.type})`,
          f.date,
          f.type === "Yield" ? `${f.quantity || 0} ${f.unit || ""}` : amt,
          f.note || f.expenseCategory || (f.buyerName ? `खरीदार: ${f.buyerName}` : "") || "",
        ];
      }),
    ];

    const csvString = generateCsvString(rows);
    await exportCsvFile({
      filename: `Smart-Khaata-Report-${today}.csv`,
      csvString,
      title: isHindi ? `स्मार्ट खाता रिपोर्ट (${today})` : `Smart Khaata Report (${today})`,
      lang,
    });
  };

  const handlePrint = () => {
    const rangeLabels: Record<ReportRange, string> = {
      all: isHi ? "सभी समय (All Time)" : "All Time",
      today: isHi ? "आज (Today)" : "Today",
      month: isHi ? "इस महीने (This Month)" : "This Month",
      year: isHi ? "इस वर्ष (This Year)" : "This Year",
    };

    const tableRows = [
      ...homeFiltered.map((h) => ({
        cells: [
          h.date,
          isHi ? "घर खर्च (Home)" : "Home Expense",
          `${h.category}${h.note ? ` • ${h.note}` : ""}`,
          `-${fmt(h.amount)}`,
        ],
      })),
      ...rentFiltered.map((r) => ({
        cells: [
          r.date,
          isHi ? "किराया (Rent)" : "Rent",
          `${r.tenant} • ${r.month} (${r.status})`,
          `+${fmt(r.total)}`,
        ],
      })),
      ...farmFiltered.map((f) => {
        const isSale = f.type === "Sale";
        const isYield = f.type === "Yield";
        const amt = Number(f.amount || 0) > 0 ? Number(f.amount) : Number(f.quantity || 0) * Number(f.price || 0);
        const amountDisplay = isYield
          ? `${f.quantity || 0} ${f.unit || "Qtl"}`
          : `${isSale ? "+" : "-"}${fmt(amt)}`;

        const typeDisplay = isHi
          ? `खेती - ${f.crop} (${isSale ? "बिक्री" : isYield ? "उपज" : "खर्च"})`
          : `Farm - ${f.crop} (${f.type})`;

        return {
          cells: [
            f.date,
            typeDisplay,
            f.expenseCategory || f.note || f.field || (f.buyerName ? `खरीदार: ${f.buyerName}` : "—"),
            amountDisplay,
          ],
        };
      }),
    ];

    printFinancialReport({
      title: isHi ? "स्मार्ट खाता - संयुक्त वित्तीय स्टेटमेंट" : "Smart Khaata - Financial Statement",
      subtitle: isHi ? "कृषि, किराया एवं घरेलू आय-व्यय बहीखाता रिपोर्ट" : "Combined accounts of farm, rentals & household",
      dateRangeText: rangeLabels[range],
      lang: lang === "hi" ? "hi" : "en",
      summaryCards: [
        { label: isHi ? "घर खर्च" : "Home Exp.", value: fmt(homeTotal), color: "#dc2626" },
        { label: isHi ? "प्राप्त किराया" : "Rent Received", value: fmt(rentReceived), color: "#2563eb" },
        { label: isHi ? "बकाया किराया" : "Rent Due", value: fmt(rentPending), color: "#d97706" },
        { label: isHi ? "खेती मुनाफा" : "Farm Profit", value: fmt(farmProfit), color: farmProfit >= 0 ? "#16a34a" : "#dc2626" },
        { label: isHi ? "कुल आय" : "Total Income", value: fmt(totalIncome), color: "#059669" },
        { label: isHi ? "शुद्ध बचत" : "Net Balance", value: fmt(netBalance), color: netBalance >= 0 ? "#16a34a" : "#dc2626" },
      ],
      tableHeaders: [
        isHi ? "तारीख (Date)" : "Date",
        isHi ? "खाता / प्रकार (Type)" : "Type",
        isHi ? "विवरण (Description)" : "Description",
        isHi ? "राशि (Amount)" : "Amount",
      ],
      tableRows,
      footerNotes: isHi
        ? "यह स्टेटमेंट Smart Khaata ऐप से जेनरेट किया गया है। डिजिटल रिकॉर्ड।"
        : "Generated automatically by Smart Khaata. Digital record.",
    });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-12 space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--sk-border)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)] flex items-center gap-2">
            <FileText className="text-purple-400" size={24} />
            {isHi ? "वित्तीय रिपोर्ट व स्टेटमेंट" : "Financial Statements & Reports"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi ? "घर, किराया और खेती का संयुक्त वित्तीय विवरण" : "Combined accounts of home, rentals and farm"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportAllCSV}
            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Download size={14} />
            {isHi ? "CSV डाउनलोड" : "Download CSV"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-[var(--sk-text)] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer hover:bg-white/5"
          >
            <Printer size={14} />
            {isHi ? "प्रिंट / PDF" : "Print / PDF"}
          </button>
        </div>
      </div>

      {/* TIMEFRAME FILTERS */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--sk-muted)] mr-1 flex items-center gap-1">
          <Filter size={13} /> {isHi ? "अवधि:" : "Range:"}
        </span>
        {[
          { id: "all", label: isHi ? "सभी (All Time)" : "All Time" },
          { id: "today", label: isHi ? "आज (Today)" : "Today" },
          { id: "month", label: isHi ? "इस महीने (This Month)" : "This Month" },
          { id: "year", label: isHi ? "इस वर्ष (This Year)" : "This Year" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRange(item.id as ReportRange)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              range === item.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-[var(--sk-card)] border border-[var(--sk-border)] text-[var(--sk-muted)] hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "घर का खर्च" : "Home Exp."}</div>
          <div className="text-base sm:text-lg font-bold font-mono text-red-400 mt-1">{fmt(homeTotal)}</div>
        </div>

        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "प्राप्त किराया" : "Rent In"}</div>
          <div className="text-base sm:text-lg font-bold font-mono text-blue-400 mt-1">{fmt(rentReceived)}</div>
        </div>

        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "बकाया किराया" : "Rent Due"}</div>
          <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-1">{fmt(rentPending)}</div>
        </div>

        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "खेती मुनाफा" : "Farm Profit"}</div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${farmProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(farmProfit)}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "कुल आय (Gross In)" : "Total Income"}</div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">{fmt(totalIncome)}</div>
        </div>

        <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3.5">
          <div className="text-[11px] text-[var(--sk-dim)]">{isHi ? "शुद्ध बचत (Balance)" : "Net Balance"}</div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(netBalance)}
          </div>
        </div>
      </div>

      {/* CONSOLIDATED LEDGER TABLE */}
      <FormCard>
        <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3 mb-3">
          <h3 className="font-bold text-sm text-[var(--sk-text)]">
            {isHi ? "विस्तृत खाता बही (Statement Ledger)" : "Statement Ledger"}
          </h3>
          <span className="text-xs text-[var(--sk-muted)]">
            {homeFiltered.length + rentFiltered.length + farmFiltered.length} records
          </span>
        </div>

        {/* MOBILE VIEW (md:hidden) */}
        <div className="space-y-2 block md:hidden">
          {/* Home items */}
          {homeFiltered.map((h) => (
            <div
              key={`mob-h-${h.id}`}
              className="p-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-sm shrink-0">
                  🏠
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--sk-text)] truncate">
                    {h.category}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5 truncate">
                    {h.date} {h.note ? `• ${h.note}` : ""}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-red-400 shrink-0">
                -{fmt(h.amount)}
              </div>
            </div>
          ))}

          {/* Rent items */}
          {rentFiltered.map((r) => (
            <div
              key={`mob-r-${r.id}`}
              className="p-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-sm shrink-0">
                  🏢
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--sk-text)] truncate">
                    {r.tenant}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5 truncate">
                    {r.date} • {r.month} ({r.status})
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-blue-400 shrink-0">
                +{fmt(r.total)}
              </div>
            </div>
          ))}

          {/* Farm items */}
          {farmFiltered.map((f) => {
            const isSale = f.type === "Sale";
            return (
              <div
                key={`mob-f-${f.id}`}
                className="p-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-sm shrink-0">
                    🌾
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--sk-text)] truncate flex items-center gap-1.5">
                      <span>{f.crop}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isSale ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {f.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--sk-muted)] mt-0.5 truncate">
                      {f.date} {f.expenseCategory ? `• ${f.expenseCategory}` : ""} {f.field ? `• ${f.field}` : ""}
                    </div>
                  </div>
                </div>
                <div className={`text-right font-mono font-bold shrink-0 ${isSale ? "text-emerald-400" : "text-red-400"}`}>
                  {isSale ? "+" : "-"}{fmt(f.amount)}
                </div>
              </div>
            );
          })}

          {homeFiltered.length + rentFiltered.length + farmFiltered.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--sk-dim)]">
              {isHi ? "इस अवधि में कोई रिकॉर्ड नहीं मिला" : "No records in this timeframe"}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-xs text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-[var(--sk-dim)]">
                <th className="py-2.5 px-3">{isHi ? "तारीख" : "Date"}</th>
                <th className="py-2.5 px-3">{isHi ? "खाता / प्रकार" : "Account / Type"}</th>
                <th className="py-2.5 px-3">{isHi ? "विवरण" : "Description"}</th>
                <th className="py-2.5 px-3 text-right">{isHi ? "जमा / निकासी (Amount)" : "Amount"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Home */}
              {homeFiltered.map((h) => (
                <tr key={`h-${h.id}`} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-mono">{h.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      🏠 {isHi ? "घर खर्च" : "Home"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{h.category} {h.note ? `• ${h.note}` : ""}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400">-{fmt(h.amount)}</td>
                </tr>
              ))}

              {/* Rent */}
              {rentFiltered.map((r) => (
                <tr key={`r-${r.id}`} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-mono">{r.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      🏢 {isHi ? "किराया" : "Rent"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{r.tenant} • {r.month} ({r.status})</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">+{fmt(r.total)}</td>
                </tr>
              ))}

              {/* Farm */}
              {farmFiltered.map((f) => (
                <tr key={`f-${f.id}`} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-mono">{f.date}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      f.type === "Sale"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      🌾 {f.crop} ({f.type})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{f.expenseCategory || f.note || f.field || "—"}</td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${f.type === "Sale" ? "text-green-400" : "text-red-400"}`}>
                    {f.type === "Sale" ? "+" : "-"}{fmt(f.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormCard>
    </div>
  );
}
