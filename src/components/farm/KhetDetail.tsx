'use client';

import React, { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Plus,
  Sprout,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Wheat,
  Sparkles,
  Droplets,
  Fuel,
  Users,
  Zap,
  Truck,
  HelpCircle,
  Store,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import type { FarmRecord, Lang, Khet, KhetCrop } from '../../lib/types';
import { cropLabel, unitLabel } from '../../lib/farmI18n';
import { FarmForm, POPULAR_CROPS } from './FarmForm';
import { PrintReportModal } from './PrintReportModal';
import { exportToExcel } from '../../lib/excelExport';
import {
  getLandSettings,
  formatDualArea,
  calculatePerLandMetrics,
} from '../../lib/landMeasurement';
import { LandSettingsModal } from './LandSettingsModal';

interface KhetDetailProps {
  lang: Lang;
  khet: Khet;
  records: FarmRecord[];
  setRecords: React.Dispatch<React.SetStateAction<FarmRecord[]>>;
  onBack: () => void;
  onDeleteKhet: () => void;
  onUpdateKhet?: (updatedKhet: Khet) => void;
  initialCropFilter?: string;
  khetCrops?: KhetCrop[];
}

const AREA_UNITS = ['बीघा', 'एकड़', 'हेक्टेयर'];

const EXPENSE_CATEGORY_ICONS: Record<string, { icon: any; color: string; labelHi: string; labelEn: string }> = {
  बीज: { icon: Wheat, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', labelHi: 'बीज', labelEn: 'Seeds' },
  खाद: { icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', labelHi: 'खाद', labelEn: 'Fertilizer' },
  कीटनाशक: { icon: Droplets, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', labelHi: 'कीटनाशक', labelEn: 'Pesticide' },
  'डीजल/ट्रैक्टर': { icon: Fuel, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30', labelHi: 'डीजल / ट्रैक्टर', labelEn: 'Diesel / Tractor' },
  मजदूरी: { icon: Users, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30', labelHi: 'मजदूरी', labelEn: 'Labor' },
  सिंचाई: { icon: Droplets, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30', labelHi: 'सिंचाई', labelEn: 'Irrigation' },
  बिजली: { icon: Zap, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30', labelHi: 'बिजली', labelEn: 'Electricity' },
  ढुलाई: { icon: Truck, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30', labelHi: 'ढुलाई', labelEn: 'Transport' },
  अन्य: { icon: HelpCircle, color: 'text-slate-400 bg-slate-500/15 border-slate-500/30', labelHi: 'अन्य', labelEn: 'Other' },
};

export function KhetDetail({
  lang,
  khet,
  records,
  setRecords,
  onBack,
  onDeleteKhet,
  onUpdateKhet,
  initialCropFilter,
  khetCrops = [],
}: KhetDetailProps) {
  const isHi = lang === 'hi';
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FarmRecord | null>(null);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>(initialCropFilter || 'all');
  const [showLandModal, setShowLandModal] = useState(false);
  const [landSettings, setLandSettings] = useState(() => getLandSettings());
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleExportExcel = () => {
    exportToExcel({
      lang,
      records: allFieldRecords,
      khets: [khet],
      khetCrops: khetCrops.filter((c) => c.khetId === khet.id),
      filename: `khet-${khet.name}-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const [showEditKhet, setShowEditKhet] = useState(false);
  const [editKhetData, setEditKhetData] = useState(() => {
    const isKnown = (POPULAR_CROPS as readonly string[]).includes(khet.crop as any);
    return {
      name: khet.name,
      crop: isKnown ? khet.crop : 'Other',
      customCrop: isKnown ? '' : khet.crop,
      area: String(khet.area),
      areaUnit: khet.areaUnit,
      sowingDate: khet.sowingDate || '',
    };
  });
  const [editKhetError, setEditKhetError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allFieldRecords = useMemo(() => {
    return records.filter(
      (record) =>
        record.khetId === khet.id ||
        (record.field || '').trim().toLowerCase() === khet.name.trim().toLowerCase()
    );
  }, [records, khet.id, khet.name]);

  const fieldCrops = useMemo(() => {
    const crops = new Set<string>();
    if (khet.crop) crops.add(khet.crop);
    if (khet.crops) khet.crops.forEach((c) => crops.add(c.cropName));
    khetCrops.filter((c) => c.khetId === khet.id).forEach((c) => crops.add(c.cropName));
    allFieldRecords.forEach((r) => {
      if (r.crop) crops.add(r.crop);
    });
    return Array.from(crops);
  }, [allFieldRecords, khet, khetCrops]);

  const khetRecords = useMemo(() => {
    if (selectedCropFilter === 'all') return allFieldRecords;
    return allFieldRecords.filter((r) => r.crop === selectedCropFilter);
  }, [allFieldRecords, selectedCropFilter]);

  const getExpenseAmount = (record: FarmRecord) => {
    if (record.type !== 'Expense') return 0;
    if (Number(record.amount) > 0) return Number(record.amount);
    const quantity = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    return quantity * price;
  };

  const getSaleAmount = (record: FarmRecord) => {
    if (record.type !== 'Sale') return 0;
    if (Number(record.amount) > 0) return Number(record.amount);
    const quantity = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    return quantity * price;
  };

  const financials = useMemo(() => {
    let totalExpense = 0;
    let totalSales = 0;
    let paymentReceived = 0;
    let pendingPayment = 0;
    let totalYieldKg = 0;
    let totalYieldQuintal = 0;
    const categoryBreakdown: Record<string, number> = {
      बीज: 0,
      खाद: 0,
      कीटनाशक: 0,
      'डीजल/ट्रैक्टर': 0,
      मजदूरी: 0,
      सिंचाई: 0,
      बिजली: 0,
      ढुलाई: 0,
      अन्य: 0,
    };

    khetRecords.forEach((record) => {
      if (record.type === 'Expense') {
        const amt = getExpenseAmount(record);
        totalExpense += amt;
        const cat = record.expenseCategory || 'अन्य';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
      }
      if (record.type === 'Sale') {
        const gross = getSaleAmount(record);
        totalSales += gross;
        const paid = record.paidAmount !== undefined ? Number(record.paidAmount) : gross;
        const pending = record.remainingAmount !== undefined
          ? Number(record.remainingAmount)
          : Math.max(0, gross - paid);
        paymentReceived += paid;
        pendingPayment += pending;
      }
      if (record.type === 'Yield') {
        const qty = Number(record.quantity || 0);
        if (record.unit === 'Quintal') {
          totalYieldKg += qty * 100;
          totalYieldQuintal += qty;
        } else if (record.unit === 'Ton') {
          totalYieldKg += qty * 1000;
          totalYieldQuintal += qty * 10;
        } else if (record.unit === 'Kg') {
          totalYieldKg += qty;
          totalYieldQuintal += qty / 100;
        } else {
          totalYieldKg += qty;
          totalYieldQuintal += qty / 100;
        }
      }
    });

    const realizedNetProfit = paymentReceived - totalExpense;
    const expectedProfit = totalSales - totalExpense;

    return {
      totalExpense,
      totalSales,
      paymentReceived,
      pendingPayment,
      realizedNetProfit,
      expectedProfit,
      totalYieldKg,
      totalYieldQuintal,
      categoryBreakdown,
    };
  }, [khetRecords]);

  const dualLand = useMemo(() => {
    return formatDualArea(khet.area, khet.areaUnit, landSettings, lang);
  }, [khet.area, khet.areaUnit, landSettings, lang]);

  const perLandMetrics = useMemo(() => {
    return calculatePerLandMetrics(
      financials.totalExpense,
      financials.totalSales,
      financials.realizedNetProfit,
      financials.totalYieldKg,
      khet.area,
      khet.areaUnit,
      landSettings
    );
  }, [financials, khet.area, khet.areaUnit, landSettings]);

  const handleDelete = (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  const handleEdit = (record: FarmRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleSave = (record: FarmRecord) => {
    const fixedRecord: FarmRecord = {
      ...record,
      field: khet.name,
      crop: record.crop || (selectedCropFilter !== 'all' ? selectedCropFilter : (khet.crop || 'Wheat')),
      area: khet.area,
      areaUnit: khet.areaUnit,
    };
    setRecords((current) => {
      const exists = current.some((item) => item.id === fixedRecord.id);
      if (exists) {
        return current.map((item) =>
          item.id === fixedRecord.id ? fixedRecord : item
        );
      }
      return [fixedRecord, ...current];
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleSaveKhetEdit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setEditKhetError(null);
    const newName = editKhetData.name.trim();
    if (!newName) {
      setEditKhetError(isHi ? 'कृपया खेत का नाम लिखें।' : 'Field name is required.');
      return;
    }
    const areaNum = parseFloat(editKhetData.area);
    if (isNaN(areaNum) || areaNum <= 0) {
      setEditKhetError(isHi ? 'वैध क्षेत्रफल दर्ज करें।' : 'Please enter a valid area (> 0).');
      return;
    }

    const finalCrop =
      editKhetData.crop === 'Other' && editKhetData.customCrop?.trim()
        ? editKhetData.customCrop.trim()
        : (editKhetData.crop || 'Wheat');

    const updated: Khet = {
      ...khet,
      name: newName,
      crop: finalCrop,
      area: areaNum,
      areaUnit: editKhetData.areaUnit,
      sowingDate: editKhetData.sowingDate,
    };

    if (newName.toLowerCase() !== khet.name.toLowerCase()) {
      setRecords((prev) =>
        prev.map((r) =>
          (r.field || '').trim().toLowerCase() === khet.name.trim().toLowerCase()
            ? { ...r, field: newName }
            : r
        )
      );
    }

    if (onUpdateKhet) {
      onUpdateKhet(updated);
    }
    setShowEditKhet(false);
  };

  return (
    <div className="w-full max-w-[1050px] mx-auto px-3 sm:px-5 lg:px-6 pb-16 space-y-4">
      {/* TOP NAV & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--sk-text)] hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-base sm:text-lg">{khet.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
            {cropLabel(lang, khet.crop || 'Wheat')}
          </span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowLandModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-2.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
            title={isHi ? 'इकाई सेटिंग बदलें' : 'Land Unit Setting'}
          >
            <Compass size={14} className="text-amber-400" />
            <span className="hidden sm:inline">1 एकड़ = {landSettings.bighaPerAcre} बीघा</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-2.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-800 transition cursor-pointer"
            title={isHi ? 'खेत का हिसाब Excel (.xlsx) में डाउनलोड करें' : 'Export Excel'}
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-2.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-800 transition cursor-pointer"
            title={isHi ? 'खेत का पर्चा PDF प्रिंट करें' : 'Print PDF'}
          >
            <Printer size={14} className="text-emerald-400" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const isKnown = (POPULAR_CROPS as readonly string[]).includes(khet.crop as any);
              setEditKhetData({
                name: khet.name,
                crop: isKnown ? khet.crop : 'Other',
                customCrop: isKnown ? '' : khet.crop,
                area: String(khet.area),
                areaUnit: khet.areaUnit,
                sowingDate: khet.sowingDate || '',
              });
              setEditKhetError(null);
              setShowEditKhet(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-3 py-2 text-xs font-semibold text-[var(--sk-text)] hover:bg-white/5 transition cursor-pointer"
            title={isHi ? 'खेत विवरण बदलें' : 'Edit Field Details'}
          >
            <Pencil size={14} className="text-blue-400" />
            <span className="hidden sm:inline">{isHi ? 'खेत सुधारें' : 'Edit Khet'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            {isHi ? '+ खर्च/उपज/बिक्री' : '+ Add Entry'}
          </button>
        </div>
      </div>

      {/* FIELD & CROP SUMMARY BANNER WITH DUAL AREA */}
      <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              <Sprout size={24} />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--sk-text)] flex items-center gap-2">
                <span>{khet.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                  {cropLabel(lang, khet.crop || 'Wheat')}
                </span>
              </div>
              <div className="text-xs text-[var(--sk-muted)] mt-1 flex flex-wrap items-center gap-2">
                <span>
                  क्षेत्रफल: <b className="text-emerald-400 font-mono font-bold">{dualLand.label}</b>
                </span>
                {khet.sowingDate && (
                  <span>बुवाई: <b className="text-[var(--sk-text)]">{khet.sowingDate}</b></span>
                )}
              </div>
            </div>
          </div>

          {/* Crop Selector / Filter Tabs */}
          {fieldCrops.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] text-[var(--sk-muted)] px-2 font-medium">
                {isHi ? 'फसल बहीखाता:' : 'Crop Ledger:'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCropFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedCropFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'सभी फसलें' : 'All Crops'}
              </button>
              {fieldCrops.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCropFilter(c)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCropFilter === c
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cropLabel(lang, c)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CORE FINANCIALS GRID */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[var(--sk-text)] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            {isHi ? 'शुद्ध नकद मुनाफा व वित्तीय स्थिति (Realized Net Profit)' : 'Realized Net Profit & Financials'}
          </span>
          <span className="text-[11px] text-[var(--sk-muted)] font-mono">
            {isHi ? 'नकद प्राप्त आधार' : 'Cash-in-hand basis'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Total Cost */}
          <div className="rounded-2xl border border-red-500/20 bg-red-950/15 p-3">
            <div className="text-[11px] text-red-300 font-medium">{isHi ? 'कुल लागत (खर्च)' : 'Total Cost'}</div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-red-400">
              ₹{financials.totalExpense.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-red-200/60 mt-0.5 truncate">
              {isHi ? 'खाद, बीज, डीजल आदि' : 'All farm inputs'}
            </div>
          </div>

          {/* 2. Total Yield */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/15 p-3">
            <div className="text-[11px] text-cyan-300 font-medium">{isHi ? 'कुल उपज (पैदावार)' : 'Total Yield'}</div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-cyan-400">
              {financials.totalYieldQuintal > 0
                ? `${parseFloat(financials.totalYieldQuintal.toFixed(2))} Qtl`
                : `${financials.totalYieldKg} Kg`}
            </div>
            <div className="text-[10px] text-cyan-200/60 mt-0.5">
              ≈ {financials.totalYieldKg} {isHi ? 'किलो' : 'Kg'}
            </div>
          </div>

          {/* 3. Gross Sales */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/15 p-3">
            <div className="text-[11px] text-blue-300 font-medium">{isHi ? 'कुल बिक्री मूल्य' : 'Gross Sales'}</div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-blue-400">
              ₹{financials.totalSales.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-blue-200/60 mt-0.5">
              {isHi ? 'उपज की कुल कीमत' : 'Total harvest value'}
            </div>
          </div>

          {/* 4. Payment Received */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3">
            <div className="text-[11px] text-emerald-300 font-medium">{isHi ? 'प्राप्त नकद (मिला)' : 'Payment Received'}</div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-emerald-400">
              ₹{financials.paymentReceived.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-200/60 mt-0.5">
              {isHi ? 'हाथ में आया नकद' : 'Collected cash'}
            </div>
          </div>

          {/* 5. Pending Receivable */}
          <div
            className={`rounded-2xl border p-3 ${
              financials.pendingPayment > 0
                ? 'border-amber-500/30 bg-amber-950/25'
                : 'border-[var(--sk-border)] bg-[var(--sk-card)]'
            }`}
          >
            <div className="text-[11px] text-amber-300 font-medium">{isHi ? 'बकाया रकम (बाकी)' : 'Pending Balance'}</div>
            <div
              className={`mt-1 text-base sm:text-lg font-bold font-mono ${
                financials.pendingPayment > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              ₹{financials.pendingPayment.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-amber-200/60 mt-0.5 truncate">
              {financials.pendingPayment > 0 ? (isHi ? 'लेनी बाकी' : 'Receivable') : (isHi ? 'शून्य बकाया' : 'Zero pending')}
            </div>
          </div>

          {/* 6. Realized Net Profit */}
          <div
            className={`rounded-2xl border p-3 shadow-md ${
              financials.realizedNetProfit >= 0
                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 to-green-950/30 shadow-emerald-950'
                : 'border-red-500/50 bg-gradient-to-br from-red-950/40 to-rose-950/30 shadow-red-950'
            }`}
          >
            <div className="text-[11px] font-bold flex items-center justify-between text-white">
              <span>{isHi ? 'शुद्ध नकद मुनाफा' : 'Realized Profit'}</span>
              {financials.realizedNetProfit >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
            <div
              className={`mt-1 text-base sm:text-lg font-bold font-mono ${
                financials.realizedNetProfit >= 0 ? 'text-emerald-300' : 'text-red-400'
              }`}
            >
              {financials.realizedNetProfit >= 0 ? '+' : ''} ₹{financials.realizedNetProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5">
              {financials.totalExpense > 0
                ? `${Math.round((financials.realizedNetProfit / financials.totalExpense) * 100)}% ROI`
                : (isHi ? 'नकद प्राप्त आधार' : 'Cash basis')}
            </div>
          </div>
        </div>
      </div>

      {/* PER BIGHA & PER ACRE PROFITABILITY METRICS */}
      <div className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--sk-text)] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            {isHi ? 'प्रति बीघा व प्रति एकड़ मुनाफा व लागत विश्लेषण:' : 'Per Bigha & Per Acre Breakdown:'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {isHi ? `अनुपात: 1 एकड़ = ${landSettings.bighaPerAcre} बीघा` : `1 Acre = ${landSettings.bighaPerAcre} Bigha`}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-[var(--sk-muted)] font-sans">{isHi ? 'प्रति बीघा लागत:' : 'Cost / Bigha:'}</div>
            <div className="text-sm font-bold text-red-400 mt-0.5">
              ₹{perLandMetrics.costPerBigha.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-[var(--sk-muted)] font-sans">{isHi ? 'प्रति बीघा शुद्ध लाभ:' : 'Profit / Bigha:'}</div>
            <div className={`text-sm font-bold mt-0.5 ${
              perLandMetrics.realizedProfitPerBigha >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {perLandMetrics.realizedProfitPerBigha >= 0 ? '+' : ''} ₹{perLandMetrics.realizedProfitPerBigha.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-[var(--sk-muted)] font-sans">{isHi ? 'प्रति एकड़ लागत:' : 'Cost / Acre:'}</div>
            <div className="text-sm font-bold text-red-400 mt-0.5">
              ₹{perLandMetrics.costPerAcre.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-[var(--sk-muted)] font-sans">{isHi ? 'प्रति एकड़ शुद्ध लाभ:' : 'Profit / Acre:'}</div>
            <div className={`text-sm font-bold mt-0.5 ${
              perLandMetrics.realizedProfitPerAcre >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {perLandMetrics.realizedProfitPerAcre >= 0 ? '+' : ''} ₹{perLandMetrics.realizedProfitPerAcre.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* INPUT COST CATEGORIES */}
      <div className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--sk-text)] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            {isHi ? 'लागत खर्च विभाजन (Inputs Cost):' : 'Input Cost Breakdown:'}
          </span>
          <span className="text-[11px] text-[var(--sk-muted)] font-mono">
            {isHi ? 'कुल लागत:' : 'Total:'} ₹{financials.totalExpense.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {['बीज', 'खाद', 'कीटनाशक', 'डीजल/ट्रैक्टर', 'मजदूरी', 'सिंचाई'].map((catKey) => {
            const config = EXPENSE_CATEGORY_ICONS[catKey];
            const Icon = config.icon;
            const amount = financials.categoryBreakdown[catKey] || 0;
            const pct = financials.totalExpense > 0 ? Math.round((amount / financials.totalExpense) * 100) : 0;
            return (
              <div
                key={catKey}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--sk-text)] font-semibold truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{isHi ? config.labelHi : config.labelEn}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--sk-muted)]">{pct}%</span>
                </div>
                <div className="text-sm font-bold font-mono text-[var(--sk-text)]">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED TRANSACTIONS LIST */}
      <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--sk-border)] px-4 py-3 bg-[var(--sk-card2)]">
          <div className="font-bold text-sm text-[var(--sk-text)] flex items-center gap-2">
            <span>{isHi ? 'खेत का सम्पूर्ण लेनदेन (Transactions)' : 'Field Transactions'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {khetRecords.length} {isHi ? 'रिकॉर्ड' : 'records'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            {isHi ? 'नया दर्ज करें' : 'New Entry'}
          </button>
        </div>

        {khetRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Sprout size={32} className="mx-auto mb-2 text-[var(--sk-dim)] opacity-60" />
            <div className="text-sm font-semibold text-[var(--sk-muted)]">
              {isHi ? 'इस खेत का कोई रिकॉर्ड दर्ज नहीं है' : 'No transactions recorded yet'}
            </div>
            <p className="text-xs text-[var(--sk-dim)] mt-1">
              {isHi
                ? "ऊपर '+ नया दर्ज करें' बटन दबाकर बीज, खाद, डीजल या फसल बिक्री जोड़ें।"
                : 'Tap + Add Entry to record seeds, fertilizer, diesel, labor or sales.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {khetRecords.map((record) => {
              const amount =
                record.type === 'Expense'
                  ? getExpenseAmount(record)
                  : record.type === 'Sale'
                  ? getSaleAmount(record)
                  : 0;
              const isSale = record.type === 'Sale';
              const isExpense = record.type === 'Expense';
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-sm text-[var(--sk-text)] flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isExpense
                          ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                          : isSale
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                      }`}>
                        {isExpense
                          ? record.expenseCategory || (isHi ? 'लागत खर्च' : 'Expense')
                          : isSale
                          ? isHi ? 'फसल बिक्री' : 'Crop Sale'
                          : isHi ? 'उपज' : 'Yield'}
                      </span>
                      {record.crop && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[var(--sk-muted)] font-mono">
                          {cropLabel(lang, record.crop)}
                        </span>
                      )}
                      {isSale && (
                        <>
                          {record.paymentStatus === 'Received' || (record.remainingAmount === 0 && Number(record.paidAmount) > 0) ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25">
                              ✓ {isHi ? 'पूर्ण भुगतान' : 'Paid'}
                            </span>
                          ) : record.paymentStatus === 'Partial' ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/25">
                              बाकी: ₹{record.remainingAmount?.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold border border-red-500/25">
                              {isHi ? 'बाकी' : 'Pending'}
                            </span>
                          )}
                        </>
                      )}
                      {record.buyerName && (
                        <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {record.buyerName}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[var(--sk-muted)] truncate flex flex-wrap items-center gap-2">
                      <span>📅 {record.date}</span>
                      {record.worker && <span>👤 {record.worker}</span>}
                      {record.note && <span>📝 {record.note}</span>}
                    </div>
                    {record.quantity ? (
                      <div className="mt-0.5 text-[11px] text-[var(--sk-faint)] font-mono flex items-center gap-2">
                        <span>
                          {record.quantity} {unitLabel(lang, record.unit)}
                          {record.price
                            ? ` @ ₹${Number(record.price).toLocaleString('en-IN')}`
                            : ''}
                        </span>
                        {isSale && record.unit === 'Quintal' && (
                          <span className="text-emerald-400 font-semibold">
                            (₹{record.price}/क्विंटल)
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {amount > 0 ? (
                        <div>
                          <div
                            className={`font-bold font-mono text-sm sm:text-base ${
                              isSale ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isSale ? '+' : '-'} ₹{amount.toLocaleString('en-IN')}
                          </div>
                          {isSale && Number(record.remainingAmount || 0) > 0 && (
                            <div className="text-[10px] font-mono text-amber-400">
                              (बाकी: ₹{record.remainingAmount?.toLocaleString('en-IN')})
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-cyan-400 font-bold font-mono">
                          {record.quantity} {unitLabel(lang, record.unit)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(record)}
                        className="rounded-lg px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                      >
                        {isHi ? 'बदलें' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        {isHi ? 'हटाएं' : 'Del'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE KHET ACTION */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs font-semibold text-red-400 hover:underline cursor-pointer flex items-center gap-1.5"
        >
          <Trash2 size={13} />
          {isHi ? 'इस खेत (चक) को हटाएं' : 'Delete this field'}
        </button>
      </div>

      {/* FARM RECORD MODAL OVERLAY */}
      {showForm && (
        <FarmForm
          lang={lang}
          farmT={{}}
          editingRecord={editingRecord}
          fixedKhet={khet}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}

      {/* LAND UNIT SETTINGS MODAL */}
      <LandSettingsModal
        isOpen={showLandModal}
        onClose={() => setShowLandModal(false)}
        lang={lang}
        onSettingsSaved={(newSettings) => setLandSettings(newSettings)}
      />

      {/* EDIT KHET MODAL */}
      {showEditKhet && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowEditKhet(false);
          }}
        >
          <form
            onSubmit={handleSaveKhetEdit}
            className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <h2 className="text-base font-bold text-[var(--sk-text)] flex items-center gap-2">
                🌾 {isHi ? 'खेत विवरण संशोधित करें' : 'Edit Field Details'}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditKhet(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--sk-muted)] hover:bg-white/5 cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>
            {editKhetError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editKhetError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'खेत का नाम:' : 'Field Name:'}
              </label>
              <input
                type="text"
                value={editKhetData.name}
                onChange={(e) => setEditKhetData({ ...editKhetData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                  {isHi ? 'क्षेत्रफल (Area):' : 'Area:'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editKhetData.area}
                  onChange={(e) => setEditKhetData({ ...editKhetData, area: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                  {isHi ? 'इकाई:' : 'Unit:'}
                </label>
                <select
                  value={editKhetData.areaUnit}
                  onChange={(e) => setEditKhetData({ ...editKhetData, areaUnit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'मुख्य फसल:' : 'Main Crop:'}
              </label>
              <select
                value={editKhetData.crop}
                onChange={(e) => setEditKhetData({ ...editKhetData, crop: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {POPULAR_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {cropLabel(lang, c)} ({c})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'बुवाई तिथि:' : 'Sowing Date:'}
              </label>
              <input
                type="date"
                value={editKhetData.sowingDate}
                onChange={(e) => setEditKhetData({ ...editKhetData, sowingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sk-border)]">
              <button
                type="button"
                onClick={() => setShowEditKhet(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-[var(--sk-muted)] hover:bg-slate-800 cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
              >
                {isHi ? 'सुरक्षित करें' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[var(--sk-card)] p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              {isHi ? 'खेत हटाने की पुष्टि' : 'Confirm Delete Field'}
            </h3>
            <p className="text-xs text-[var(--sk-muted)] leading-relaxed">
              {isHi
                ? `क्या आप वाकई "${khet.name}" को हटाना चाहते हैं?`
                : `Are you sure you want to delete "${khet.name}" and all its records?`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-[var(--sk-muted)] hover:bg-slate-800 cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteKhet();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                {isHi ? 'हाँ, हटाएं' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT & PDF STATEMENT MODAL */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        lang={lang}
        records={allFieldRecords}
        khets={[khet]}
        khetCrops={khetCrops.filter((c) => c.khetId === khet.id)}
        selectedKhetId={khet.id}
      />
    </div>
  );
}
