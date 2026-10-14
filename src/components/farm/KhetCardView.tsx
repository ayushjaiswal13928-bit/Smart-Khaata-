'use client';

import React from 'react';
import {
  Sprout,
  Plus,
  Eye,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Wheat,
} from 'lucide-react';
import { FarmRecord, Khet, KhetCrop, Lang } from '../../lib/types';
import { cropLabel } from '../../lib/farmI18n';
import { calculateCropFinancials, calculateKhetFinancials } from '../../lib/farmAccounting';
import { LandUnitSettings, formatDualArea } from '../../lib/landMeasurement';

interface KhetCardViewProps {
  khet: Khet;
  khetCrops: KhetCrop[];
  records: FarmRecord[];
  lang: Lang;
  landSettings: LandUnitSettings;
  onOpenKhetDetail: (khetId: string, filterCropName?: string) => void;
  onAddCrop: (khet: Khet) => void;
  onAddExpenseForCrop: (khet: Khet, crop: KhetCrop) => void;
  onAddHarvestForCrop: (khet: Khet, crop: KhetCrop) => void;
  onAddSaleForCrop: (khet: Khet, crop: KhetCrop) => void;
}

export function KhetCardView({
  khet,
  khetCrops,
  records,
  lang,
  landSettings,
  onOpenKhetDetail,
  onAddCrop,
  onAddExpenseForCrop,
  onAddHarvestForCrop,
  onAddSaleForCrop,
}: KhetCardViewProps) {
  const isHi = lang === 'hi';

  // Get crops belonging to this khet
  const cropsInKhet = khetCrops.filter((c) => c.khetId === khet.id);

  // Fallback if none exist
  const displayCrops: KhetCrop[] =
    cropsInKhet.length > 0
      ? cropsInKhet
      : [
          {
            id: `crop-${khet.id}-default`,
            khetId: khet.id,
            cropName: khet.crop || 'Wheat',
            cropNameHi: cropLabel(lang, khet.crop || 'Wheat'),
            season: khet.season || 'Rabi 2026',
            sowingDate: khet.sowingDate || new Date().toISOString().slice(0, 10),
            allocatedArea: khet.totalArea || khet.area || 1,
            areaUnit: khet.areaUnit || 'बीघा',
            status: 'growing',
          },
        ];

  // Calculate full financials for this khet and its crops
  const khetFinancials = calculateKhetFinancials(records, khet, displayCrops);
  const dualArea = formatDualArea(khet.totalArea || khet.area, khet.areaUnit, landSettings, lang);

  const getStatusBadge = (status: KhetCrop['status']) => {
    switch (status) {
      case 'sown':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            {isHi ? '🌱 बोई गई' : 'Sown'}
          </span>
        );
      case 'harvested':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            {isHi ? '✅ कटाई पूर्ण' : 'Harvested'}
          </span>
        );
      case 'growing':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {isHi ? '🌾 तैयार हो रही' : 'Growing'}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-4 sm:p-5 shadow-sm space-y-4 transition hover:border-emerald-500/40">
      {/* 1. KHET MASTER HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Sprout size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {khet.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                {dualArea.label}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              {khet.soilType && <span>🟤 {khet.soilType.split('(')[0].trim()}</span>}
              {khet.soilType && khet.irrigationSource && <span>•</span>}
              {khet.irrigationSource && <span>💧 {khet.irrigationSource.split('(')[0].trim()}</span>}
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {displayCrops.length} {isHi ? 'फसलें दर्ज' : 'Crops recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Khet */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onAddCrop(khet)}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Plus size={15} />
            <span>{isHi ? '+ फसल जोड़ें' : '+ Add Crop'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenKhetDetail(khet.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>{isHi ? 'खाता विवरण' : 'Ledger'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. KHET ROLL-UP FINANCIAL SUMMARY STRIP (Aggregated from all crops) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#07130e] p-2.5 sm:p-3 rounded-xl border border-[#1a3525] text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'कुल खर्च (लागत)' : 'Total Cost'}</span>
          <div className="text-sm font-bold font-mono text-white mt-0.5">
            ₹{khetFinancials.totalExpense.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'कुल बिक्री' : 'Total Sales'}</span>
          <div className="text-sm font-bold font-mono text-white mt-0.5">
            ₹{khetFinancials.totalSales.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'प्राप्त नकद' : 'Received'}</span>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
            ₹{khetFinancials.paymentReceived.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'बकाया उधारी' : 'Pending Due'}</span>
          <div className={`text-sm font-bold font-mono mt-0.5 ${khetFinancials.pendingDue > 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
            ₹{khetFinancials.pendingDue.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold">{isHi ? 'शुद्ध लाभ' : 'Net Profit'}</span>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              khetFinancials.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {khetFinancials.netProfit >= 0 ? '+' : ''}₹{khetFinancials.netProfit.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'उपज व बचा स्टॉक' : 'Yield / Stock'}</span>
          <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
            {khetFinancials.totalHarvestYieldQuintal} Qtl /{' '}
            <span className="text-emerald-300">{khetFinancials.totalRemainingStockQuintal} Qtl</span>
          </div>
        </div>
      </div>

      {/* 3. CROPS INSIDE THIS KHET */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-400" />
            <span>{isHi ? 'इस खेत की फसलें (Crops in this Field):' : 'Crops planted in this field:'}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {isHi ? 'कंप्यूटर पर टेबल / मोबाइल पर कार्ड' : 'Responsive Table & Card View'}
          </span>
        </div>

        {/* 3A. DESKTOP VIEW: CLEAN TABLE */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">{isHi ? 'फसल' : 'Crop'}</th>
                <th className="py-2.5 px-3 font-semibold">{isHi ? 'रकबा' : 'Area'}</th>
                <th className="py-2.5 px-3 font-semibold">{isHi ? 'सीजन' : 'Season'}</th>
                <th className="py-2.5 px-3 font-semibold">{isHi ? 'स्थिति' : 'Status'}</th>
                <th className="py-2.5 px-3 font-semibold text-right">{isHi ? 'कुल खर्च' : 'Expense'}</th>
                <th className="py-2.5 px-3 font-semibold text-right">{isHi ? 'कुल उपज / बिक्री' : 'Yield / Sale'}</th>
                <th className="py-2.5 px-3 font-semibold text-right">{isHi ? 'शुद्ध लाभ' : 'Net Profit'}</th>
                <th className="py-2.5 px-3 font-semibold text-center">{isHi ? 'त्वरित कार्रवाई' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              {displayCrops.map((crop) => {
                const fin = calculateCropFinancials(records, crop, khet);
                return (
                  <tr key={crop.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>🌾 {cropLabel(lang, crop.cropName)}</span>
                      </div>
                      {crop.notes && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{crop.notes}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-cyan-300">
                      {crop.allocatedArea} {crop.areaUnit || khet.areaUnit}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{crop.season}</td>
                    <td className="py-3 px-3">{getStatusBadge(crop.status)}</td>
                    <td className="py-3 px-3 text-right font-mono text-red-400 font-semibold">
                      ₹{fin.totalExpense.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono text-slate-200">
                        {fin.harvestedYieldQuintal > 0 ? `${fin.harvestedYieldQuintal} Qtl` : '-'}
                      </div>
                      <div className="font-mono text-[10px] text-blue-400">
                        बिक्री: ₹{fin.totalSales.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div
                        className={`font-mono font-bold ${
                          fin.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {fin.netProfit >= 0 ? '+' : ''}₹{fin.netProfit.toLocaleString('en-IN')}
                      </div>
                      {fin.pendingDue > 0 && (
                        <div className="text-[10px] font-mono text-amber-400">
                          बाकी: ₹{fin.pendingDue.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenKhetDetail(khet.id, crop.cropName)}
                          className="px-2 py-1 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] hover:border-emerald-500/40 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="विवरण देखें"
                        >
                          <Eye size={13} className="text-emerald-400" />
                          <span>{isHi ? 'विवरण' : 'View'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddExpenseForCrop(khet, crop)}
                          className="px-2 py-1 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] hover:border-emerald-500/40 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="खर्च जोड़ें"
                        >
                          <TrendingDown size={13} className="text-slate-400" />
                          <span>{isHi ? 'खर्च' : 'Cost'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddHarvestForCrop(khet, crop)}
                          className="px-2 py-1 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] hover:border-emerald-500/40 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="कटाई दर्ज करें"
                        >
                          <Warehouse size={13} className="text-emerald-400" />
                          <span>{isHi ? 'कटाई' : 'Yield'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddSaleForCrop(khet, crop)}
                          className="px-2 py-1 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] hover:border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="बिक्री जोड़ें"
                        >
                          <TrendingUp size={13} className="text-emerald-400" />
                          <span>{isHi ? 'बिक्री' : 'Sale'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3B. MOBILE VIEW: POLISHED INDIVIDUAL CARDS */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {displayCrops.map((crop) => {
            const fin = calculateCropFinancials(records, crop, khet);
            return (
              <div
                key={crop.id}
                className="p-3.5 rounded-xl bg-[#0c1a13] border border-[#1e3c2c] space-y-3 shadow-sm"
              >
                {/* Crop Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                      🌾
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {cropLabel(lang, crop.cropName)}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-300 font-semibold">
                          {crop.allocatedArea} {crop.areaUnit || khet.areaUnit}
                        </span>
                        <span>•</span>
                        <span>{crop.season}</span>
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(crop.status)}</div>
                </div>

                {/* Micro Financial Stats */}
                <div className="grid grid-cols-3 gap-2 bg-[#07130e] p-2 rounded-lg text-center text-xs border border-[#1a3525]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'लागत' : 'Cost'}</span>
                    <span className="font-mono font-bold text-white mt-0.5 block">
                      ₹{fin.totalExpense.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'बिक्री' : 'Sale'}</span>
                    <span className="font-mono font-bold text-white mt-0.5 block">
                      ₹{fin.totalSales.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{isHi ? 'मुनाफा' : 'Profit'}</span>
                    <span
                      className={`font-mono font-bold mt-0.5 block ${
                        fin.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {fin.netProfit >= 0 ? '+' : ''}₹{fin.netProfit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Yield & In-hand remaining stock alert */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                  <span>उपज: <b className="text-white">{fin.harvestedYieldQuintal} Qtl</b></span>
                  <span>बचा स्टॉक: <b className="text-emerald-300">{fin.remainingStockQuintal} Qtl</b></span>
                  {fin.pendingDue > 0 && (
                    <span className="text-emerald-300 font-semibold">
                      बाकी: ₹{fin.pendingDue.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* 4 Action Buttons in Mobile Grid */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#1a3525]">
                  <button
                    type="button"
                    onClick={() => onOpenKhetDetail(khet.id, crop.cropName)}
                    className="py-2 px-1 rounded-lg border border-[#1e3c2c] bg-[#07130e] hover:bg-[#12271c] text-slate-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <Eye size={14} className="text-emerald-400" />
                    <span>{isHi ? 'विवरण' : 'View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddExpenseForCrop(khet, crop)}
                    className="py-2 px-1 rounded-lg border border-[#1e3c2c] bg-[#07130e] hover:bg-[#12271c] text-slate-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <TrendingDown size={14} className="text-slate-400" />
                    <span>{isHi ? '+ खर्च' : '+ Cost'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddHarvestForCrop(khet, crop)}
                    className="py-2 px-1 rounded-lg border border-[#1e3c2c] bg-[#07130e] hover:bg-[#12271c] text-slate-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <Warehouse size={14} className="text-emerald-400" />
                    <span>{isHi ? '+ कटाई' : '+ Yield'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddSaleForCrop(khet, crop)}
                    className="py-2 px-1 rounded-lg border border-[#1e3c2c] bg-[#07130e] hover:bg-[#12271c] text-emerald-300 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span>{isHi ? '+ बिक्री' : '+ Sale'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
