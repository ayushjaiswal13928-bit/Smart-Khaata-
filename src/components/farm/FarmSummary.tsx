'use client';

import React, { type Dispatch, type SetStateAction } from 'react';
import { fmt } from '../../lib/utils';
import { FormCard, InputGroup, selectCls } from '../common/UI';
import { Lang } from '../../lib/types';
import { FARM_STRINGS, unitLabel, cropLabel } from '../../lib/farmI18n';
import {
  Wheat,
  Sparkles,
  Droplets,
  Fuel,
  Users,
  Zap,
  Truck,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

interface FarmSummaryProps {
  lang: Lang;
  totalExpense: number;
  totalSales: number;
  paymentReceived?: number;
  pendingPayment?: number;
  realizedProfit?: number;
  totalYield: number;
  totalYieldQuintal?: number;
  profit: number;
  pieData: {
    name: string;
    value: number;
  }[];
  cropStats: {
    expense: number;
    sale: number;
    paymentReceived?: number;
    pendingPayment?: number;
    realizedProfit?: number;
    yieldQty: number;
    profit: number;
    yieldUnit?: string;
    avgRate?: number;
  };
  selectedCrop: string;
  setSelectedCrop: Dispatch<SetStateAction<string>>;
  crops: string[];
  chartData: {
    month: string;
    farm: number;
  }[];
  pieColors: string[];
}

const CATEGORY_ICONS: Record<string, any> = {
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

export function FarmSummary({
  lang,
  totalExpense,
  totalSales,
  paymentReceived = totalSales,
  pendingPayment = 0,
  realizedProfit = paymentReceived - totalExpense,
  totalYield,
  totalYieldQuintal,
  profit,
  pieData,
  chartData,
  pieColors,
  selectedCrop,
  setSelectedCrop,
  crops,
  cropStats,
}: FarmSummaryProps) {
  const farmT = FARM_STRINGS[lang];
  const isHi = lang === 'hi';
  const totalPie = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* 6-KPI FINANCIAL HEALTH GRID (Unified Dark Green Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* 1. Total Cost */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium">{isHi ? 'कुल लागत' : 'Total Cost'}</div>
          <div className="mt-1 text-base sm:text-lg font-bold font-mono text-white">
            {fmt(totalExpense)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {isHi ? 'खाद, बीज, मशीनरी' : 'Inputs & Machinery'}
          </div>
        </div>

        {/* 2. Total Yield */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium">{isHi ? 'कुल पैदावार' : 'Total Production'}</div>
          <div className="mt-1 text-base sm:text-lg font-bold font-mono text-white">
            {totalYieldQuintal && totalYieldQuintal > 0
              ? `${parseFloat(totalYieldQuintal.toFixed(2))} Qtl`
              : `${totalYield.toFixed(1)} Kg`}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ≈ {Math.round(totalYield)} {isHi ? 'किलो' : 'Kg'}
          </div>
        </div>

        {/* 3. Gross Sales */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium">{isHi ? 'कुल बिक्री मूल्य' : 'Gross Sales'}</div>
          <div className="mt-1 text-base sm:text-lg font-bold font-mono text-white">
            {fmt(totalSales)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {isHi ? 'फसल की कुल कीमत' : 'Total harvest value'}
          </div>
        </div>

        {/* 4. Payment Received */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium">{isHi ? 'प्राप्त नकद (मिला)' : 'Payment Received'}</div>
          <div className="mt-1 text-base sm:text-lg font-bold font-mono text-emerald-400">
            {fmt(paymentReceived)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {isHi ? 'हाथ में आया नकद' : 'Collected cash'}
          </div>
        </div>

        {/* 5. Pending Receivable */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium">{isHi ? 'बकाया रकम (बाकी)' : 'Pending Balance'}</div>
          <div
            className={`mt-1 text-base sm:text-lg font-bold font-mono ${
              pendingPayment > 0 ? 'text-emerald-300' : 'text-slate-400'
            }`}
          >
            {fmt(pendingPayment)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {pendingPayment > 0 ? (isHi ? 'मंडी/व्यापारी से लेनी' : 'Receivable from buyers') : (isHi ? 'हिसाब चुकता' : 'Zero balance')}
          </div>
        </div>

        {/* 6. Realized Net Profit */}
        <div className="rounded-xl border border-[#1e3c2c] bg-[#0c1a13] p-3 shadow-sm">
          <div className="text-[11px] font-semibold flex items-center justify-between text-slate-300">
            <span>{isHi ? 'शुद्ध नकद मुनाफा' : 'Realized Profit'}</span>
            {realizedProfit >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
            )}
          </div>
          <div
            className={`mt-1 text-base sm:text-lg font-bold font-mono ${
              realizedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {realizedProfit >= 0 ? '+' : ''}
            {fmt(realizedProfit)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalExpense > 0
              ? `${Math.round((realizedProfit / totalExpense) * 100)}% ROI`
              : (isHi ? 'नकद प्राप्त आधार' : 'Cash-in-hand basis')}
          </div>
        </div>
      </div>

      {/* CROP AND EXPENSE BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EXPENSE CATEGORIES */}
        <FormCard>
          <div className="text-xs font-bold text-[var(--sk-text)] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
              {isHi ? 'श्रेणीवार खर्च विश्लेषण' : 'Expense by Category'}
            </span>
            <span className="text-[11px] font-mono text-[var(--sk-muted)]">{fmt(totalPie)}</span>
          </div>
          {pieData.length > 0 ? (
            <div className="space-y-2.5">
              {pieData.map((item, idx) => {
                const pct = totalPie > 0 ? Math.round((item.value / totalPie) * 100) : 0;
                const color = pieColors[idx % pieColors.length];
                const Icon = CATEGORY_ICONS[item.name] || HelpCircle;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[var(--sk-muted)] font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {item.name}
                      </span>
                      <span className="font-mono font-semibold text-[var(--sk-text)]">
                        {fmt(item.value)} <span className="text-[10px] text-[var(--sk-faint)]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[var(--sk-dim)]">
              {isHi ? 'कोई खर्च दर्ज नहीं है' : 'No expense data'}
            </div>
          )}
        </FormCard>

        {/* CROP-WISE LEDGER & NET PROFIT */}
        <FormCard>
          <div className="text-xs font-bold text-[var(--sk-text)] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Wheat className="w-3.5 h-3.5" />
              {isHi ? 'फसलवार लाभ एवं उपज' : 'Crop Profit & Yield Breakdown'}
            </span>
          </div>
          <InputGroup label={farmT.crop}>
            <select
              className={selectCls}
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map((c) => (
                <option key={c} value={c}>
                  {cropLabel(lang, c)} ({c})
                </option>
              ))}
            </select>
          </InputGroup>
          <div className="mt-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[var(--sk-muted)]">💸 {farmT.totalExpense} (लागत)</span>
              <span className="font-mono font-semibold text-red-400">{fmt(cropStats.expense)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[var(--sk-muted)]">🌾 {farmT.totalSales} (बिक्री)</span>
              <span className="font-mono font-semibold text-blue-400">{fmt(cropStats.sale)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-emerald-300">💰 {farmT.paymentReceived} (प्राप्त)</span>
              <span className="font-mono font-semibold text-emerald-400">
                {fmt(cropStats.paymentReceived !== undefined ? cropStats.paymentReceived : cropStats.sale)}
              </span>
            </div>
            {cropStats.pendingPayment !== undefined && cropStats.pendingPayment > 0 && (
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-amber-300">⚠️ {farmT.pendingPayment} (बाकी)</span>
                <span className="font-mono font-semibold text-amber-400">{fmt(cropStats.pendingPayment)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[var(--sk-muted)]">⚖️ {farmT.yield} (पैदावार)</span>
              <span className="font-mono font-semibold text-cyan-400">
                {cropStats.yieldQty} {unitLabel(lang, cropStats.yieldUnit || 'Quintal')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span className="text-white">✨ {farmT.realizedProfit} (शुद्ध लाभ)</span>
              <span
                className={`font-mono text-sm ${
                  (cropStats.realizedProfit !== undefined ? cropStats.realizedProfit : cropStats.profit) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {fmt(cropStats.realizedProfit !== undefined ? cropStats.realizedProfit : cropStats.profit)}
              </span>
            </div>
          </div>
        </FormCard>
      </div>

      {/* MONTHLY MINI CHART */}
      {chartData.length > 0 && (
        <FormCard>
          <div className="text-xs font-bold text-[var(--sk-text)] mb-2 flex items-center justify-between">
            <span>{isHi ? 'मासिक शुद्ध कैशफ्लो (मुनाफा)' : 'Monthly Farm Net Cashflow'}</span>
            <span className="text-[10px] text-[var(--sk-muted)]">{isHi ? 'चालू वर्ष' : 'Current Year'}</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 items-end h-24 pt-4">
            {chartData.map((d) => {
              const max = Math.max(...chartData.map((x) => Math.abs(x.farm)), 1000);
              const heightPct = Math.min(100, Math.max(10, Math.round((Math.abs(d.farm) / max) * 80)));
              const isPositive = d.farm >= 0;
              return (
                <div key={d.month} className="flex flex-col items-center h-full justify-end group">
                  <div
                    className={`w-full max-w-[20px] rounded-t transition-all ${
                      isPositive ? 'bg-emerald-500/80 group-hover:bg-emerald-400' : 'bg-red-500/80 group-hover:bg-red-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${d.month}: ${fmt(d.farm)}`}
                  />
                  <span className="text-[9px] text-[var(--sk-dim)] mt-1 truncate max-w-full">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </FormCard>
      )}
    </div>
  );
}
