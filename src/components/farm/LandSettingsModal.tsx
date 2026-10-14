import React, { useState } from 'react';
import {
  X,
  Compass,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  LandUnitSettings,
  REGION_PRESETS,
  getLandSettings,
  saveLandSettings,
  DEFAULT_LAND_SETTINGS,
} from '../../lib/landMeasurement';
import { Lang } from '../../lib/types';

interface LandSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  onSettingsSaved?: (newSettings: LandUnitSettings) => void;
}

export function LandSettingsModal({
  isOpen,
  onClose,
  lang,
  onSettingsSaved,
}: LandSettingsModalProps) {
  const isHi = lang === 'hi';
  const [current, setCurrent] = useState<LandUnitSettings>(() => getLandSettings());
  const [selectedPresetId, setSelectedPresetId] = useState<string>(current.presetId || 'mp_standard');
  const [customBighaPerAcre, setCustomBighaPerAcre] = useState<string>(String(current.bighaPerAcre || 2.5));
  const [customBiswaPerBigha, setCustomBiswaPerBigha] = useState<string>(String(current.biswaPerBigha || 20));
  const [customRegionName, setCustomRegionName] = useState<string>(current.regionNameHi || '');
  const [savedAlert, setSavedAlert] = useState(false);

  // Test calculator state
  const [calcInput, setCalcInput] = useState<string>('5');
  const [calcFromUnit, setCalcFromUnit] = useState<'bigha' | 'acre'>('bigha');

  if (!isOpen) return null;

  const isCustom = selectedPresetId === 'custom';

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId !== 'custom') {
      const p = REGION_PRESETS.find((x) => x.id === presetId);
      if (p) {
        setCustomBighaPerAcre(String(p.bighaPerAcre));
        setCustomBiswaPerBigha(String(p.biswaPerBigha));
      }
    }
  };

  const handleSave = () => {
    let bPerA = parseFloat(customBighaPerAcre);
    if (isNaN(bPerA) || bPerA <= 0) bPerA = 2.5;
    let bPerBiswa = parseFloat(customBiswaPerBigha);
    if (isNaN(bPerBiswa) || bPerBiswa <= 0) bPerBiswa = 20;

    let newSettings: LandUnitSettings;
    if (selectedPresetId === 'custom') {
      newSettings = {
        presetId: 'custom',
        bighaPerAcre: bPerA,
        biswaPerBigha: bPerBiswa,
        regionNameHi: customRegionName.trim() || `कस्टम (1 एकड़ = ${bPerA} बीघा)`,
        regionNameEn: customRegionName.trim() || `Custom (1 Acre = ${bPerA} Bigha)`,
        isCustom: true,
      };
    } else {
      const preset = REGION_PRESETS.find((p) => p.id === selectedPresetId);
      newSettings = {
        presetId: selectedPresetId,
        bighaPerAcre: preset ? preset.bighaPerAcre : bPerA,
        biswaPerBigha: preset ? preset.biswaPerBigha : bPerBiswa,
        regionNameHi: preset ? `${preset.nameHi} (1 एकड़ = ${preset.bighaPerAcre} बीघा)` : '',
        regionNameEn: preset ? `${preset.nameEn} (1 Acre = ${preset.bighaPerAcre} Bigha)` : 'Custom',
        isCustom: false,
      };
    }

    saveLandSettings(newSettings);
    setCurrent(newSettings);
    if (onSettingsSaved) onSettingsSaved(newSettings);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    saveLandSettings(DEFAULT_LAND_SETTINGS);
    setCurrent(DEFAULT_LAND_SETTINGS);
    setSelectedPresetId(DEFAULT_LAND_SETTINGS.presetId);
    setCustomBighaPerAcre(String(DEFAULT_LAND_SETTINGS.bighaPerAcre));
    setCustomBiswaPerBigha(String(DEFAULT_LAND_SETTINGS.biswaPerBigha));
    if (onSettingsSaved) onSettingsSaved(DEFAULT_LAND_SETTINGS);
  };

  // Live test result
  const currentRatio = parseFloat(customBighaPerAcre) || 2.5;
  const valNum = parseFloat(calcInput) || 0;
  const convertedValue =
    calcFromUnit === 'bigha'
      ? (valNum / currentRatio).toFixed(2)
      : (valNum * currentRatio).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--sk-border)] flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--sk-text)] flex items-center gap-2">
                {isHi ? 'बीघा व एकड़ इकाई सेटिंग' : 'Bigha & Acre Conversion Setting'}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  {isHi ? 'क्षेत्रीय इकाई' : 'Regional Unit'}
                </span>
              </h2>
              <p className="text-xs text-[var(--sk-muted)]">
                {isHi
                  ? 'अपने राज्य/क्षेत्र अनुसार 1 एकड़ में बीघा का सटीक अनुपात चुनें'
                  : 'Set your regional Bigha per Acre ratio for accurate per-land profit'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Information Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">
                {isHi ? 'भारत में बीघा की माप अलग-अलग है:' : 'Bigha measurement varies across India:'}
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {isHi
                  ? 'पश्चिमी यूपी/हरियाणा में 1 एकड़ = 5 कच्चा बीघा, जबकि पूर्वी यूपी/बिहार में 1 एकड़ = 1.6 पक्का बीघा होता है। सही सेटिंग से आपका प्रति बीघा व प्रति एकड़ मुनाफा 100% सही दिखेगा।'
                  : 'Western UP/Haryana uses 1 Acre = 5 Kaccha Bigha, while Eastern UP/Bihar uses 1 Acre = 1.6 Pucca Bigha. Choosing the right preset ensures exact per-bigha & per-acre profits.'}
              </p>
            </div>
          </div>

          {/* Regional Presets */}
          <div>
            <label className="block text-xs font-bold text-[var(--sk-text)] mb-2">
              {isHi ? 'राज्य / क्षेत्रीय प्रीसेट चुनें:' : 'Select State / Region Preset:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REGION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                        : 'bg-slate-800/40 border-[var(--sk-border)] hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-[var(--sk-text)] flex items-center gap-1.5">
                        {isHi ? preset.nameHi : preset.nameEn}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--sk-muted)] font-mono">
                      {isHi ? preset.descriptionHi : preset.descriptionEn}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/30">
                        1 एकड़ = {preset.bighaPerAcre} बीघा
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Custom Option */}
              <button
                type="button"
                onClick={() => handleSelectPreset('custom')}
                className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                  selectedPresetId === 'custom'
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-950/40'
                    : 'bg-slate-800/40 border-[var(--sk-border)] hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-semibold text-xs text-[var(--sk-text)] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    {isHi ? 'अन्य / कस्टम अनुपात' : 'Custom Ratio'}
                  </span>
                  {selectedPresetId === 'custom' && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {isHi ? 'अपने क्षेत्र का खुद अनुपात दर्ज करें' : 'Enter your own custom land ratio'}
                </div>
                <div className="mt-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-500/30">
                    {isHi ? 'उपयोगकर्ता द्वारा निर्धारित' : 'User Defined'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Ratio Inputs */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-[var(--sk-border)] space-y-3">
            <div className="font-bold text-xs text-[var(--sk-text)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isHi ? 'वर्तमान अनुपात मान:' : 'Current Ratio Inputs:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {isHi ? '1 एकड़ में बीघा संख्या:' : '1 Acre = X Bighas:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="20"
                    disabled={!isCustom}
                    value={customBighaPerAcre}
                    onChange={(e) => setCustomBighaPerAcre(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 border text-[var(--sk-text)] ${
                      isCustom ? 'border-amber-500/50 focus:border-amber-400 focus:outline-none' : 'border-slate-700 opacity-90'
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[var(--sk-muted)]">
                    {isHi ? 'बीघा' : 'Bigha'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {isHi ? '1 बीघा में बिस्वा/कट्ठा:' : '1 Bigha = X Biswa/Kattha:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    disabled={!isCustom}
                    value={customBiswaPerBigha}
                    onChange={(e) => setCustomBiswaPerBigha(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 border text-[var(--sk-text)] ${
                      isCustom ? 'border-amber-500/50 focus:border-amber-400 focus:outline-none' : 'border-slate-700 opacity-90'
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[var(--sk-muted)]">
                    {isHi ? 'बिस्वा' : 'Biswa'}
                  </span>
                </div>
              </div>
            </div>
            {isCustom && (
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {isHi ? 'कस्टम क्षेत्र का नाम (वैकल्पिक):' : 'Custom Region Name (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. मेरा गांव / तहसील' : 'e.g. My Village / Tehsil'}
                  value={customRegionName}
                  onChange={(e) => setCustomRegionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-800 border border-slate-700 text-[var(--sk-text)] focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Live Test Calculator */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {isHi ? 'तुरंत गणना जांचें (Live Calculator):' : 'Live Test Calculator:'}
              </span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalcFromUnit('bigha')}
                  className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer ${
                    calcFromUnit === 'bigha' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {isHi ? 'बीघा ➔ एकड़' : 'Bigha ➔ Acre'}
                </button>
                <button
                  type="button"
                  onClick={() => setCalcFromUnit('acre')}
                  className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer ${
                    calcFromUnit === 'acre' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {isHi ? 'एकड़ ➔ बीघा' : 'Acre ➔ Bigha'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-[var(--sk-text)] text-center focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-xs font-medium text-[var(--sk-muted)]">
                {calcFromUnit === 'bigha' ? (isHi ? 'बीघा बराबर:' : 'Bigha equals:') : (isHi ? 'एकड़ बराबर:' : 'Acre equals:')}
              </span>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm">
                {convertedValue} {calcFromUnit === 'bigha' ? (isHi ? 'एकड़' : 'Acre') : (isHi ? 'बीघा' : 'Bigha')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--sk-border)] flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs text-[var(--sk-muted)] hover:text-red-400 hover:bg-slate-800/80 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isHi ? 'मानक रीसेट' : 'Reset Default'}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-slate-800 transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-900/40 flex items-center gap-2 transition cursor-pointer"
            >
              {savedAlert ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  {isHi ? 'सेटिंग लागू हुई!' : 'Saved!'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  {isHi ? 'अनुपात लागू करें' : 'Apply Setting'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
