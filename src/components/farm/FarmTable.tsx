'use client';

import React, { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Pencil,
  Trash2,
  Wheat,
  Sparkles,
  Droplets,
  Fuel,
  Users,
  Zap,
  Truck,
  HelpCircle,
  Table as TableIcon,
  BookOpen,
  LayoutGrid,
  Layers,
  Share2,
} from 'lucide-react';
import type { FarmRecord, Lang, Khet, KhetCrop } from '../../lib/types';
import { fmt, formatDate } from '../../lib/utils';
import {
  FARM_STRINGS,
  cropLabel,
  typeLabel,
  unitLabel,
} from '../../lib/farmI18n';
import { FormCard } from '../common/UI';
import { FarmFilters } from './FarmFilters';
import { shareViaWhatsApp, generateRecordWhatsAppMessage } from '../../lib/whatsappSharing';

interface FarmTableProps {
  filteredRecords: FarmRecord[];
  allRecords?: FarmRecord[];
  lang: Lang;
  cropSearch: string;
  setCropSearch: Dispatch<SetStateAction<string>>;
  typeFilter: 'all' | FarmRecord['type'];
  setTypeFilter: Dispatch<SetStateAction<'all' | FarmRecord['type']>>;
  dateFilter: 'all' | 'today' | 'month' | 'year';
  setDateFilter: Dispatch<SetStateAction<'all' | 'today' | 'month' | 'year'>>;
  onEdit: (record: FarmRecord) => void;
  onDelete: (id: string) => void;
  khets?: Khet[];
  khetCrops?: KhetCrop[];
  onOpenPrintModal?: () => void;
}

const EXPENSE_ICONS: Record<string, any> = {
  बीज: Wheat,
  खाद: Sparkles,
  कीटनाशक: Droplets,
  'डीजल/ट्रैक्टर': Fuel,
  मजदूरी: Users,
  सिंचाई: Droplets,
  बिजली: Zap,
  ढुलाई: Truck,
  अन्य: HelpCircle,
};

export function FarmTable({
  filteredRecords,
  allRecords = filteredRecords,
  lang,
  cropSearch,
  setCropSearch,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  onEdit,
  onDelete,
  khets = [],
  khetCrops = [],
  onOpenPrintModal,
}: FarmTableProps) {
  const farmT = FARM_STRINGS[lang];
  const isHi = lang === 'hi';

  const [selectedCropTab, setSelectedCropTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'table' | 'cards'>('grouped');

  const availableCrops = useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (r.crop) set.add(r.crop);
    });
    return Array.from(set);
  }, [allRecords]);

  const cropFilteredRecords = useMemo(() => {
    if (selectedCropTab === 'all') return filteredRecords;
    return filteredRecords.filter((r) => r.crop === selectedCropTab);
  }, [filteredRecords, selectedCropTab]);

  const getAmount = (record: FarmRecord) => {
    if (record.type === 'Yield') {
      const quantity = Number(record.quantity) || 0;
      return quantity > 0 ? `${quantity} ${unitLabel(lang, record.unit)}` : '-';
    }
    if (record.type === 'Sale') {
      const amount =
        Number(record.amount) ||
        Number(record.quantity || 0) * Number(record.price || 0);
      return amount > 0 ? fmt(amount) : '-';
    }
    if (record.type === 'Expense') {
      const savedAmount = Number(record.amount) || 0;
      const calculatedAmount = Number(record.quantity || 0) * Number(record.price || 0);
      const amount = savedAmount > 0 ? savedAmount : calculatedAmount;
      return amount > 0 ? fmt(amount) : '-';
    }
    return '-';
  };

  const getDetails = (record: FarmRecord) => {
    if (record.type === 'Expense') {
      const category = record.expenseCategory || 'खर्च';
      const quantity = Number(record.quantity) || 0;
      const price = Number(record.price) || 0;
      const workerPart = record.worker ? ` | ${record.worker}` : '';
      const notePart = record.note ? ` | ${record.note}` : '';
      if (quantity > 0 && price > 0) {
        return `${category} (${quantity} ${unitLabel(lang, record.unit)} @ ₹${price.toLocaleString('en-IN')})${workerPart}${notePart}`;
      }
      if (quantity > 0) {
        return `${category} (${quantity} ${unitLabel(lang, record.unit)})${workerPart}${notePart}`;
      }
      return `${category}${workerPart}${notePart}`;
    }
    if (record.type === 'Yield') {
      const quantity = Number(record.quantity) || 0;
      const notePart = record.note ? ` | ${record.note}` : '';
      if (quantity <= 0) return '-';
      return `${quantity} ${unitLabel(lang, record.unit)}${notePart}`;
    }
    if (record.type === 'Sale') {
      const quantity = Number(record.quantity) || 0;
      const price = Number(record.price) || 0;
      const buyerPart = record.buyerName ? ` | ${record.buyerName}` : '';
      const notePart = record.note ? ` | ${record.note}` : '';
      if (quantity > 0 && price > 0) {
        return `${quantity} ${unitLabel(lang, record.unit)} @ ₹${price.toLocaleString('en-IN')}/क्विंटल${buyerPart}${notePart}`;
      }
      return `${buyerPart ? buyerPart.slice(3) : ''}${notePart}`.trim() || '-';
    }
    return record.note || '-';
  };

  const getTypeClass = (type: FarmRecord['type']) => {
    if (type === 'Expense') {
      return 'bg-red-500/15 text-red-300 border-red-500/25';
    }
    if (type === 'Yield') {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25';
    }
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
  };

  const getAmountClass = (type: FarmRecord['type']) => {
    if (type === 'Expense') return 'text-red-400';
    if (type === 'Sale') return 'text-emerald-400';
    return 'text-cyan-400';
  };

  const cropSummary = useMemo(() => {
    let exp = 0;
    let sale = 0;
    let received = 0;
    let pending = 0;
    let yieldQtl = 0;
    cropFilteredRecords.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if (r.type === 'Expense') exp += amt;
      if (r.type === 'Sale') {
        const sAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
        sale += amt;
        received += sAmt;
        pending += r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - sAmt);
      }
      if (r.type === 'Yield') {
        const q = Number(r.quantity) || 0;
        if (r.unit === 'Quintal') yieldQtl += q;
        else if (r.unit === 'Kg') yieldQtl += q / 100;
        else if (r.unit === 'Ton') yieldQtl += q * 10;
      }
    });
    const netProfit = received - exp;
    return {
      exp,
      sale,
      received,
      pending,
      yieldQtl,
      netProfit,
    };
  }, [cropFilteredRecords]);

  const recordsByCrop = useMemo(() => {
    const map: Record<string, FarmRecord[]> = {};
    const targetRecords = selectedCropTab === 'all' ? filteredRecords : cropFilteredRecords;
    targetRecords.forEach((r) => {
      const crop = r.crop || 'Other';
      if (!map[crop]) map[crop] = [];
      map[crop].push(r);
    });
    return map;
  }, [filteredRecords, cropFilteredRecords, selectedCropTab]);

  return (
    <FormCard>
      {/* 1. Crop tabs & filters */}
      <FarmFilters
        lang={lang}
        farmT={farmT}
        cropSearch={cropSearch}
        setCropSearch={setCropSearch}
        selectedCropTab={selectedCropTab}
        setSelectedCropTab={setSelectedCropTab}
        availableCrops={availableCrops}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        filteredRecords={cropFilteredRecords}
        allRecords={allRecords}
        khets={khets}
        khetCrops={khetCrops}
        onOpenPrintModal={onOpenPrintModal}
      />

      {/* 2. VIEW MODE TOGGLE BAR */}
      <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-400" />
            <span>{isHi ? 'प्रदर्शन शैली (View Mode):' : 'Display Style:'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="फसलवार फोल्डर दृश्य"
          >
            <Layers size={13} />
            <span>{isHi ? 'फसलवार फोल्डर' : 'Grouped by Crop'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="पासबुक कार्ड दृश्य"
          >
            <LayoutGrid size={13} />
            <span>{isHi ? 'कार्ड दृश्य' : 'Passbook Cards'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="विस्तृत तालिका"
          >
            <TableIcon size={13} />
            <span>{isHi ? 'तालिका' : 'Full Table'}</span>
          </button>
        </div>
      </div>

      {/* 3. FOCUSED CROP SUMMARY STRIP */}
      <div className="mb-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">
            {selectedCropTab === 'all'
              ? isHi ? 'कुल वित्तीय ब्यौरा:' : 'Total Summary:'
              : `🌾 ${cropLabel(lang, selectedCropTab)} का बहीखाता:`}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            ({cropFilteredRecords.length} {isHi ? 'प्रविष्टियां' : 'records'})
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1">
            <span className="text-red-400 font-semibold">{isHi ? 'लागत:' : 'Cost:'}</span>
            <span className="font-bold text-red-400">₹{cropSummary.exp.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400 font-semibold">{isHi ? 'बिक्री:' : 'Sales:'}</span>
            <span className="font-bold text-blue-400">₹{cropSummary.sale.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{isHi ? 'शुद्ध लाभ:' : 'Net Profit:'}</span>
            <span className={`font-bold ${cropSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {cropSummary.netProfit >= 0 ? '+' : ''}₹{cropSummary.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
          {cropSummary.yieldQtl > 0 && (
            <>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1 text-cyan-300">
                <span>{isHi ? 'उपज:' : 'Yield:'}</span>
                <span className="font-bold">{cropSummary.yieldQtl} क्विंटल</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. VIEW 1: GROUPED BY CROP */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          {Object.entries(recordsByCrop).map(([cropName, recs]) => {
            const exp = recs.filter((r) => r.type === 'Expense').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
            const sale = recs.filter((r) => r.type === 'Sale').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
            const net = sale - exp;
            return (
              <div
                key={cropName}
                className="rounded-2xl border border-[var(--sk-border)] bg-slate-900/50 overflow-hidden shadow-sm"
              >
                {/* Crop Folder Header */}
                <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      🌾
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{cropLabel(lang, cropName)}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                          {recs.length} {isHi ? 'प्रविष्टियां' : 'entries'}
                        </span>
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-red-300 block">{isHi ? 'कुल लागत' : 'Cost'}</span>
                      <span className="font-bold text-red-400">₹{exp.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-blue-300 block">{isHi ? 'कुल बिक्री' : 'Sales'}</span>
                      <span className="font-bold text-blue-400">₹{sale.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right pl-2 border-l border-slate-800">
                      <span className="text-[10px] text-emerald-300 block font-bold">{isHi ? 'शुद्ध लाभ' : 'Profit'}</span>
                      <span className={`font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {net >= 0 ? '+' : ''}₹{net.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crop Entries Sub-table */}
                <div className="divide-y divide-white/5">
                  {recs.map((record) => {
                    const isSale = record.type === 'Sale';
                    const isPending = isSale && Number(record.remainingAmount || 0) > 0;
                    return (
                      <div
                        key={record.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeClass(
                                record.type
                              )}`}
                            >
                              {record.type === 'Expense'
                                ? record.expenseCategory || typeLabel(lang, record.type)
                                : typeLabel(lang, record.type)}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              📅 {formatDate(record.date)}
                            </span>
                            {record.field && (
                              <span className="text-[11px] text-emerald-300 font-mono">
                                🌱 {record.field}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--sk-muted)] mt-1 truncate">
                            {getDetails(record)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className={`font-bold font-mono text-sm ${getAmountClass(record.type)}`}>
                              {record.type === 'Sale' ? '+' : record.type === 'Expense' ? '-' : ''}
                              {getAmount(record)}
                            </div>
                            {isSale && isPending && (
                              <div className="text-[10px] text-amber-400 font-mono">
                                (बाकी: ₹{record.remainingAmount?.toLocaleString('en-IN')})
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const msg = generateRecordWhatsAppMessage({
                                  crop: record.crop,
                                  field: record.field,
                                  type: record.type,
                                  amount: Number(record.amount) || 0,
                                  quantity: record.quantity,
                                  unit: record.unit,
                                  price: record.price,
                                  date: record.date,
                                  note: record.note,
                                  buyerName: record.buyerName,
                                  worker: record.worker,
                                  remainingAmount: record.remainingAmount,
                                });
                                shareViaWhatsApp(msg);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition cursor-pointer"
                              title="WhatsApp शेयर"
                            >
                              <Share2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEdit(record)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition cursor-pointer"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(record.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(recordsByCrop).length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--sk-dim)]">
              {farmT.noRecords}
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW 2: PASSBOOK CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cropFilteredRecords.map((record) => {
            const isSale = record.type === 'Sale';
            const isPending = isSale && Number(record.remainingAmount || 0) > 0;
            return (
              <div
                key={record.id}
                className="p-3.5 rounded-xl border border-[var(--sk-border)] bg-slate-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        🌾 {cropLabel(lang, record.crop)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeClass(record.type)}`}>
                        {record.type === 'Expense'
                          ? record.expenseCategory || typeLabel(lang, record.type)
                          : typeLabel(lang, record.type)}
                      </span>
                    </div>
                    <div className={`font-mono font-bold text-sm ${getAmountClass(record.type)}`}>
                      {record.type === 'Sale' ? '+' : record.type === 'Expense' ? '-' : ''}
                      {getAmount(record)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[var(--sk-muted)]">
                    {getDetails(record)}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>📅 {formatDate(record.date)}</span>
                    {record.field && <span>🌱 {record.field}</span>}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    {isSale && isPending && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-semibold">
                        बाकी: ₹{record.remainingAmount?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = generateRecordWhatsAppMessage({
                          crop: record.crop,
                          field: record.field,
                          type: record.type,
                          amount: Number(record.amount) || 0,
                          quantity: record.quantity,
                          unit: record.unit,
                          price: record.price,
                          date: record.date,
                          note: record.note,
                          buyerName: record.buyerName,
                          worker: record.worker,
                          remainingAmount: record.remainingAmount,
                        });
                        shareViaWhatsApp(msg);
                      }}
                      className="px-2 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="px-2 py-1 rounded-lg text-blue-400 hover:bg-blue-500/10 active:scale-95 transition text-[11px] font-semibold cursor-pointer"
                    >
                      {isHi ? 'बदलें' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record.id)}
                      className="px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10 active:scale-95 transition text-[11px] font-semibold cursor-pointer"
                    >
                      {isHi ? 'हटाएं' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. VIEW 3: FULL TABLE */}
      {viewMode === 'table' && (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[700px] w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--sk-border)] bg-slate-900/40">
                <th className="px-3 py-3 text-left font-semibold text-[var(--sk-faint)]">
                  {farmT.date}
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--sk-faint)]">
                  {farmT.crop} / खेत
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--sk-faint)]">
                  {farmT.type}
                </th>
                <th className="px-3 py-3 text-left font-semibold text-[var(--sk-faint)]">
                  विवरण / मात्रा
                </th>
                <th className="px-3 py-3 text-right font-semibold text-[var(--sk-faint)]">
                  {farmT.amount}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-[var(--sk-faint)]">
                  {lang === 'hi' ? 'संपादित' : 'Edit'}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-[var(--sk-faint)]">
                  {lang === 'hi' ? 'हटाएं' : 'Delete'}
                </th>
              </tr>
            </thead>
            <tbody>
              {cropFilteredRecords.map((record) => {
                const Icon =
                  record.type === 'Expense' && record.expenseCategory
                    ? EXPENSE_ICONS[record.expenseCategory] || HelpCircle
                    : null;
                const isSale = record.type === 'Sale';
                const isPending = isSale && Number(record.remainingAmount || 0) > 0;
                return (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-mono text-[var(--sk-text2)]">
                        {record.date ? record.date.split('-').reverse().join('/') : '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[var(--sk-text)] flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                          {cropLabel(lang, record.crop)}
                        </span>
                      </div>
                      {(record.field || record.area) && (
                        <div className="mt-1 text-[10px] text-[var(--sk-faint)] font-mono">
                          {record.field || ''}
                          {record.field && record.area ? ' • ' : ''}
                          {record.area ? `${record.area} ${record.areaUnit || ''}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getTypeClass(
                          record.type
                        )}`}
                      >
                        {Icon && <Icon className="w-3 h-3" />}
                        <span>
                          {record.type === 'Expense'
                            ? record.expenseCategory || typeLabel(lang, record.type)
                            : typeLabel(lang, record.type)}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-[240px] px-3 py-3">
                      <div className="text-[var(--sk-muted)] text-[11px] truncate" title={getDetails(record)}>
                        {getDetails(record)}
                      </div>
                      {isSale && (
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {record.price && record.unit === 'Quintal' && (
                            <span className="text-emerald-400 font-mono font-semibold">
                              (₹{record.price}/Qtl)
                            </span>
                          )}
                          {isPending ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                              बाकी: ₹{record.remainingAmount?.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
                              पूर्ण भुगतान
                            </span>
                          )}
                          {record.buyerName && (
                            <span className="text-slate-400 truncate max-w-[120px]">
                              {record.buyerName}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className={`font-bold font-mono text-xs sm:text-sm ${getAmountClass(record.type)}`}>
                        {record.type === 'Sale' ? '+' : record.type === 'Expense' ? '-' : ''}
                        {getAmount(record)}
                      </div>
                      {isSale && Number(record.paidAmount || 0) > 0 && isPending && (
                        <div className="text-[10px] font-mono text-emerald-400">
                          (मिला: ₹{record.paidAmount?.toLocaleString('en-IN')})
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                        title={isHi ? 'संशोधित करें' : 'Edit'}
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDelete(record.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 cursor-pointer"
                        title={isHi ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {cropFilteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[var(--sk-dim)]">
                    {farmT.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {cropFilteredRecords.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-[var(--sk-dim)] font-mono">
          <span>
            {lang === 'hi'
              ? `कुल ${cropFilteredRecords.length} रिकॉर्ड्स प्रदर्शित ${selectedCropTab !== 'all' ? `(${cropLabel(lang, selectedCropTab)})` : ''}`
              : `Showing ${cropFilteredRecords.length} records`}
          </span>
        </div>
      )}
    </FormCard>
  );
}
