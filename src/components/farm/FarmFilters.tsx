'use client';

import React, { type Dispatch, type SetStateAction } from 'react';
import { Download, Search, Printer, Sprout, FileSpreadsheet } from 'lucide-react';
import { FarmRecord, Lang, Khet, KhetCrop } from '../../lib/types';
import { FarmTranslation, cropLabel } from '../../lib/farmI18n';
import { exportToExcel, exportToCsv } from '../../lib/excelExport';
import { printFinancialReport } from '../../lib/pdfExport';

interface FarmFiltersProps {
  lang: Lang;
  farmT: FarmTranslation;
  cropSearch: string;
  setCropSearch: Dispatch<SetStateAction<string>>;
  selectedCropTab: string;
  setSelectedCropTab: Dispatch<SetStateAction<string>>;
  availableCrops: string[];
  typeFilter: 'all' | FarmRecord['type'];
  setTypeFilter: Dispatch<SetStateAction<'all' | FarmRecord['type']>>;
  dateFilter: 'all' | 'today' | 'month' | 'year';
  setDateFilter: Dispatch<SetStateAction<'all' | 'today' | 'month' | 'year'>>;
  filteredRecords: FarmRecord[];
  allRecords: FarmRecord[];
  khets?: Khet[];
  khetCrops?: KhetCrop[];
  onOpenPrintModal?: () => void;
}

export function FarmFilters({
  lang,
  farmT,
  cropSearch,
  setCropSearch,
  selectedCropTab,
  setSelectedCropTab,
  availableCrops,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  filteredRecords,
  allRecords,
  khets = [],
  khetCrops = [],
  onOpenPrintModal,
}: FarmFiltersProps) {
  const isHindi = lang === 'hi';

  const getSaleAmount = (record: FarmRecord) => {
    if (record.type !== 'Sale') return 0;
    const quantity = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    const calculatedAmount = quantity * price;
    if (calculatedAmount > 0) return calculatedAmount;
    return Number(record.amount || 0);
  };

  const getAmount = (record: FarmRecord) => {
    if (record.type === 'Sale') return getSaleAmount(record);
    if (record.type === 'Expense') {
      const quantity = Number(record.quantity || 0);
      const price = Number(record.price || 0);
      const calculatedAmount = quantity * price;
      if (calculatedAmount > 0) return calculatedAmount;
      return Number(record.amount || 0);
    }
    return 0;
  };

  const getDetails = (record: FarmRecord) => {
    if (record.type === 'Expense') {
      return record.expenseCategory || record.note || '';
    }
    if (record.type === 'Yield') {
      return `${record.quantity || 0} ${record.unit || ''}`.trim();
    }
    if (record.type === 'Sale') {
      return `${record.quantity || 0} ${record.unit || ''} @ ₹${Number(record.price || 0).toLocaleString('en-IN')}`;
    }
    return record.note || '';
  };

  const typeText = (type: FarmRecord['type']) => {
    if (type === 'Expense') return farmT.expense;
    if (type === 'Yield') return farmT.yield;
    return farmT.sale;
  };

  const exportCSV = async () => {
    const recordsToExport = filteredRecords.length > 0 ? filteredRecords : allRecords;
    if (recordsToExport.length === 0) {
      alert(isHindi ? 'निर्यात के लिए कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records available to export.');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const cropSuffix = selectedCropTab !== 'all' ? `-${selectedCropTab}` : '';

    // Export comprehensive multi-sheet Excel workbook (.xlsx)
    exportToExcel({
      filename: `kheti-report${cropSuffix}-${todayStr}.xlsx`,
      lang,
      records: recordsToExport,
      khets,
      khetCrops,
    });
  };

  const printFarmPDF = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal();
      return;
    }

    const recordsToPrint = filteredRecords.length > 0 ? filteredRecords : allRecords;
    if (recordsToPrint.length === 0) {
      alert(isHindi ? 'प्रिंट के लिए कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records to print.');
      return;
    }

    const totalExp = recordsToPrint
      .filter((r) => r.type === 'Expense')
      .reduce((sum, r) => sum + getAmount(r), 0);
    const totalSale = recordsToPrint
      .filter((r) => r.type === 'Sale')
      .reduce((sum, r) => sum + getAmount(r), 0);
    const netProfit = totalSale - totalExp;
    const cropName =
      selectedCropTab !== 'all' ? ` (${cropLabel(lang, selectedCropTab)})` : '';

    printFinancialReport({
      title: isHindi
        ? `खेती बहीखाता वित्तीय विवरण${cropName}`
        : `Farm Account Statement${cropName}`,
      subtitle: isHindi
        ? 'खेती लागत खर्च, पैदावार एवं फसल बिक्री का पूर्ण ब्यौरा'
        : 'Complete records of farm expenses, yield & harvest sales',
      lang: lang === 'hi' ? 'hi' : 'en',
      summaryCards: [
        {
          label: isHindi ? 'कुल फसल बिक्री' : 'Total Sales',
          value: `₹${totalSale.toLocaleString('en-IN')}`,
          color: '#16a34a',
        },
        {
          label: isHindi ? 'कुल लागत खर्च' : 'Total Expenses',
          value: `₹${totalExp.toLocaleString('en-IN')}`,
          color: '#dc2626',
        },
        {
          label: isHindi ? 'शुद्ध मुनाफा (Net Profit)' : 'Net Profit',
          value: `₹${netProfit.toLocaleString('en-IN')}`,
          color: netProfit >= 0 ? '#16a34a' : '#dc2626',
        },
      ],
      tableHeaders: isHindi
        ? ['दिनांक', 'फसल / खेत', 'प्रकार', 'विवरण / मात्रा', 'रकम (₹)']
        : ['Date', 'Crop / Field', 'Type', 'Details / Qty', 'Amount (₹)'],
      tableRows: recordsToPrint.map((r) => ({
        cells: [
          r.date,
          `${cropLabel(lang, r.crop)}${r.field ? ` (${r.field})` : ''}`,
          typeText(r.type),
          `${getDetails(r)}${r.quantity ? ` [${r.quantity} ${r.unit || ''}]` : ''}`,
          r.type === 'Yield' ? '-' : `${r.type === 'Sale' ? '+' : '-'} ₹${getAmount(r).toLocaleString('en-IN')}`,
        ],
      })),
      footerNotes: isHindi
        ? 'किसान साथी डिजिटल कृषि बहीखाता द्वारा जनरेट किया गया'
        : 'Digital Farm Statement generated by Kisan Sathi',
    });
  };

  const allTypes = lang === 'hi' ? 'सभी प्रकार' : 'All Types';
  const allDates = lang === 'hi' ? 'सभी तारीख' : 'All Dates';
  const today = lang === 'hi' ? 'आज' : 'Today';
  const thisMonth = lang === 'hi' ? 'इस माह' : 'This Month';
  const thisYear = lang === 'hi' ? 'इस वर्ष' : 'This Year';
  const searchPlaceholder = lang === 'hi' ? 'खेत, विवरण या नाम से खोजें...' : 'Search field, note or worker...';

  return (
    <div className="mb-4 space-y-3">
      {/* 1. CROP FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sprout size={15} className="text-emerald-400 shrink-0" />
          <span>{isHindi ? 'फसल अनुसार देखें:' : 'Select Crop:'}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCropTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedCropTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <span>{isHindi ? 'सभी फसलें' : 'All Crops'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {allRecords.length}
            </span>
          </button>
          {availableCrops.map((cropName) => {
            const isSelected = selectedCropTab === cropName;
            const count = allRecords.filter((r) => r.crop === cropName).length;
            const cropExpenses = allRecords
              .filter((r) => r.crop === cropName && r.type === 'Expense')
              .reduce((sum, r) => sum + getAmount(r), 0);
            const cropSales = allRecords
              .filter((r) => r.crop === cropName && r.type === 'Sale')
              .reduce((sum, r) => sum + getAmount(r), 0);
            const net = cropSales - cropExpenses;
            return (
              <button
                key={cropName}
                type="button"
                onClick={() => setSelectedCropTab(cropName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <span>🌾 {cropLabel(lang, cropName)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-mono text-slate-400">
                  {count}
                </span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      net >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    ({net >= 0 ? '+' : ''}₹{(net / 1000).toFixed(1)}k)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECONDARY CONTROLS (Compact & responsive on mobile) */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] pl-9 pr-3 text-xs sm:text-sm text-[var(--sk-text)] outline-none transition focus:border-emerald-500 placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | FarmRecord['type'])}
            className="h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-2.5 text-xs text-[var(--sk-text)] outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">{allTypes}</option>
            <option value="Expense">{farmT.expense}</option>
            <option value="Yield">{farmT.yield}</option>
            <option value="Sale">{farmT.sale}</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'month' | 'year')}
            className="h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-2.5 text-xs text-[var(--sk-text)] outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">{allDates}</option>
            <option value="today">{today}</option>
            <option value="month">{thisMonth}</option>
            <option value="year">{thisYear}</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            className="h-10 px-3 rounded-xl border border-[#1e3c2c] text-emerald-300 bg-[#0c1a13] hover:bg-[#152e20] active:scale-95 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            title={lang === 'hi' ? 'Excel (.xlsx) व CSV में डाउनलोड करें' : 'Export Excel & CSV'}
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={printFarmPDF}
            className="h-10 px-3 rounded-xl border border-[#1e3c2c] text-emerald-300 bg-[#0c1a13] hover:bg-[#152e20] active:scale-95 transition flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            title={lang === 'hi' ? 'PDF प्रिंट / डाउनलोड करें' : 'Print PDF Statement'}
          >
            <Printer size={14} className="text-emerald-400" />
            <span>PDF प्रिंट</span>
          </button>
        </div>
      </div>
    </div>
  );
}
