/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wheat,
  Building2,
  Home,
  Bot,
  Camera,
  FileText,
  Languages,
  Sun,
  Moon,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Receipt,
  CheckCircle,
  Menu,
  Compass,
  ChevronRight,
  Users,
  Boxes,
  Settings as SettingsIcon,
} from "lucide-react";

import { Lang, FarmRecord, HomeExpense, RentRecord, Partner, PartnerCashEntry } from "./lib/types";
import { STRINGS } from "./lib/i18n";
import { DashboardSection } from "./components/dashboard/DashboardSection";
import { FarmSection } from "./components/farm/FarmSection";
import { RentSection } from "./components/rent/RentSection";
import { HomeSection } from "./components/home/HomeSection";
import { PartnershipSection } from "./components/farm/PartnershipSection";
import { StockSection } from "./components/stock/StockSection";
import { SettingsSection } from "./components/settings/SettingsSection";
import { AiChatbotSection } from "./components/chat/AiChatbotSection";
import { ImageScannerSection } from "./components/scanner/ImageScannerSection";
import { ReportsSection } from "./components/reports/ReportsSection";
import { PWAInstallButton } from "./components/common/PWAInstallButton";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
import { CSVPreviewModal } from "./components/common/CSVPreviewModal";
import { LandSettingsModal } from "./components/farm/LandSettingsModal";

const SAMPLE_PARTNERS: Partner[] = [
  {
    id: "p-1",
    name: "दिनेश गुर्जर",
    phone: "9826112233",
    relationship: "batai_50_50",
    sharePercent: 50,
    khetName: "बड़ा चक (उत्तर खेत)",
    crop: "Wheat",
    season: "रबी 2025-26",
    startDate: "2025-11-01",
    notes: "50-50 बटाई साझेदारी, जुताई व कटाई आधी-आधी",
  },
  {
    id: "p-2",
    name: "मुकेश धाकड़",
    phone: "9425098765",
    relationship: "batai_custom",
    sharePercent: 33.33,
    khetName: "नहर वाला चक",
    crop: "Garlic",
    season: "रबी 2025-26",
    startDate: "2025-10-15",
    notes: "तिहाई (1/3) बटाईदार",
  },
];

const SAMPLE_PARTNER_CASH: PartnerCashEntry[] = [
  {
    id: "pc-1",
    partnerId: "p-1",
    date: "2026-01-15",
    type: "gave_to_partner",
    amount: 10000,
    mode: "cash",
    note: "खाद व यूरिया के लिए नकद अग्रिम दिया",
  },
];

const SAMPLE_FARM_RECORDS: FarmRecord[] = [
  {
    id: "f-1",
    date: "2026-10-02",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "बीज",
    amount: 3200,
    quantity: 80,
    unit: "Kg",
    price: 40,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    worker: "राम अवतार (बीज भंडार)",
    note: "HD 2967 प्रमाणित उन्नत गेहूं बीज",
  },
  {
    id: "f-2",
    date: "2026-10-03",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "डीजल",
    amount: 3200,
    quantity: 4,
    unit: "घंटे (Hours)",
    price: 800,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    worker: "दिनेश (ट्रैक्टर चालक)",
    machine: "महिंद्रा 575 ट्रैक्टर",
    note: "गहरी जुताई व पाटा लगाना",
  },
  {
    id: "f-3",
    date: "2026-10-04",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "खाद",
    amount: 5400,
    quantity: 4,
    unit: "बोरी (Bags)",
    price: 1350,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    note: "DAP खाद 2 बोरी व पोटाश 2 बोरी",
  },
  {
    id: "f-4",
    date: "2026-10-05",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "मजदूरी",
    amount: 1600,
    quantity: 4,
    unit: "दिन (Days)",
    price: 400,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    worker: "सुरेश व 3 मजदूर",
    note: "खाद छिड़काव व क्यारी निर्माण",
  },
  {
    id: "f-5",
    date: "2026-10-06",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "सिंचाई",
    amount: 1200,
    quantity: 6,
    unit: "घंटे (Hours)",
    price: 200,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    note: "पहली पलेवा सिंचाई (ट्यूबवेल)",
  },
  {
    id: "f-6",
    date: "2026-10-07",
    type: "Expense",
    crop: "Wheat",
    expenseCategory: "दवाई",
    amount: 950,
    quantity: 1,
    unit: "लीटर (Liters)",
    price: 950,
    field: "खेत 1 (बड़ा खेत)",
    area: 4,
    areaUnit: "बीघा",
    note: "दीमक व खरपतवार नाशक स्प्रे",
  },
  {
    id: "f-7",
    date: "2026-10-08",
    type: "Yield",
    crop: "Soybean",
    amount: 0,
    quantity: 25,
    unit: "Quintal",
    price: 4400,
    field: "खेत 2 (सड़क वाला)",
    area: 3,
    areaUnit: "बीघा",
    note: "कुल कटाई व थ्रेशिंग पैदावार 25 क्विंटल",
  },
  {
    id: "f-8",
    date: "2026-10-09",
    type: "Sale",
    crop: "Soybean",
    amount: 88000,
    quantity: 20,
    unit: "Quintal",
    price: 4400,
    ratePerQuintal: 4400,
    paidAmount: 70000,
    remainingAmount: 18000,
    paymentStatus: "Partial",
    buyerName: "जय किसान ट्रेडर्स (मंडी)",
    field: "खेत 2 (सड़क वाला)",
    area: 3,
    areaUnit: "बीघा",
    note: "20 क्विंटल @ ₹4400 भाव, ₹70,000 नकद मिला व ₹18,000 बाकी",
  },
];

const SAMPLE_RENT_RECORDS: RentRecord[] = [
  {
    id: "r-1",
    date: "2026-10-01",
    tenant: "सुरेश वर्मा (दुकान 1)",
    month: "Oct 2026",
    whatsapp: "9876543210",
    amount: 7500,
    prevReading: 1240,
    currentReading: 1395,
    ratePerUnit: 8.5,
    units: 155,
    lightBill: 1317.5,
    total: 8817.5,
    paidAmount: 8817.5,
    remainingAmount: 0,
    status: "Received",
    note: "दुकान किराया + बिजली बिल",
  },
  {
    id: "r-2",
    date: "2026-10-01",
    tenant: "रोहित सिंह (कमरा 2)",
    month: "Oct 2026",
    whatsapp: "9823456789",
    amount: 5000,
    prevReading: 820,
    currentReading: 890,
    ratePerUnit: 8,
    units: 70,
    lightBill: 560,
    total: 5560,
    paidAmount: 0,
    remainingAmount: 5560,
    status: "Pending",
    note: "प्रथम तल कमरा",
  },
];

const SAMPLE_HOME_EXPENSES: HomeExpense[] = [
  {
    id: "h-1",
    date: "2026-10-08",
    category: "grocery",
    amount: 2450,
    note: "आटा, तेल, दाल व राशन का सामान",
  },
  {
    id: "h-2",
    date: "2026-10-07",
    category: "bills",
    amount: 1820,
    note: "घरेलू बिजली बिल भुगतान",
  },
  {
    id: "h-3",
    date: "2026-10-05",
    category: "transport",
    amount: 600,
    note: "बाइक पेट्रोल",
  },
];

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sk-lang") as Lang) || "hi";
    }
    return "hi";
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sk-theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "farm" | "rent" | "home" | "partners" | "stock" | "settings" | "ai" | "scan" | "reports"
  >("dashboard");

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLandModal, setShowLandModal] = useState(false);
  const isSecondaryActive =
    activeTab === "ai" ||
    activeTab === "scan" ||
    activeTab === "reports" ||
    activeTab === "partners" ||
    activeTab === "stock" ||
    activeTab === "settings";

  // State with LocalStorage
  const [farmRecords, setFarmRecords] = useState<FarmRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk-farm-records");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return SAMPLE_FARM_RECORDS;
  });

  const [rentRecords, setRentRecords] = useState<RentRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk-rent-records");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return SAMPLE_RENT_RECORDS;
  });

  const [homeExpenses, setHomeExpenses] = useState<HomeExpense[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk-home-expenses");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return SAMPLE_HOME_EXPENSES;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk-partners");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return SAMPLE_PARTNERS;
  });

  const [partnerCash, setPartnerCash] = useState<PartnerCashEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk-partner-cash");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return SAMPLE_PARTNER_CASH;
  });

  // Quick Add Modal
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"farm" | "rent" | "home">("farm");

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("sk-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("sk-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sk-farm-records", JSON.stringify(farmRecords));
  }, [farmRecords]);

  useEffect(() => {
    localStorage.setItem("sk-rent-records", JSON.stringify(rentRecords));
  }, [rentRecords]);

  useEffect(() => {
    localStorage.setItem("sk-home-expenses", JSON.stringify(homeExpenses));
  }, [homeExpenses]);

  useEffect(() => {
    localStorage.setItem("sk-partners", JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem("sk-partner-cash", JSON.stringify(partnerCash));
  }, [partnerCash]);

  const toggleLang = () => {
    setLang((prev) => (prev === "hi" ? "en" : "hi"));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const t = STRINGS[lang];
  const isHi = lang === "hi";

  const navItems = [
    { id: "dashboard", label: isHi ? "डैशबोर्ड" : "Dashboard", icon: LayoutDashboard },
    { id: "farm", label: isHi ? "खेती (Khet)" : "Farm", icon: Wheat },
    { id: "rent", label: isHi ? "किराया" : "Rent", icon: Building2 },
    { id: "home", label: isHi ? "घर खर्च" : "Home Exp", icon: Home },
    { id: "partners", label: isHi ? "बटाईदार" : "Partners", icon: Users },
    { id: "stock", label: isHi ? "स्टॉक" : "Stock", icon: Boxes },
    { id: "reports", label: isHi ? "रिपोर्ट्स" : "Reports", icon: FileText },
    { id: "settings", label: isHi ? "सेटिंग्स" : "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* TOP APP HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--sk-bg)]/90 border-b border-[var(--sk-border)] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* BRAND LOGO */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-green-600/20 group-hover:scale-105 transition shrink-0">
            <img
              src="/icon-192.png"
              alt="Smart Khaata"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--sk-text)]">
                {isHi ? "स्मार्ट खाता" : "Smart Khaata"}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-green-500/15 text-green-400 border border-green-500/25">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-[var(--sk-dim)] hidden sm:block">
              {isHi ? "खेती, मकान किराया व घरेलू हिसाब" : "Farming, Rentals & Household Accounts"}
            </p>
          </div>
        </div>

        {/* DESKTOP NAV TABS */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--sk-card2)] p-1 rounded-2xl border border-[var(--sk-border)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: INSTALL, QUICK ADD, LANG, THEME */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton lang={lang} variant="header" />

          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-xs shadow-md hover:from-green-500 hover:to-emerald-500 transition cursor-pointer active:scale-95 shrink-0"
            title={isHi ? "नया रिकॉर्ड जोड़ें" : "Quick Add Entry"}
          >
            <Plus size={15} />
            <span className="hidden sm:inline ml-1">{isHi ? "नया जोड़ें" : "Quick Add"}</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:bg-white/5 text-xs font-semibold text-[var(--sk-text)] transition flex items-center gap-1 cursor-pointer shrink-0"
            title={isHi ? "Switch to English" : "हिन्दी में बदलें"}
          >
            <Languages size={13} className="text-green-400" />
            <span className="text-[11px] sm:text-xs">{isHi ? "EN" : "हिन्दी"}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:bg-white/5 text-[var(--sk-muted)] hover:text-[var(--sk-text)] transition cursor-pointer shrink-0"
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 pt-4 pb-20 md:pb-8">
        {activeTab === "dashboard" && (
          <>
            <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 mb-4">
              <PWAInstallButton lang={lang} variant="banner" />
            </div>
            <DashboardSection
              home={homeExpenses}
              rent={rentRecords}
              farm={farmRecords}
              lang={lang}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenQuickAdd={() => setShowQuickAdd(true)}
            />
          </>
        )}

        {activeTab === "farm" && (
          <FarmSection
            records={farmRecords}
            setRecords={setFarmRecords}
            lang={lang}
            partners={partners}
            setPartners={setPartners}
            partnerCash={partnerCash}
            setPartnerCash={setPartnerCash}
          />
        )}

        {activeTab === "rent" && (
          <RentSection
            records={rentRecords}
            setRecords={setRentRecords}
            lang={lang}
          />
        )}

        {activeTab === "home" && (
          <HomeSection
            records={homeExpenses}
            setRecords={setHomeExpenses}
            lang={lang}
          />
        )}

        {activeTab === "partners" && (
          <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6">
            <PartnershipSection
              lang={lang}
              partners={partners}
              setPartners={setPartners}
              partnerCash={partnerCash}
              setPartnerCash={setPartnerCash}
              farmRecords={farmRecords}
            />
          </div>
        )}

        {activeTab === "stock" && (
          <StockSection
            lang={lang}
            onNavigateToSale={() => {
              setActiveTab("farm");
            }}
          />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            lang={lang}
            toggleLang={toggleLang}
            theme={theme}
            toggleTheme={toggleTheme}
            farmRecords={farmRecords}
            setFarmRecords={setFarmRecords}
            rentRecords={rentRecords}
            setRentRecords={setRentRecords}
            homeExpenses={homeExpenses}
            setHomeExpenses={setHomeExpenses}
          />
        )}

        {activeTab === "ai" && (
          <AiChatbotSection
            lang={lang}
            onNavigateToScan={() => setActiveTab("scan")}
          />
        )}

        {activeTab === "scan" && (
          <ImageScannerSection
            lang={lang}
            onAddFarmRecord={(partial) => {
              const newRec: FarmRecord = {
                id: `f-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                type: partial.type || "Expense",
                crop: partial.crop || "Wheat",
                expenseCategory: partial.expenseCategory || "खाद",
                amount: partial.amount || 1500,
                note: partial.note || "Scanned expense",
              };
              setFarmRecords((prev) => [newRec, ...prev]);
              setActiveTab("farm");
            }}
            onAddHomeExpense={(partial) => {
              const newExp: HomeExpense = {
                id: `h-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                category: partial.category || "grocery",
                amount: partial.amount || 500,
                note: partial.note || "Scanned expense",
              };
              setHomeExpenses((prev) => [newExp, ...prev]);
              setActiveTab("home");
            }}
            onNavigateToChat={() => {
              setActiveTab("ai");
            }}
          />
        )}

        {activeTab === "reports" && (
          <ReportsSection
            home={homeExpenses}
            rent={rentRecords}
            farm={farmRecords}
            lang={lang}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK (5-tab balanced layout) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sk-card)]/95 backdrop-blur-lg border-t border-[var(--sk-border)] px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] grid grid-cols-5 items-center shadow-2xl">
        {[
          { id: "dashboard", label: isHi ? "डैशबोर्ड" : "Home", icon: LayoutDashboard },
          { id: "farm", label: isHi ? "खेती" : "Farm", icon: Wheat },
          { id: "rent", label: isHi ? "किराया" : "Rent", icon: Building2 },
          { id: "home", label: isHi ? "घर खर्च" : "Home", icon: Home },
          {
            id: "more",
            label: isSecondaryActive
              ? activeTab === "ai"
                ? isHi ? "AI चैट" : "AI"
                : activeTab === "scan"
                ? isHi ? "स्कैनर" : "Scan"
                : activeTab === "reports"
                ? isHi ? "रिपोर्ट" : "Reports"
                : activeTab === "partners"
                ? isHi ? "बटाईदार" : "Partners"
                : activeTab === "stock"
                ? isHi ? "स्टॉक" : "Stock"
                : isHi ? "सेटिंग्स" : "Settings"
              : isHi ? "मेन्यू" : "Menu",
            icon: isSecondaryActive
              ? activeTab === "ai"
                ? Bot
                : activeTab === "scan"
                ? Camera
                : activeTab === "reports"
                ? FileText
                : activeTab === "partners"
                ? Users
                : activeTab === "stock"
                ? Boxes
                : SettingsIcon
              : Menu,
            isMore: true,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.isMore ? isSecondaryActive : activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isMore) {
                  setShowMoreMenu(true);
                } else {
                  setActiveTab(item.id as any);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer active:scale-95 ${
                active
                  ? "text-emerald-400 font-bold"
                  : "text-[var(--sk-dim)] hover:text-white"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  active ? "bg-emerald-500/20 text-emerald-400" : ""
                }`}
              >
                <Icon size={19} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE MORE MENU SHEET */}
      {showMoreMenu && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMoreMenu(false);
          }}
        >
          <div className="w-full bg-[var(--sk-card)] border-t border-[var(--sk-border)] rounded-t-3xl p-4 sm:p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--sk-text)] flex items-center gap-2">
                  <Menu size={18} className="text-emerald-400" />
                  {isHi ? "मेन्यू व सुविधाएं" : "Menu & All Tools"}
                </h3>
                <p className="text-xs text-[var(--sk-muted)] mt-0.5">
                  {isHi ? "AI चैट, स्कैनर, रिपोर्ट व पैमाना सेटिंग्स" : "AI Assistant, Scanner, Reports & Land Settings"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--sk-muted)] hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("partners");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "partners"
                    ? "border-emerald-500/60 bg-emerald-500/15"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-emerald-500/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Users size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)]">
                    {isHi ? "बटाईदार हिसाब" : "Partners (Batai)"}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "साझेदारी लागत व मुनाफा" : "Partner splits & payments"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("stock");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "stock"
                    ? "border-amber-500/60 bg-amber-500/15"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-amber-500/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Boxes size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)]">
                    {isHi ? "फसल स्टॉक व गोदाम" : "Crop Stock"}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "भंडारण व मंडी मूल्यांकन" : "Warehouse inventory & value"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("reports");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "reports"
                    ? "border-blue-500/60 bg-blue-500/15"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-blue-500/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)]">
                    {isHi ? "वित्तीय रिपोर्ट" : "Reports"}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "PDF बहीखाता व CSV" : "PDF Statements & CSV"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("settings");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "settings"
                    ? "border-slate-400 bg-slate-500/20"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-slate-400/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-500/20 text-slate-300 flex items-center justify-center mb-2">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)]">
                    {isHi ? "सेटिंग्स व सुरक्षा" : "Settings & PIN"}
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "पिन, प्रोफ़ाइल व बैकअप" : "PIN, profile & backup"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("ai");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "ai"
                    ? "border-emerald-500/60 bg-emerald-500/15"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-emerald-500/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)] flex items-center gap-1">
                    <span>{isHi ? "AI सलाहकार" : "AI Advisor"}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">PRO</span>
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "खाद, दवा व हिसाब सलाह" : "Chat with Smart AI"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab("scan");
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeTab === "scan"
                    ? "border-purple-500/60 bg-purple-500/15"
                    : "border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-purple-500/30"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <Camera size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--sk-text)] flex items-center gap-1">
                    <span>{isHi ? "बिल / फसल स्कैनर" : "Bill Scanner"}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">OCR</span>
                  </div>
                  <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                    {isHi ? "रसीद व पत्ते की फोटो जांच" : "Scan receipts & crop"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowLandModal(true);
                }}
                className="col-span-2 p-3.5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-amber-500/30 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Compass size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[var(--sk-text)]">
                      {isHi ? "जमीन पैमाना सेटिंग्स" : "Land Measurement Units"}
                    </div>
                    <div className="text-[10px] text-[var(--sk-muted)] mt-0.5">
                      {isHi ? "बीघा व एकड़ स्थानीय रूपांतरण" : "Bigha / Biswa / Acre unit settings"}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="p-3 rounded-2xl bg-[var(--sk-card2)] border border-[var(--sk-border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={toggleLang}
                  className="px-2.5 py-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card)] text-xs font-semibold text-[var(--sk-text)] flex items-center gap-1 cursor-pointer"
                >
                  <Languages size={13} className="text-green-400" />
                  <span>{isHi ? "EN" : "हिन्दी"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card)] text-xs font-semibold text-[var(--sk-text)] flex items-center gap-1 cursor-pointer"
                >
                  {theme === "dark" ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowQuickAdd(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>{isHi ? "नया जोड़ें" : "Add Entry"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD ACTION MODAL */}
      {showQuickAdd && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowQuickAdd(false);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--sk-text)] flex items-center gap-2">
                  <Sparkles size={17} className="text-green-400" />
                  {isHi ? "त्वरित नया रिकॉर्ड जोड़ें" : "Quick Add Entry"}
                </h3>
                <p className="text-xs text-[var(--sk-muted)] mt-0.5">
                  {isHi ? "आप किस खाते में जोड़ना चाहते हैं?" : "Which account do you want to add to?"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sk-muted)] hover:bg-white/5 cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  setActiveTab("farm");
                }}
                className="w-full p-3.5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-green-500/50 hover:bg-green-500/10 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 text-xl">
                    🌾
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--sk-text)] group-hover:text-green-400 transition">
                      {isHi ? "खेती (Khet) लेन-देन" : "Farm / Crop Entry"}
                    </div>
                    <div className="text-xs text-[var(--sk-muted)] mt-0.5">
                      {isHi ? "खाद, बीज, मजदूरी, पैदावार या बिक्री" : "Seeds, fertilizer, sales & yield"}
                    </div>
                  </div>
                </div>
                <Plus size={16} className="text-[var(--sk-dim)] group-hover:text-green-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  setActiveTab("rent");
                }}
                className="w-full p-3.5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-blue-500/50 hover:bg-blue-500/10 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 text-xl">
                    🏢
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--sk-text)] group-hover:text-blue-400 transition">
                      {isHi ? "किराया व बिजली बिल" : "Tenant Rent & Light Bill"}
                    </div>
                    <div className="text-xs text-[var(--sk-muted)] mt-0.5">
                      {isHi ? "मीटर रीडिंग, कमरा किराया, WhatsApp रसीद" : "Meter units, room rent, WhatsApp receipt"}
                    </div>
                  </div>
                </div>
                <Plus size={16} className="text-[var(--sk-dim)] group-hover:text-blue-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  setActiveTab("home");
                }}
                className="w-full p-3.5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 text-xl">
                    🛒
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--sk-text)] group-hover:text-red-400 transition">
                      {isHi ? "घरेलू दैनिक खर्च" : "Home Expense"}
                    </div>
                    <div className="text-xs text-[var(--sk-muted)] mt-0.5">
                      {isHi ? "राशन, सब्जी, दूध, घरेलू बिजली बिल" : "Groceries, vegetables, daily expenses"}
                    </div>
                  </div>
                </div>
                <Plus size={16} className="text-[var(--sk-dim)] group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator lang={lang} />
      {/* IN-APP CSV PREVIEW AND MOBILE SHARE MODAL */}
      <CSVPreviewModal />
      {/* GLOBAL LAND UNIT SETTINGS MODAL */}
      <LandSettingsModal
        isOpen={showLandModal}
        onClose={() => setShowLandModal(false)}
        lang={lang}
      />
    </div>
  );
}
