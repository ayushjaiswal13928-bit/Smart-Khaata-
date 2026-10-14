'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Warehouse,
  TrendingUp,
  Tag,
  AlertTriangle,
  Calendar,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  X,
  PackageCheck,
  Scale,
} from 'lucide-react';
import type { CropStock, Lang } from '../../lib/types';
import { SAMPLE_MANDI_PRICES } from '../../lib/mandiData';
import { fmt, fmtNum } from '../../lib/utils';
import { FormCard } from '../common/UI';

const STORAGE_KEY = 'sk-crop-stocks';

const INITIAL_STOCKS: CropStock[] = [
  {
    id: 'stock-1',
    crop: 'Wheat',
    quantity: 120,
    unit: 'क्विंटल',
    bagCount: 240,
    location: 'मुख्य गोदाम (कमरा 1)',
    harvestSeason: 'रबी 2025-26',
    storedDate: '2026-04-10',
    quality: 'A-Grade',
    notes: 'शरबती गेहूं, ग्रेडिंग की हुई व सुरक्षित सल्फास ट्रीटेड',
  },
  {
    id: 'stock-2',
    crop: 'Soybean',
    quantity: 45,
    unit: 'क्विंटल',
    bagCount: 90,
    location: 'घर का गोदाम',
    harvestSeason: 'खरीफ 2025',
    storedDate: '2025-10-25',
    quality: 'A-Grade',
    notes: 'JS-9560 बीज ग्रेड',
  },
  {
    id: 'stock-3',
    crop: 'Garlic',
    quantity: 25,
    unit: 'क्विंटल',
    bagCount: 50,
    location: 'हवादार जालीदार शेड',
    harvestSeason: 'रबी 2025-26',
    storedDate: '2026-03-20',
    quality: 'A-Grade',
    notes: 'ऊटी लहसुन, ऊंचे भाव के इंतजार में स्टॉक',
  },
  {
    id: 'stock-4',
    crop: 'Gram',
    quantity: 35,
    unit: 'क्विंटल',
    bagCount: 70,
    location: 'वेयरहाउस (रसीद सं. 402)',
    harvestSeason: 'रबी 2025-26',
    storedDate: '2026-04-02',
    quality: 'B-Grade',
    notes: 'सरकारी गोदाम में सुरक्षित जमा',
  },
];

interface StockSectionProps {
  lang: Lang;
  onNavigateToSale?: (cropName: string, quantity: number) => void;
}

export function StockSection({ lang, onNavigateToSale }: StockSectionProps) {
  const isHi = lang === 'hi';

  const [stocks, setStocks] = useState<CropStock[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_STOCKS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
    }
  }, [stocks]);

  const [search, setSearch] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState<CropStock | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    quantity: '',
    unit: 'क्विंटल',
    bagCount: '',
    location: '',
    harvestSeason: 'रबी 2025-26',
    storedDate: new Date().toISOString().slice(0, 10),
    quality: 'A-Grade',
    notes: '',
  });

  // Map Mandi rate per quintal
  const getMandiRate = (cropName: string) => {
    const item = SAMPLE_MANDI_PRICES.find(
      (m) =>
        m.commodity.toLowerCase() === cropName.toLowerCase() ||
        m.commodityHi.includes(cropName)
    );
    return item ? item.modalPrice : 2500;
  };

  // Calculations
  const metrics = useMemo(() => {
    let totalQuintal = 0;
    let totalBags = 0;
    let totalEstimatedValue = 0;

    stocks.forEach((s) => {
      const q = Number(s.quantity || 0);
      totalQuintal += q;
      totalBags += Number(s.bagCount || 0);
      const rate = getMandiRate(s.crop);
      totalEstimatedValue += q * rate;
    });

    return {
      totalQuintal,
      totalBags,
      totalEstimatedValue,
      cropCount: new Set(stocks.map((s) => s.crop)).size,
    };
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchesSearch =
        s.crop.toLowerCase().includes(search.toLowerCase()) ||
        (s.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchesCrop =
        selectedCropFilter === 'ALL' || s.crop === selectedCropFilter;
      return matchesSearch && matchesCrop;
    });
  }, [stocks, search, selectedCropFilter]);

  const handleOpenAdd = () => {
    setEditingStock(null);
    setFormData({
      crop: 'Wheat',
      quantity: '',
      unit: 'क्विंटल',
      bagCount: '',
      location: '',
      harvestSeason: 'रबी 2025-26',
      storedDate: new Date().toISOString().slice(0, 10),
      quality: 'A-Grade',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (stock: CropStock) => {
    setEditingStock(stock);
    setFormData({
      crop: stock.crop,
      quantity: String(stock.quantity),
      unit: stock.unit || 'क्विंटल',
      bagCount: stock.bagCount ? String(stock.bagCount) : '',
      location: stock.location || '',
      harvestSeason: stock.harvestSeason || 'रबी 2025-26',
      storedDate: stock.storedDate || new Date().toISOString().slice(0, 10),
      quality: stock.quality || 'A-Grade',
      notes: stock.notes || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        isHi
          ? 'क्या आप सचमुच इस स्टॉक प्रविष्टि को हटाना चाहते हैं?'
          : 'Are you sure you want to delete this stock entry?'
      )
    ) {
      setStocks((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(formData.quantity) || 0;
    if (qty <= 0) {
      alert(isHi ? 'कृपया सही मात्रा दर्ज करें' : 'Please enter valid quantity');
      return;
    }

    if (editingStock) {
      setStocks((prev) =>
        prev.map((s) =>
          s.id === editingStock.id
            ? {
                ...s,
                crop: formData.crop,
                quantity: qty,
                unit: formData.unit,
                bagCount: formData.bagCount ? parseInt(formData.bagCount, 10) : undefined,
                location: formData.location,
                harvestSeason: formData.harvestSeason,
                storedDate: formData.storedDate,
                quality: formData.quality,
                notes: formData.notes,
              }
            : s
        )
      );
    } else {
      const newStock: CropStock = {
        id: `stock-${Date.now()}`,
        crop: formData.crop,
        quantity: qty,
        unit: formData.unit,
        bagCount: formData.bagCount ? parseInt(formData.bagCount, 10) : undefined,
        location: formData.location,
        harvestSeason: formData.harvestSeason,
        storedDate: formData.storedDate,
        quality: formData.quality,
        notes: formData.notes,
      };
      setStocks((prev) => [newStock, ...prev]);
    }

    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)] flex items-center gap-2">
            <Boxes className="text-amber-400" />
            <span>{isHi ? 'फसल स्टॉक व गोदाम बहीखाता' : 'Crop Inventory & Warehouse'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi
              ? 'गोदाम में रखी फसल, बोरियों की संख्या और अनुमानित बाजार मूल्यांकन'
              : 'Track stored harvests, bag counts and estimated mandi market valuation'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>{isHi ? 'नया स्टॉक जोड़ें' : 'Add New Stock'}</span>
        </button>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--sk-card)] border border-[var(--sk-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)]">
              {isHi ? 'कुल भंडारित फसल' : 'Total Harvest Stock'}
            </span>
            <Scale size={16} className="text-amber-400" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-amber-400 truncate">
            {fmtNum(metrics.totalQuintal)} <span className="text-xs font-sans text-slate-300">क्विंटल</span>
          </div>
          <p className="text-[10px] text-[var(--sk-dim)] mt-0.5">
            {metrics.cropCount} {isHi ? 'अलग-अलग फसलें' : 'different crops'}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--sk-card)] border border-[var(--sk-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)]">
              {isHi ? 'अनुमानित मंडी मूल्य' : 'Est. Mandi Value'}
            </span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-emerald-400 truncate">
            {fmt(metrics.totalEstimatedValue)}
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">
            {isHi ? 'ताजा मंडी भाव के आधार पर' : 'Based on live mandi rates'}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--sk-card)] border border-[var(--sk-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)]">
              {isHi ? 'कुल बोरियां (पैकेट)' : 'Total Bags'}
            </span>
            <Warehouse size={16} className="text-blue-400" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-bold font-mono text-blue-400 truncate">
            {metrics.totalBags} <span className="text-xs font-sans text-slate-300">{isHi ? 'बोरी' : 'Bags'}</span>
          </div>
          <p className="text-[10px] text-[var(--sk-dim)] mt-0.5">
            {isHi ? 'गोदामों में सुरक्षित' : 'Safely inventoried'}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--sk-card)] border border-[var(--sk-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--sk-muted)]">
              {isHi ? 'भंडारण स्थिति' : 'Storage Status'}
            </span>
            <PackageCheck size={16} className="text-green-400" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-white truncate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isHi ? 'सुरक्षित भंडार' : 'Optimal'}</span>
          </div>
          <p className="text-[10px] text-[var(--sk-dim)] mt-0.5">
            {isHi ? 'कीट व नमी नियंत्रण ठीक' : 'Moisture & pest protected'}
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHi ? 'फसल, गोदाम या टिप्पणी खोजें...' : 'Search crop, location or notes...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)] text-xs text-[var(--sk-text)] placeholder-[var(--sk-muted)] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['ALL', 'Wheat', 'Soybean', 'Garlic', 'Gram'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCropFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                selectedCropFilter === c
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[var(--sk-card)] border border-[var(--sk-border)] text-[var(--sk-muted)] hover:text-white'
              }`}
            >
              {c === 'ALL'
                ? isHi
                  ? 'सभी'
                  : 'All'
                : c === 'Wheat'
                ? isHi
                  ? 'गेहूं'
                  : 'Wheat'
                : c === 'Soybean'
                ? isHi
                  ? 'सोयाबीन'
                  : 'Soybean'
                : c === 'Garlic'
                ? isHi
                  ? 'लहसुन'
                  : 'Garlic'
                : isHi
                ? 'चना'
                : 'Gram'}
            </button>
          ))}
        </div>
      </div>

      {/* STOCK CARDS LIST */}
      <div className="space-y-3">
        {filteredStocks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
            <Boxes size={36} className="mx-auto mb-2 text-slate-500" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
              {isHi ? 'कोई स्टॉक प्रविष्टि नहीं मिली' : 'No stock entries found'}
            </h3>
            <p className="text-xs text-[var(--sk-muted)] mt-1">
              {isHi ? 'नया स्टॉक जोड़ने के लिए ऊपर दिए बटन पर क्लिक करें।' : 'Click Add New Stock above to start tracking.'}
            </p>
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const mandiRate = getMandiRate(stock.crop);
            const estVal = Number(stock.quantity || 0) * mandiRate;

            return (
              <div
                key={stock.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm hover:border-amber-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left Information */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-white">
                      {stock.crop === 'Wheat'
                        ? isHi
                          ? 'गेहूं (Wheat)'
                          : 'Wheat'
                        : stock.crop === 'Soybean'
                        ? isHi
                          ? 'सोयाबीन (Soybean)'
                          : 'Soybean'
                        : stock.crop === 'Garlic'
                        ? isHi
                          ? 'लहसुन (Garlic)'
                          : 'Garlic'
                        : stock.crop === 'Gram'
                        ? isHi
                          ? 'चना (Gram)'
                          : 'Gram'
                        : stock.crop}
                    </span>

                    {stock.quality && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                        {stock.quality}
                      </span>
                    )}

                    {stock.harvestSeason && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {stock.harvestSeason}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--sk-muted)] flex-wrap">
                    {stock.location && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Warehouse size={13} className="text-amber-400" />
                        <span>{stock.location}</span>
                      </span>
                    )}
                    {stock.storedDate && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar size={13} />
                        <span>{stock.storedDate}</span>
                      </span>
                    )}
                    {stock.bagCount && (
                      <span className="text-blue-400 font-semibold">
                        📦 {stock.bagCount} {isHi ? 'बोरी' : 'bags'}
                      </span>
                    )}
                  </div>

                  {stock.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-black/20 p-1.5 rounded-lg border border-white/5 inline-block max-w-full truncate">
                      "{stock.notes}"
                    </p>
                  )}
                </div>

                {/* Right Financial & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <div className="text-base sm:text-lg font-extrabold font-mono text-amber-400">
                      {fmtNum(stock.quantity)} {stock.unit}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                      ≈ {fmt(estVal)}{' '}
                      <span className="text-[9px] text-slate-400 font-sans">
                        (@₹{mandiRate}/क्विं)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onNavigateToSale && (
                      <button
                        type="button"
                        onClick={() => onNavigateToSale(stock.crop, stock.quantity)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title={isHi ? 'इस स्टॉक को बेचें' : 'Sell from stock'}
                      >
                        <ArrowUpRight size={13} />
                        <span className="hidden sm:inline">{isHi ? 'बेचें' : 'Sell'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(stock)}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title={isHi ? 'संशोधन करें' : 'Edit'}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(stock.id)}
                      className="p-1.5 sm:p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
                      title={isHi ? 'हटाएं' : 'Delete'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT STOCK MODAL */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--sk-border)] bg-gradient-to-r from-amber-950/40 via-[var(--sk-card)] to-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Boxes size={16} />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
                  {editingStock
                    ? isHi
                      ? 'स्टॉक विवरण सुधारें'
                      : 'Edit Stock Details'
                    : isHi
                    ? 'नया फसल स्टॉक जोड़ें'
                    : 'Add New Crop Stock'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs flex-1">
              {/* Crop & Quality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'फसल का नाम' : 'Crop'} *
                  </label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Wheat">{isHi ? 'गेहूं (Wheat)' : 'Wheat'}</option>
                    <option value="Soybean">{isHi ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
                    <option value="Garlic">{isHi ? 'लहसुन (Garlic)' : 'Garlic'}</option>
                    <option value="Gram">{isHi ? 'चना (Gram)' : 'Gram'}</option>
                    <option value="Mustard">{isHi ? 'सरसों (Mustard)' : 'Mustard'}</option>
                    <option value="Cotton">{isHi ? 'कपास (Cotton)' : 'Cotton'}</option>
                    <option value="Onion">{isHi ? 'प्याज (Onion)' : 'Onion'}</option>
                    <option value="Corn">{isHi ? 'मक्का (Maize)' : 'Corn'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'गुणवत्ता / ग्रेड' : 'Quality Grade'}
                  </label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="A-Grade">A-Grade (सुपर / बोल्ड दाना)</option>
                    <option value="B-Grade">B-Grade (मध्यम)</option>
                    <option value="C-Grade">C-Grade (साधारण)</option>
                    <option value="बीज ग्रेड">बीज ग्रेड (Certified Seed)</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'कुल मात्रा' : 'Quantity'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="उदा. 50"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'इकाई' : 'Unit'}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="क्विंटल">क्विंटल (Quintal)</option>
                    <option value="बोरी">बोरी (Bags)</option>
                    <option value="किलो">किलोग्राम (Kg)</option>
                    <option value="टन">टन (Tonne)</option>
                  </select>
                </div>
              </div>

              {/* Bags count & Storage location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'बोरियों की संख्या' : 'Bag Count'}
                  </label>
                  <input
                    type="number"
                    value={formData.bagCount}
                    onChange={(e) => setFormData({ ...formData, bagCount: e.target.value })}
                    placeholder={isHi ? 'उदा. 100 बोरी' : 'e.g. 100'}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'भंडारण स्थान (Warehouse)' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={isHi ? 'उदा. मुख्य गोदाम या कमरा 1' : 'e.g. Home Store, Warehouse'}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Harvest Season & Stored Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'फसल सीजन' : 'Harvest Season'}
                  </label>
                  <select
                    value={formData.harvestSeason}
                    onChange={(e) => setFormData({ ...formData, harvestSeason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="रबी 2025-26">रबी 2025-26 (Rabi)</option>
                    <option value="खरीफ 2025">खरीफ 2025 (Kharif)</option>
                    <option value="जायद 2026">जायद 2026 (Zaid)</option>
                    <option value="रबी 2024-25">रबी 2024-25 (Purana Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--sk-text)] mb-1">
                    {isHi ? 'भंडारण की तारीख' : 'Stored Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.storedDate}
                    onChange={(e) => setFormData({ ...formData, storedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-[var(--sk-text)] mb-1">
                  {isHi ? 'विशेष विवरण / दवाई उपचार' : 'Notes & Treatment'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isHi ? 'उदा. सल्फास की गोली रखी है, नमी से सुरक्षित...' : 'e.g. Moisture control treatment applied...'}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--sk-border)] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold shadow-md transition cursor-pointer active:scale-95"
                >
                  {editingStock
                    ? isHi
                      ? 'सुरक्षित करें'
                      : 'Save Changes'
                    : isHi
                    ? 'स्टॉक जोड़ें'
                    : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
