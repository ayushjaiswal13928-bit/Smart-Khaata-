'use client';

import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Lang } from '../../lib/types';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  currentPin: string;
  onSavePin: (newPin: string) => void;
}

export function ChangePinModal({
  isOpen,
  onClose,
  lang,
  currentPin,
  onSavePin,
}: ChangePinModalProps) {
  if (!isOpen) return null;

  const isHi = lang === 'hi';
  const hasExistingPin = Boolean(currentPin && currentPin.length >= 4);

  const [oldPinInput, setOldPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasExistingPin && oldPinInput !== currentPin) {
      setError(isHi ? 'पुराना पिन गलत है!' : 'Old PIN is incorrect!');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError(isHi ? 'नया पिन ठीक 4 अंकों का होना चाहिए!' : 'New PIN must be exactly 4 digits!');
      return;
    }

    if (newPin !== confirmPin) {
      setError(isHi ? 'दोनों नए पिन मेल नहीं खा रहे हैं!' : 'New PIN and confirmation do not match!');
      return;
    }

    onSavePin(newPin);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--sk-border)] bg-gradient-to-r from-blue-950/40 via-[var(--sk-card)] to-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <KeyRound size={16} />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
              {hasExistingPin
                ? isHi
                  ? 'सुरक्षा पिन बदलें'
                  : 'Change Security PIN'
                : isHi
                ? 'नया 4-अंकीय पिन बनाएं'
                : 'Create 4-Digit PIN'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {hasExistingPin && (
            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'वर्तमान (पुराना) पिन' : 'Current PIN'}
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white text-center text-lg tracking-widest font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-[var(--sk-text)] mb-1">
              {isHi ? 'नया 4-अंकीय पिन' : 'New 4-Digit PIN'}
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white text-center text-lg tracking-widest font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--sk-text)] mb-1">
              {isHi ? 'नए पिन की पुनः पुष्टि करें' : 'Confirm New PIN'}
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white text-center text-lg tracking-widest font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <p className="text-[10px] text-[var(--sk-muted)] leading-relaxed pt-1">
            {isHi
              ? 'यह पिन ऐप खोलते समय अनधिकृत उपयोग से आपके बहीखाते को सुरक्षित रखेगा।'
              : 'This 4-digit PIN prevents unauthorized access to your farm ledgers.'}
          </p>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--sk-border)] text-slate-400 hover:text-white transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>{isHi ? 'पिन सुरक्षित करें' : 'Save PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
