"use client";

import { useMemo } from "react";
import {
  Wallet,
  Home,
  Building2,
  Wheat,
  Clock3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  Camera,
  Plus,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { FarmRecord, HomeExpense, Lang, RentRecord } from "../../lib/types";
import { STRINGS } from "../../lib/i18n";
import { fmt } from "../../lib/utils";
import { FormCard, SectionHeader, StatusBadge } from "../common/UI";

interface DashboardSectionProps {
  home: HomeExpense[];
  rent: RentRecord[];
  farm: FarmRecord[];
  lang: Lang;
  onNavigateTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export function DashboardSection({
  home,
  rent,
  farm,
  lang,
  onNavigateTab,
  onOpenQuickAdd,
}: DashboardSectionProps) {
  const t = STRINGS[lang];
  const isHi = lang === "hi";

  const homeTotal = useMemo(
    () => home.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [home]
  );

  const rentTotal = useMemo(
    () =>
      rent
        .filter((r) => r.status === "Received")
        .reduce((sum, item) => sum + Number(item.total || 0), 0),
    [rent]
  );

  const getExpenseAmount = (record: FarmRecord) => {
    if (record.type !== "Expense") return 0;
    const quantity = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    const calculatedAmount = quantity * price;
    if (calculatedAmount > 0) return calculatedAmount;
    return Number(record.amount || 0);
  };

  const getSaleAmount = (record: FarmRecord) => {
    if (record.type !== "Sale") return 0;
    const quantity = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    const calculatedAmount = quantity * price;
    if (calculatedAmount > 0) return calculatedAmount;
    return Number(record.amount || 0);
  };

  const farmExpense = useMemo(
    () => farm.filter((r) => r.type === "Expense").reduce((sum, item) => sum + getExpenseAmount(item), 0),
    [farm]
  );

  const farmSale = useMemo(
    () => farm.filter((r) => r.type === "Sale").reduce((sum, item) => sum + getSaleAmount(item), 0),
    [farm]
  );

  const farmReceived = useMemo(
    () =>
      farm
        .filter((r) => r.type === "Sale")
        .reduce((sum, item) => sum + (item.paidAmount !== undefined ? Number(item.paidAmount) : getSaleAmount(item)), 0),
    [farm]
  );

  const farmPending = useMemo(
    () =>
      farm
        .filter((r) => r.type === "Sale")
        .reduce((sum, item) => sum + Math.max(0, Number(item.remainingAmount || 0)), 0),
    [farm]
  );

  const farmProfit = farmReceived - farmExpense;
  const netBalance = rentTotal + farmProfit - homeTotal;

  const pendingRent = useMemo(
    () => rent.filter((r) => r.status === "Pending" || r.status === "Partial"),
    [rent]
  );

  const pendingAmount = useMemo(
    () =>
      pendingRent.reduce((sum, r) => sum + Math.max(0, Number(r.remainingAmount || r.total || 0)), 0) +
      farmPending,
    [pendingRent, farmPending]
  );

  // Month stats
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const thisMonthIncome = useMemo(() => {
    const rentInc = rent
      .filter((r) => r.status === "Received" && r.date.startsWith(currentYearMonth))
      .reduce((sum, r) => sum + Number(r.total || 0), 0);
    const farmInc = farm
      .filter((r) => r.type === "Sale" && r.date.startsWith(currentYearMonth))
      .reduce((sum, r) => sum + (r.paidAmount !== undefined ? Number(r.paidAmount) : getSaleAmount(r)), 0);
    return rentInc + farmInc;
  }, [rent, farm, currentYearMonth]);

  const thisMonthExpense = useMemo(() => {
    const homeExp = home
      .filter((h) => h.date.startsWith(currentYearMonth))
      .reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const farmExp = farm
      .filter((f) => f.type === "Expense" && f.date.startsWith(currentYearMonth))
      .reduce((sum, f) => sum + getExpenseAmount(f), 0);
    return homeExp + farmExp;
  }, [home, farm, currentYearMonth]);

  // Recent combined transactions
  const recentItems = useMemo(() => {
    interface RecentItem {
      id: string;
      title: string;
      sub: string;
      date: string;
      amount: number;
      pending?: number;
      icon: string;
      type: string;
    }

    const list: RecentItem[] = [
      ...home.map((h) => ({
        id: `h-${h.id}`,
        title: h.category,
        sub: h.note || (isHi ? "घर खर्च" : "Home Expense"),
        date: h.date,
        amount: -Number(h.amount || 0),
        pending: 0,
        icon: "🏠",
        type: "home",
      })),
      ...rent.map((r) => ({
        id: `r-${r.id}`,
        title: r.tenant,
        sub: `${r.month} • ${r.status}`,
        date: r.date,
        amount: r.status === "Received" ? Number(r.total || 0) : 0,
        pending: r.status !== "Received" ? Number(r.remainingAmount || r.total || 0) : 0,
        icon: "🏢",
        type: "rent",
      })),
      ...farm.map((f) => {
        const isSale = f.type === "Sale";
        const isExp = f.type === "Expense";
        const amt = isSale
          ? f.paidAmount !== undefined
            ? Number(f.paidAmount)
            : getSaleAmount(f)
          : isExp
          ? -getExpenseAmount(f)
          : 0;
        const pending = isSale ? Number(f.remainingAmount || 0) : 0;

        return {
          id: `f-${f.id}`,
          title: f.crop,
          sub: isSale
            ? isHi
              ? `फसल बिक्री ${f.buyerName ? `• ${f.buyerName}` : ""}`
              : `Crop Sale ${f.buyerName ? `• ${f.buyerName}` : ""}`
            : isExp
            ? f.expenseCategory || (isHi ? "खेती खर्च" : "Farm Expense")
            : isHi
            ? "उत्पादन / पैदावार"
            : "Yield",
          date: f.date,
          amount: amt,
          pending,
          icon: "🌾",
          type: "farm",
        };
      }),
    ];

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [home, rent, farm, isHi]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-14 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)]">
            {isHi ? "स्मार्ट खाता डैशबोर्ड" : "Smart Khaata Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi ? "खेती, किराया और घर खर्च का वास्तविक हिसाब" : "Unified view of your farming, rentals and expenses"}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          {isHi ? "नया जोड़ें" : "Quick Add"}
        </button>
      </div>

      {/* HERO NET BALANCE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-green-500/30 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <Wallet size={16} />
              {isHi ? "कुल शुद्ध बैलेंस (Net Wallet Balance)" : "Net Available Balance"}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1.5 tracking-tight">
              {fmt(netBalance)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{isHi ? "इस महीने की आय:" : "This month income:"} <b className="text-green-400">{fmt(thisMonthIncome)}</b></span>
              <span>•</span>
              <span>{isHi ? "खर्च:" : "Expense:"} <b className="text-red-400">{fmt(thisMonthExpense)}</b></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab("ai")}
              className="px-3.5 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles size={14} />
              {isHi ? "AI सलाहकार से पूछें" : "Ask AI Advisor"}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("scan")}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Camera size={14} />
              {isHi ? "बिल / फसल स्कैन" : "Scan Photo"}
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 MAIN CATEGORY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigateTab("farm")}
          className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3 sm:p-4 shadow-sm hover:border-green-500/40 transition cursor-pointer group min-w-0 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)] truncate">{isHi ? "🌾 खेती मुनाफा" : "Farm Profit"}</span>
            <Wheat size={16} className="text-green-500 shrink-0" />
          </div>
          <div className={`mt-1.5 text-base sm:text-lg lg:text-xl font-bold font-mono truncate ${farmProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(farmProfit)}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[var(--sk-dim)] flex items-center justify-between truncate">
            <span className="truncate">बिक्री: {fmt(farmSale)}</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("rent")}
          className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3 sm:p-4 shadow-sm hover:border-blue-500/40 transition cursor-pointer group min-w-0 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)] truncate">{isHi ? "🏢 प्राप्त किराया" : "Rent Received"}</span>
            <Building2 size={16} className="text-blue-500 shrink-0" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-bold font-mono text-blue-400 truncate">
            {fmt(rentTotal)}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[var(--sk-dim)] flex items-center justify-between truncate">
            <span className="truncate">बाकी: {fmt(pendingAmount)}</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("home")}
          className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3 sm:p-4 shadow-sm hover:border-red-500/40 transition cursor-pointer group min-w-0 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)] truncate">{isHi ? "🏠 घर का खर्च" : "Home Expense"}</span>
            <Home size={16} className="text-red-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-bold font-mono text-red-400 truncate">
            {fmt(homeTotal)}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[var(--sk-dim)] flex items-center justify-between truncate">
            <span className="truncate">{home.length} एंट्रीज</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("reports")}
          className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-3 sm:p-4 shadow-sm hover:border-purple-500/40 transition cursor-pointer group min-w-0 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)] truncate">{isHi ? "⏳ बकाया किराया" : "Pending Rent"}</span>
            <Clock3 size={16} className="text-amber-400 shrink-0" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-bold font-mono text-amber-400 truncate">
            {fmt(pendingAmount)}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-[var(--sk-dim)] flex items-center justify-between truncate">
            <span className="truncate">{pendingRent.length} बाकी</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUTS ROW (MOBILE TOUCH SCROLLABLE) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => onNavigateTab("farm")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-green-500/40 text-xs font-semibold text-[var(--sk-text)] cursor-pointer"
        >
          🌾 {isHi ? "खेती हिसाब" : "Farm Ledger"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("partners")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-emerald-500/40 text-xs font-semibold text-emerald-300 cursor-pointer"
        >
          👥 {isHi ? "बटाईदार (Partners)" : "Partners (Batai)"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("stock")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-amber-500/40 text-xs font-semibold text-amber-300 cursor-pointer"
        >
          📦 {isHi ? "गोदाम स्टॉक" : "Crop Stock"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("rent")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-blue-500/40 text-xs font-semibold text-[var(--sk-text)] cursor-pointer"
        >
          🏢 {isHi ? "किराया व मीटर" : "Rent & Meter"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("home")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-red-500/40 text-xs font-semibold text-[var(--sk-text)] cursor-pointer"
        >
          🛒 {isHi ? "घर खर्च" : "Daily Expenses"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("reports")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-blue-500/40 text-xs font-semibold text-blue-300 cursor-pointer"
        >
          📊 {isHi ? "वित्तीय रिपोर्ट" : "Reports"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("ai")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold cursor-pointer"
        >
          🤖 {isHi ? "AI चैटबॉट" : "AI Advisor"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("scan")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold cursor-pointer"
        >
          📷 {isHi ? "फोटो स्कैनर" : "Photo Scanner"}
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("settings")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] hover:border-slate-500/40 text-xs font-semibold text-slate-300 cursor-pointer"
        >
          ⚙️ {isHi ? "सेटिंग्स" : "Settings"}
        </button>
      </div>

      {/* RECENT TRANSACTIONS + PENDING RENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT TRANSACTIONS */}
        <FormCard>
          <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3 mb-3">
            <h3 className="font-bold text-sm text-[var(--sk-text)]">
              {isHi ? "हाल के लेन-देन (Recent Activity)" : "Recent Activity"}
            </h3>
            <span className="text-xs text-[var(--sk-muted)]">{recentItems.length} items</span>
          </div>

          {recentItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--sk-dim)]">
              {isHi ? "अभी कोई लेन-देन नहीं है। नया रिकॉर्ड जोड़ें।" : "No transactions recorded yet."}
            </div>
          ) : (
            <div className="divide-y divide-white/5 space-y-2">
              {recentItems.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--sk-text)] truncate">{item.title}</div>
                      <div className="text-[11px] text-[var(--sk-muted)] truncate">{item.sub} • {item.date}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {item.amount !== 0 ? (
                      <span className={`font-bold font-mono ${item.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                        {item.amount > 0 ? "+" : ""}{fmt(item.amount)}
                      </span>
                    ) : item.pending ? (
                      <span className="font-bold font-mono text-amber-400">
                        {fmt(item.pending)} (बाकी)
                      </span>
                    ) : (
                      <span className="text-[var(--sk-dim)]">0</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormCard>

        {/* PENDING RENT REMINDERS */}
        <FormCard>
          <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3 mb-3">
            <h3 className="font-bold text-sm text-[var(--sk-text)] flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-400" />
              {isHi ? "बकाया किराया सूची (Pending Rent)" : "Pending Rent"}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("rent")}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              {isHi ? "सभी देखें" : "View All"}
            </button>
          </div>

          {pendingRent.length === 0 ? (
            <div className="py-8 text-center text-xs text-green-400 flex flex-col items-center gap-1.5">
              <span>✓ {isHi ? "शानदार! सभी किरायेदारों का किराया प्राप्त हो चुका है।" : "All rent payments are cleared!"}</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingRent.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--sk-text)]">{r.tenant}</div>
                    <div className="text-[11px] text-[var(--sk-muted)]">{r.month} • यूनिट: {r.units}</div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold font-mono text-amber-400">
                      {fmt(r.remainingAmount || r.total)}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormCard>
      </div>
    </div>
  );
}
