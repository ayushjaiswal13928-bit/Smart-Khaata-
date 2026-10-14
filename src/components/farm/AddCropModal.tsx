'use client';

import React, { useState } from 'react';
import { X, Sprout, Plus, Calendar, Scale, Info, Check } from 'lucide-react';
import { Khet, KhetCrop, Lang } from '../../lib/types';
import { cropLabel } from '../../lib/farmI18n';
import { POPULAR_CROPS } from './FarmForm';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  khet: Khet;
  lang: Lang;
  onSaveCrop: (newCrop: KhetCrop) => void;
}

export function AddCropModal({
  isOpen,
  onClose,
  khet,
  lang,
  onSaveCrop,
}: AddCropModalProps) {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const [cropName, setCropName] = useState('Wheat');
  const [customCrop, setCustomCrop] = useState('');
  const [allocatedArea, setAllocatedArea] = useState(() => {
    // Default to remaining area or half of khet area
    const currentCrops = khet.crops || [];
    const usedArea = currentCrops.reduce((acc, c) => acc + (c.allocatedArea || 0), 0);
    const remaining = Math.max(0.5, (khet.totalArea || khet.area || 1) - usedArea);
    return String(remaining);
  });
  const [season, setSeason] = useState('Rabi 2026');
  const [sowingDate, setSowingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [harvestDate, setHarvestDate] = useState('');
  const [status, setStatus] = useState<KhetCrop['status']>('growing');
  const [expectedYield, setExpectedYield] = useState('20');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalName = cropName === 'Other' ? customCrop.trim() : cropName;
    if (!finalName) {
      setError(isHi ? 'कृपया फसल का नाम दर्ज करें।' : 'Crop name is required.');
      return;
    }

    const areaNum = parseFloat(allocatedArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError(isHi ? 'कृपया वैध रकबा (क्षेत्रफल) दर्ज करें।' : 'Please enter a valid allocated area.');
      return;
    }

    const createdCrop: KhetCrop = {
      id: `crop-${khet.id}-${Date.now()}`,
      khetId: khet.id,
      cropName: finalName,
      cropNameHi: cropLabel(lang, finalName),
      season,
      sowingDate,
      harvestDate: harvestDate || undefined,
      allocatedArea: areaNum,
      areaUnit: khet.areaUnit || 'बीघा',
      status,
      expectedYield: parseFloat(expectedYield) || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveCrop(createdCrop);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile drag handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[var(--sk-border)] flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sprout size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isHi ? '+ खेत में नई फसल जोड़ें' : '+ Add Crop to Field'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {khet.name} ({khet.totalArea || khet.area} {khet.areaUnit})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* 1. Crop Selection */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              {isHi ? 'फसल चुनें (Crop):' : 'Select Crop:'} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_CROPS.map((c) => {
                const isSelected = cropName === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCropName(c)}
                    className={`p-2 rounded-xl border text-center transition font-semibold cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cropLabel(lang, c)}
                  </button>
                );
              })}
            </div>
            {cropName === 'Other' && (
              <input
                type="text"
                placeholder={isHi ? 'अन्य फसल का नाम लिखें...' : 'Enter custom crop name...'}
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                className="w-full mt-2 h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
                required
              />
            )}
          </div>

          {/* 2. Allocated Area & Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? `फसल का रकबा (${khet.areaUnit}):` : `Allocated Area (${khet.areaUnit}):`} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={allocatedArea}
                onChange={(e) => setAllocatedArea(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-sm outline-none focus:border-emerald-500"
                placeholder="उदा. 2.5"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isHi ? `खेत का कुल रकबा: ${khet.totalArea || khet.area} ${khet.areaUnit}` : `Total khet area: ${khet.totalArea || khet.area}`}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? 'सीजन (Season):' : 'Season:'} *
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Rabi 2026">{isHi ? 'रबी 2026 (सर्दियां - गेहूं/चना)' : 'Rabi 2026'}</option>
                <option value="Kharif 2026">{isHi ? 'खरीफ 2026 (मानसून - सोयाबीन/धान)' : 'Kharif 2026'}</option>
                <option value="Zaid 2026">{isHi ? 'जायद 2026 (गर्मियां - मूंग/सब्जियां)' : 'Zaid 2026'}</option>
                <option value="Rabi 2027">Rabi 2027</option>
                <option value="Kharif 2027">Kharif 2027</option>
              </select>
            </div>
          </div>

          {/* 3. Sowing & Harvest Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? 'बुवाई की तारीख:' : 'Sowing Date:'} *
              </label>
              <input
                type="date"
                required
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? 'कटाई की तारीख (अनुमानित):' : 'Harvest Date (Est.):'}
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Crop Status & Expected Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? 'फसल की स्थिति (Status):' : 'Crop Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="sown">{isHi ? '🌱 बोई गई (Sown)' : 'Sown'}</option>
                <option value="growing">{isHi ? '🌾 तैयार हो रही है (Growing)' : 'Growing'}</option>
                <option value="harvested">{isHi ? '✅ कटाई हो चुकी (Harvested)' : 'Harvested'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {isHi ? 'अनुमानित कुल पैदावार (क्विंटल):' : 'Expected Yield (Quintals):'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={expectedYield}
                onChange={(e) => setExpectedYield(e.target.value)}
                placeholder="उदा. 35"
                className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              {isHi ? 'विशेष विवरण / बीज की किस्म (Notes):' : 'Notes / Variety:'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isHi ? 'उदा. लोकवन प्रमाणित बीज, मेड़ वाले हिस्से में' : 'e.g. Certified seeds block A'}
              className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--sk-border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-bold"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Check size={16} />
              <span>{isHi ? 'फसल जोड़ें' : 'Save Crop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
