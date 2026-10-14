'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import {
  Wheat,
  X,
  AlertCircle,
  Sparkles,
  Check,
  User,
  Store,
  Droplets,
  Fuel,
  Users,
  Zap,
  Truck,
  HelpCircle,
  IndianRupee,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import type { FarmRecord, Lang, Khet, KhetCrop } from '../../lib/types';
import { cropLabel } from '../../lib/farmI18n';
import { formatDualArea, getLandSettings } from '../../lib/landMeasurement';
import { parseVoiceInput } from '../../lib/voiceParser';

interface FarmFormProps {
  lang: Lang;
  farmT?: any;
  editingRecord: FarmRecord | null;
  initialType?: TransactionType;
  fixedKhet?: Khet | null;
  fixedCrop?: KhetCrop | null;
  khets?: Khet[];
  khetCrops?: KhetCrop[];
  onSave: (record: FarmRecord) => void;
  onCancel: () => void;
}

type TransactionType = FarmRecord['type'];

export const POPULAR_CROPS = [
  'Wheat',
  'Soybean',
  'Gram',
  'Mustard',
  'Rice',
  'Cotton',
  'Maize',
  'Garlic',
  'Groundnut',
  'Onion',
  'Potato',
  'Tomato',
  'Sugarcane',
  'Bajra',
  'Jowar',
  'Peas',
  'Other',
] as const;

export const UNIT_OPTIONS = [
  'Quintal',
  'Kg',
  'Ton',
  'बोरी (Bags)',
  'लीटर (Liters)',
  'घंटे (Hours)',
  'दिन (Days)',
] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'बीज', hi: 'बीज (Seeds)', en: 'Seeds', icon: Wheat, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'खाद', hi: 'खाद (Fertilizer)', en: 'Fertilizer', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'कीटनाशक', hi: 'कीटनाशक (Pesticide)', en: 'Pesticide', icon: Droplets, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { value: 'डीजल/ट्रैक्टर', hi: 'डीजल / ट्रैक्टर', en: 'Diesel / Tractor', icon: Fuel, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { value: 'मजदूरी', hi: 'मजदूरी (Labor)', en: 'Labor', icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { value: 'सिंचाई', hi: 'सिंचाई (Irrigation)', en: 'Irrigation', icon: Droplets, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'बिजली', hi: 'बिजली (Electricity)', en: 'Electricity', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { value: 'ढुलाई', hi: 'ढुलाई (Transport)', en: 'Transport', icon: Truck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { value: 'अन्य', hi: 'अन्य (Other)', en: 'Other', icon: HelpCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
];

export function FarmForm({
  lang,
  editingRecord,
  initialType,
  onSave,
  onCancel,
  fixedKhet,
  fixedCrop,
  khets = [],
  khetCrops = [],
}: FarmFormProps) {
  const isHindi = lang === 'hi';
  const landSettings = getLandSettings();

  // Form State
  const [form, setForm] = useState(() => {
    const defaultType: TransactionType = (editingRecord?.type || initialType || 'Expense') as TransactionType;
    if (editingRecord) {
      const q = editingRecord.quantity ? String(editingRecord.quantity) : '';
      const p = editingRecord.price ? String(editingRecord.price) : '';
      const amt = editingRecord.amount ? String(editingRecord.amount) : '';
      const pd = editingRecord.paidAmount !== undefined ? String(editingRecord.paidAmount) : amt;
      const rem =
        editingRecord.remainingAmount !== undefined
          ? String(editingRecord.remainingAmount)
          : String(Math.max(0, (parseFloat(amt) || 0) - (parseFloat(pd) || 0)));
      return {
        date: editingRecord.date || new Date().toISOString().slice(0, 10),
        khetId: editingRecord.khetId || '',
        cropId: editingRecord.cropId || '',
        crop: editingRecord.crop || 'Wheat',
        customCrop: '',
        season: editingRecord.season || 'Rabi 2026',
        field: editingRecord.field || '',
        customField: '',
        isCustomField: false,
        area: editingRecord.area !== undefined ? String(editingRecord.area) : '',
        areaUnit: editingRecord.areaUnit || 'बीघा',
        type: defaultType,
        expenseCategory: editingRecord.expenseCategory || 'खाद',
        quantity: q,
        unit: editingRecord.unit || 'Quintal',
        price: p,
        worker: editingRecord.worker || '',
        machine: editingRecord.machine || '',
        note: editingRecord.note || '',
        amount: amt,
        paidAmount: pd,
        remainingAmount: rem,
        buyerName: editingRecord.buyerName || '',
        paymentStatus: editingRecord.paymentStatus || 'Received',
        partnerId: editingRecord.partnerId || '',
        paidBy: (editingRecord.paidBy || 'me') as 'me' | 'partner' | 'shared',
        partnerSharePercent:
          editingRecord.partnerSharePercent !== undefined
            ? String(editingRecord.partnerSharePercent)
            : '50',
      };
    }

    const defaultKhetId = fixedKhet?.id || fixedCrop?.khetId || (khets[0]?.id || '');
    const defaultKhetObj = fixedKhet || khets.find((k) => k.id === defaultKhetId) || null;
    const defaultCropObj = fixedCrop || khetCrops.find((c) => c.khetId === defaultKhetId) || null;

    return {
      date: new Date().toISOString().slice(0, 10),
      khetId: defaultKhetId,
      cropId: defaultCropObj?.id || '',
      crop: defaultCropObj?.cropName || defaultKhetObj?.crop || 'Wheat',
      customCrop: '',
      season: defaultCropObj?.season || 'Rabi 2026',
      field: defaultKhetObj?.name || '',
      customField: '',
      isCustomField: false,
      area: defaultCropObj ? String(defaultCropObj.allocatedArea) : (defaultKhetObj?.area !== undefined ? String(defaultKhetObj.area) : ''),
      areaUnit: defaultCropObj?.areaUnit || defaultKhetObj?.areaUnit || 'बीघा',
      type: defaultType,
      expenseCategory: 'खाद',
      quantity: '',
      unit: 'Quintal',
      price: '',
      worker: '',
      machine: '',
      note: '',
      amount: '',
      paidAmount: '',
      remainingAmount: '',
      buyerName: '',
      paymentStatus: 'Received' as 'Received' | 'Pending' | 'Partial',
      partnerId: '',
      paidBy: 'me' as 'me' | 'partner' | 'shared',
      partnerSharePercent: '50',
    };
  });

  const [error, setError] = useState<string | null>(null);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback(
        isHindi
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है।'
          : 'Voice recognition not available in this browser.'
      );
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback(isHindi ? 'सुन रहा हूँ... बोलिए (उदा. "डीजल 1200" या "सोयाबीन 20 क्विंटल 4600 भाव")' : 'Listening... Speak now');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setVoiceFeedback(`पहचाना: "${transcript}"`);
        const parsed = parseVoiceInput(transcript);
        setForm((prev) => {
          const next = { ...prev };
          if (parsed.type) next.type = parsed.type;
          if (parsed.crop) next.crop = parsed.crop;
          if (parsed.expenseCategory) next.expenseCategory = parsed.expenseCategory;
          if (parsed.amount) {
            next.amount = String(parsed.amount);
            if (next.type === 'Sale') {
              next.paidAmount = String(parsed.amount);
              next.remainingAmount = '0';
            }
          }
          if (parsed.quantity) next.quantity = String(parsed.quantity);
          if (parsed.unit) next.unit = parsed.unit;
          if (parsed.note) next.note = parsed.note;
          return next;
        });
        setTimeout(() => setVoiceFeedback(null), 4000);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setVoiceFeedback(isHindi ? 'आवाज़ साफ़ सुनाई नहीं दी, कृपया दोबारा बोलें।' : 'Could not recognize audio. Try again.');
        setTimeout(() => setVoiceFeedback(null), 3000);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (editingRecord) {
      const isKnownCrop = (POPULAR_CROPS as readonly string[]).includes(editingRecord.crop as any);
      const isKnownKhet = khets.some(
        (k) => k.name.trim().toLowerCase() === (editingRecord.field || '').trim().toLowerCase()
      );
      const amt = editingRecord.amount ? String(editingRecord.amount) : '';
      const pd = editingRecord.paidAmount !== undefined ? String(editingRecord.paidAmount) : amt;
      const rem =
        editingRecord.remainingAmount !== undefined
          ? String(editingRecord.remainingAmount)
          : String(Math.max(0, (parseFloat(amt) || 0) - (parseFloat(pd) || 0)));
      setForm({
        date: editingRecord.date || new Date().toISOString().slice(0, 10),
        khetId: editingRecord.khetId || '',
        cropId: editingRecord.cropId || '',
        crop: isKnownCrop ? editingRecord.crop : 'Other',
        customCrop: isKnownCrop ? '' : editingRecord.crop,
        season: editingRecord.season || 'Rabi 2026',
        field: editingRecord.field || '',
        customField: !isKnownKhet && editingRecord.field ? editingRecord.field : '',
        isCustomField: !isKnownKhet && Boolean(editingRecord.field),
        area: editingRecord.area !== undefined ? String(editingRecord.area) : '',
        areaUnit: editingRecord.areaUnit || 'बीघा',
        type: (editingRecord.type || 'Expense') as TransactionType,
        expenseCategory: editingRecord.expenseCategory || 'खाद',
        quantity: editingRecord.quantity ? String(editingRecord.quantity) : '',
        unit: editingRecord.unit || 'Quintal',
        price: editingRecord.price ? String(editingRecord.price) : '',
        worker: editingRecord.worker || '',
        machine: editingRecord.machine || '',
        note: editingRecord.note || '',
        amount: amt,
        paidAmount: pd,
        remainingAmount: rem,
        buyerName: editingRecord.buyerName || '',
        paymentStatus: editingRecord.paymentStatus || 'Received',
        partnerId: editingRecord.partnerId || '',
        paidBy: (editingRecord.paidBy || 'me') as 'me' | 'partner' | 'shared',
        partnerSharePercent:
          editingRecord.partnerSharePercent !== undefined
            ? String(editingRecord.partnerSharePercent)
            : '50',
      });
    }
  }, [editingRecord, khets]);

  const handleQuantityOrPriceChange = (field: 'quantity' | 'price', val: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      const q = parseFloat(next.quantity || '0');
      const p = parseFloat(next.price || '0');
      if (!isNaN(q) && q > 0 && !isNaN(p) && p > 0) {
        const total = Math.round(q * p * 100) / 100;
        next.amount = String(total);
        if (next.type === 'Sale') {
          if (!next.paidAmount || next.paidAmount === prev.amount) {
            next.paidAmount = String(total);
            next.remainingAmount = '0';
            next.paymentStatus = 'Received';
          } else {
            const currentPaid = parseFloat(next.paidAmount) || 0;
            const remaining = Math.max(0, Math.round((total - currentPaid) * 100) / 100);
            next.remainingAmount = String(remaining);
            next.paymentStatus = remaining === 0 ? 'Received' : currentPaid > 0 ? 'Partial' : 'Pending';
          }
        }
      }
      return next;
    });
  };

  const handleAmountChange = (amtVal: string) => {
    setForm((prev) => {
      const total = parseFloat(amtVal) || 0;
      let paid = parseFloat(prev.paidAmount) || 0;
      if (prev.type === 'Sale') {
        if (!prev.paidAmount || prev.paidAmount === prev.amount) {
          paid = total;
        }
        const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);
        return {
          ...prev,
          amount: amtVal,
          paidAmount: String(paid),
          remainingAmount: String(remaining),
          paymentStatus: remaining === 0 ? 'Received' : paid > 0 ? 'Partial' : 'Pending',
        };
      }
      return { ...prev, amount: amtVal };
    });
  };

  const handlePaidAmountChange = (paidVal: string) => {
    setForm((prev) => {
      const total = parseFloat(prev.amount) || 0;
      const paid = parseFloat(paidVal) || 0;
      const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);
      let status: 'Received' | 'Pending' | 'Partial' = 'Received';
      if (paid <= 0 && total > 0) status = 'Pending';
      else if (remaining > 0) status = 'Partial';
      return {
        ...prev,
        paidAmount: paidVal,
        remainingAmount: String(remaining),
        paymentStatus: status,
      };
    });
  };

  const setQuickPayment = (status: 'Full' | 'Half' | 'Pending') => {
    const total = parseFloat(form.amount) || 0;
    if (status === 'Full') {
      setForm((prev) => ({
        ...prev,
        paidAmount: String(total),
        remainingAmount: '0',
        paymentStatus: 'Received',
      }));
    } else if (status === 'Half') {
      const half = Math.round((total / 2) * 100) / 100;
      setForm((prev) => ({
        ...prev,
        paidAmount: String(half),
        remainingAmount: String(total - half),
        paymentStatus: 'Partial',
      }));
    } else if (status === 'Pending') {
      setForm((prev) => ({
        ...prev,
        paidAmount: '0',
        remainingAmount: String(total),
        paymentStatus: 'Pending',
      }));
    }
  };

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleKhetSelect = (selectedName: string) => {
    if (selectedName === '__custom__') {
      setForm((prev) => ({
        ...prev,
        isCustomField: true,
        field: prev.customField,
        khetId: '',
        cropId: '',
      }));
      return;
    }
    if (!selectedName) {
      setForm((prev) => ({
        ...prev,
        isCustomField: false,
        field: '',
        khetId: '',
        cropId: '',
        area: '',
      }));
      return;
    }
    const matched = khets.find((k) => k.name === selectedName);
    const khetCropsForKhet = matched ? khetCrops.filter((c) => c.khetId === matched.id) : [];
    const defaultCrop = khetCropsForKhet[0];

    setForm((prev) => ({
      ...prev,
      isCustomField: false,
      khetId: matched?.id || '',
      field: selectedName,
      cropId: defaultCrop?.id || '',
      crop: defaultCrop?.cropName || matched?.crop || prev.crop,
      season: defaultCrop?.season || matched?.season || prev.season,
      area: defaultCrop ? String(defaultCrop.allocatedArea) : (matched?.totalArea || matched?.area !== undefined ? String(matched.totalArea || matched.area) : prev.area),
      areaUnit: defaultCrop?.areaUnit || matched?.areaUnit || prev.areaUnit,
    }));
  };

  const handleCropSelect = (selectedVal: string) => {
    if (selectedVal === '__custom__' || selectedVal === 'Other') {
      setForm((prev) => ({
        ...prev,
        crop: 'Other',
        cropId: '',
      }));
      return;
    }

    const foundByCropId = khetCrops.find((c) => c.id === selectedVal);
    if (foundByCropId) {
      setForm((prev) => ({
        ...prev,
        cropId: foundByCropId.id,
        crop: foundByCropId.cropName,
        customCrop: '',
        season: foundByCropId.season || prev.season,
        area: String(foundByCropId.allocatedArea || prev.area),
        areaUnit: foundByCropId.areaUnit || prev.areaUnit,
      }));
      return;
    }

    const foundByNameInKhet = khetCrops.find(
      (c) => (!form.khetId || c.khetId === form.khetId) && c.cropName === selectedVal
    );

    setForm((prev) => ({
      ...prev,
      crop: selectedVal,
      cropId: foundByNameInKhet?.id || '',
      customCrop: '',
      season: foundByNameInKhet?.season || prev.season,
      area: foundByNameInKhet ? String(foundByNameInKhet.allocatedArea) : prev.area,
      areaUnit: foundByNameInKhet?.areaUnit || prev.areaUnit,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const quantity = parseFloat(form.quantity || '0') || 0;
    const price = parseFloat(form.price || '0') || 0;
    let amount = parseFloat(form.amount || '0') || 0;

    if (amount <= 0 && quantity > 0 && price > 0) {
      amount = Math.round(quantity * price * 100) / 100;
    }

    if (form.type !== 'Yield' && amount <= 0) {
      setError(
        isHindi
          ? 'कृपया कुल राशि (रकम ₹) दर्ज करें या मात्रा व भाव भरें।'
          : 'Please enter total amount (₹) or fill quantity and rate.'
      );
      return;
    }
    if (form.type === 'Yield' && quantity <= 0) {
      setError(
        isHindi
          ? 'कृपया कुल पैदावार / उपज मात्रा दर्ज करें।'
          : 'Please enter total yield quantity.'
      );
      return;
    }

    const finalCrop =
      form.crop === 'Other' && form.customCrop.trim()
        ? form.customCrop.trim()
        : form.crop;

    let finalField = form.field;
    if (form.isCustomField && form.customField.trim()) {
      finalField = form.customField.trim();
    }

    let finalArea = form.area ? parseFloat(form.area) : undefined;
    if (isNaN(finalArea as number)) finalArea = undefined;

    let paidAmount = amount;
    let remainingAmount = 0;
    let paymentStatus: 'Received' | 'Pending' | 'Partial' = 'Received';
    if (form.type === 'Sale') {
      paidAmount = form.paidAmount !== '' ? parseFloat(form.paidAmount) || 0 : amount;
      remainingAmount = Math.max(0, Math.round((amount - paidAmount) * 100) / 100);
      if (paidAmount <= 0 && amount > 0) paymentStatus = 'Pending';
      else if (remainingAmount > 0) paymentStatus = 'Partial';
      else paymentStatus = 'Received';
    }

    const record: FarmRecord = {
      id: editingRecord?.id || `farm-${Date.now()}`,
      date: form.date,
      type: form.type,
      crop: finalCrop,
      khetId: form.khetId || undefined,
      cropId: form.cropId || undefined,
      expenseCategory: form.type === 'Expense' ? form.expenseCategory : '',
      amount,
      quantity,
      unit: form.unit,
      price: price > 0 ? price : 0,
      note: form.note.trim(),
      field: finalField.trim(),
      area: finalArea,
      areaUnit: form.areaUnit,
      worker: form.worker.trim(),
      machine: form.machine.trim(),
      season: form.season.trim(),
      paidAmount,
      remainingAmount,
      paymentStatus,
      buyerName: form.buyerName.trim(),
      ratePerQuintal: form.unit === 'Quintal' ? price : undefined,
      partnerId: form.partnerId || undefined,
      paidBy: form.paidBy,
      partnerSharePercent: parseFloat(form.partnerSharePercent) || 50,
    };

    onSave(record);
  };

  const areaNum = parseFloat(form.area || '0');
  const dualArea = areaNum > 0 ? formatDualArea(areaNum, form.areaUnit, landSettings, lang) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--sk-border)] flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--sk-text)] flex items-center gap-2">
                {editingRecord
                  ? isHindi ? 'बहीखाता रिकॉर्ड संपादित करें' : 'Edit Farm Record'
                  : isHindi ? 'नया हिसाब दर्ज करें' : 'Add Farm Record'}
              </h2>
              <p className="text-xs text-[var(--sk-muted)]">
                {isHindi
                  ? 'लागत खर्च, पैदावार या फसल बिक्री का तुरंत हिसाब जोड़ें'
                  : 'Input expense, harvest yield or crop sale with live profit tracking'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceRecognition}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-red-900/50'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={isListening ? 'सुन रहा हूँ...' : 'बोलकर लिखें (Voice Typing)'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  <span>सुन रहा हूँ...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>बोलकर लिखें</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {voiceFeedback && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{voiceFeedback}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--sk-text)] mb-2">
              {isHindi ? 'लेनदेन प्रकार (Transaction Type):' : 'Transaction Type:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateField('type', 'Expense')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  form.type === 'Expense'
                    ? 'bg-red-500/15 border-red-500 text-red-300 shadow-sm shadow-red-950'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>लागत खर्च</span>
                <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                  {isHindi ? 'खाद, बीज, डीजल आदि' : 'Inputs & Costs'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => updateField('type', 'Yield')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  form.type === 'Yield'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>उपज / पैदावार</span>
                <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                  {isHindi ? 'खेत से प्राप्त उपज' : 'Harvest Yield'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  updateField('type', 'Sale');
                  if (form.amount && !form.paidAmount) {
                    updateField('paidAmount', form.amount);
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                  form.type === 'Sale'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>फसल बिक्री</span>
                <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                  {isHindi ? 'मंडी में बिक्री व भुगतान' : 'Sales & Payment'}
                </span>
              </button>
            </div>
          </div>

          {/* EXPENSE CATEGORIES */}
          {form.type === 'Expense' && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--sk-border)] space-y-2">
              <label className="block text-xs font-bold text-[var(--sk-text)]">
                {isHindi ? 'खर्च की श्रेणी चुनें:' : 'Select Expense Category:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = form.expenseCategory === cat.value;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField('expenseCategory', cat.value)}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? `${cat.color} font-bold shadow-sm`
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs truncate">{isHindi ? cat.hi.split(' ')[0] : cat.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Field and Crop Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'खेत (Field):' : 'Select Field:'}
              </label>
              {fixedKhet ? (
                <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>{fixedKhet.name}</span>
                  <span className="text-[11px] text-[var(--sk-muted)] font-normal">
                    {fixedKhet.area} {fixedKhet.areaUnit}
                  </span>
                </div>
              ) : (
                <select
                  value={form.isCustomField ? '__custom__' : form.field}
                  onChange={(e) => handleKhetSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">{isHindi ? '-- खेत चुनें --' : '-- Select Field --'}</option>
                  {khets.map((k) => (
                    <option key={k.id} value={k.name}>
                      {k.name} ({k.area} {k.areaUnit}{k.crop ? ` - ${cropLabel(lang, k.crop)}` : ''})
                    </option>
                  ))}
                  <option value="__custom__">{isHindi ? '+ नया / अन्य खेत...' : '+ Other / Custom field...'}</option>
                </select>
              )}
              {form.isCustomField && !fixedKhet && (
                <input
                  type="text"
                  placeholder={isHindi ? 'खेत का नाम लिखें' : 'Enter field name'}
                  value={form.customField}
                  onChange={(e) => updateField('customField', e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'फसल (Crop):' : 'Crop:'}
              </label>
              {(() => {
                const selectedKhetObj =
                  fixedKhet ||
                  khets.find(
                    (k) =>
                      k.id === form.khetId ||
                      (form.field && k.name.trim().toLowerCase() === form.field.trim().toLowerCase())
                  );
                const cropsForCurrentKhet = selectedKhetObj
                  ? khetCrops.filter((c) => c.khetId === selectedKhetObj.id)
                  : [];

                if (cropsForCurrentKhet.length > 0) {
                  return (
                    <>
                      <select
                        value={form.cropId ? form.cropId : form.crop}
                        onChange={(e) => handleCropSelect(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">
                          {isHindi ? '-- इस खेत की फसल चुनें --' : '-- Select Crop from this Field --'}
                        </option>
                        {cropsForCurrentKhet.map((c) => (
                          <option key={c.id} value={c.id}>
                            🌾 {cropLabel(lang, c.cropName)} ({c.allocatedArea} {c.areaUnit || selectedKhetObj?.areaUnit} - {c.season})
                          </option>
                        ))}
                        <option value="__custom__">
                          {isHindi ? '+ अन्य फसल चुनें...' : '+ Other Crop...'}
                        </option>
                      </select>
                      {form.crop === 'Other' && (
                        <input
                          type="text"
                          placeholder={isHindi ? 'फसल का नाम लिखें' : 'Enter crop name'}
                          value={form.customCrop}
                          onChange={(e) => updateField('customCrop', e.target.value)}
                          className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                        />
                      )}
                    </>
                  );
                }

                return (
                  <>
                    <select
                      value={form.crop}
                      onChange={(e) => handleCropSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      {POPULAR_CROPS.map((c) => (
                        <option key={c} value={c}>
                          {cropLabel(lang, c)} ({c})
                        </option>
                      ))}
                    </select>
                    {form.crop === 'Other' && (
                      <input
                        type="text"
                        placeholder={isHindi ? 'फसल का नाम लिखें' : 'Enter crop name'}
                        value={form.customCrop}
                        onChange={(e) => updateField('customCrop', e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Date, Season, and Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'तारीख (Date):' : 'Date:'}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'सीजन / बैच:' : 'Season / Batch:'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'रबी 2026 / खरीफ' : 'e.g. Rabi 2026'}
                value={form.season}
                onChange={(e) => updateField('season', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'क्षेत्रफल (Area):' : 'Area:'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="3"
                  value={form.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] font-mono focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={form.areaUnit}
                  onChange={(e) => updateField('areaUnit', e.target.value)}
                  className="px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:outline-none cursor-pointer"
                >
                  <option value="बीघा">बीघा</option>
                  <option value="एकड़">एकड़</option>
                  <option value="हेक्टेयर">हेक्टेयर</option>
                </select>
              </div>
              {dualArea && (
                <div className="text-[10px] text-emerald-400 font-mono mt-1">
                  {dualArea.secondary}
                </div>
              )}
            </div>
          </div>

          {/* QUANTITY, UNIT, RATE, AMOUNT */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-[var(--sk-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--sk-text)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {form.type === 'Sale'
                  ? isHindi ? 'बिक्री मात्रा व भाव विवरण:' : 'Sales & Rate Details:'
                  : form.type === 'Yield'
                  ? isHindi ? 'पैदावार मात्रा विवरण:' : 'Harvest Quantity:'
                  : isHindi ? 'मात्रा व दर विवरण:' : 'Quantity & Cost:'}
              </span>
              {form.quantity && form.price && (
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {form.quantity} × ₹{form.price} = ₹{Math.round(parseFloat(form.quantity) * parseFloat(form.price)).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {form.type === 'Sale'
                    ? isHindi ? 'बिक्री मात्रा:' : 'Quantity Sold:'
                    : form.type === 'Yield'
                    ? isHindi ? 'उपज मात्रा:' : 'Yield Quantity:'
                    : isHindi ? 'मात्रा:' : 'Quantity:'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="उदा. 20"
                  value={form.quantity}
                  onChange={(e) => handleQuantityOrPriceChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {isHindi ? 'इकाई (Unit):' : 'Unit:'}
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u === 'Quintal' ? 'क्विंटल (Quintal)' : u === 'Kg' ? 'किलो (Kg)' : u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {form.type === 'Sale'
                    ? isHindi ? 'भाव (₹/क्विंटल दर):' : 'Rate per Quintal (₹):'
                    : form.type === 'Yield'
                    ? isHindi ? 'अनुमानित भाव (₹/क्विंटल):' : 'Estimated Rate (₹/Qtl):'
                    : isHindi ? 'प्रति इकाई दर (₹):' : 'Rate per unit (₹):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-[var(--sk-muted)] font-mono">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="उदा. 2650"
                    value={form.price}
                    onChange={(e) => handleQuantityOrPriceChange('price', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {form.type !== 'Yield' && (
              <div>
                <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                  {form.type === 'Sale'
                    ? isHindi ? 'कुल बिक्री मूल्य (रकम ₹):' : 'Gross Sale Value (₹):'
                    : isHindi ? 'कुल खर्च राशि (रकम ₹):' : 'Total Cost Amount (₹):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-[var(--sk-muted)] font-mono">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                {/* Quick Add Amount Buttons for Fast Mobile Tap */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">{isHindi ? 'त्वरित जोड़ें:' : 'Quick Add:'}</span>
                  {[500, 1000, 2000, 5000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(form.amount || '0') || 0;
                        handleAmountChange(String(cur + inc));
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-300 border border-slate-700 active:scale-95 transition cursor-pointer"
                    >
                      +₹{inc}
                    </button>
                  ))}
                  {form.amount && parseFloat(form.amount) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAmountChange('')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 border border-slate-700 active:scale-95 transition cursor-pointer"
                    >
                      {isHindi ? 'हटाएं' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SALE SPECIFIC SETTLEMENT */}
          {form.type === 'Sale' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {isHindi ? 'भुगतान व खरीदार निपटान:' : 'Payment & Buyer Settlement:'}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickPayment('Full')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer"
                  >
                    {isHindi ? 'पूरा नकद प्राप्त' : 'Full Paid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPayment('Half')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                  >
                    {isHindi ? 'आधा प्राप्त' : 'Half Paid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPayment('Pending')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 cursor-pointer"
                  >
                    {isHindi ? 'पूरा बाकी' : 'Full Pending'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-emerald-300 font-semibold mb-1">
                    {isHindi ? 'प्राप्त राशि (नकद मिला ₹):' : 'Payment Received (₹):'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-emerald-400 font-mono">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.paidAmount}
                      onChange={(e) => handlePaidAmountChange(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-800 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-amber-300 font-semibold mb-1">
                    {isHindi ? 'बकाया राशि (लेनी बाकी ₹):' : 'Pending Balance (₹):'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-amber-400 font-mono">₹</span>
                    <input
                      type="number"
                      readOnly
                      value={form.remainingAmount}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-800/80 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--sk-muted)] mb-1">
                    {isHindi ? 'खरीदार / आढ़तिया / मंडी:' : 'Buyer / Mandi Trader:'}
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={isHindi ? 'उदा. शुभम ट्रेडर्स' : 'e.g. Mandi Trader Name'}
                      value={form.buyerName}
                      onChange={(e) => updateField('buyerName', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Worker/Supplier & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {form.type === 'Expense'
                  ? isHindi ? 'श्रमिक / दुकानदार / ऑपरेटर:' : 'Worker / Supplier / Operator:'
                  : isHindi ? 'श्रमिक / व्यक्ति:' : 'Worker / Person:'}
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isHindi ? 'उदा. रामलाल (ऑपरेटर)' : 'e.g. Ramlal (Operator)'}
                  value={form.worker}
                  onChange={(e) => updateField('worker', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sk-text)] mb-1">
                {isHindi ? 'विवरण / टिप्पणी (Note):' : 'Note / Remarks:'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'उदा. डीएपी 2 बोरी व जुताई' : 'e.g. Fertilizer 2 bags'}
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-[var(--sk-text)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* PARTNERSHIP & WHO PAID */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--sk-border)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHindi ? 'यह खर्च किसने चुकाया? (Paid By):' : 'Who Paid / Financed This?'}</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {isHindi ? 'बटाई / साझेदारी' : 'Batai Account'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateField('paidBy', 'me')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  form.paidBy === 'me'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {isHindi ? 'मैंने चुकाया' : 'Paid by Me'}
              </button>
              <button
                type="button"
                onClick={() => updateField('paidBy', 'partner')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  form.paidBy === 'partner'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {isHindi ? 'साझीदार ने दिया' : 'Partner Paid'}
              </button>
              <button
                type="button"
                onClick={() => updateField('paidBy', 'shared')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  form.paidBy === 'shared'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {isHindi ? 'आधा-आधा साझा' : 'Shared 50-50'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {form.paidBy === 'me'
                ? isHindi ? 'आपने पूरा पैसा दिया - साझीदार का 50% आपके नाम चढ़ेगा।' : 'You paid full amount; partner owes share to you.'
                : form.paidBy === 'partner'
                ? isHindi ? 'साझीदार ने पूरा पैसा दिया - आपका 50% साझीदार के नाम चढ़ेगा।' : 'Partner paid full amount; you owe share to partner.'
                : isHindi ? 'खर्च पहले से बराबर साझा हो चुका है।' : 'Split equally immediately.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 pb-2 border-t border-[var(--sk-border)] flex flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-slate-800 transition cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2.5 min-h-[48px] rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-950 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editingRecord
                ? isHindi ? 'रिकॉर्ड अपडेट करें' : 'Update Record'
                : isHindi ? 'बहीखाते में दर्ज करें' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
