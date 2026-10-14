'use client';

import React, { useState } from 'react';
import { X, User, Phone, MapPin, Check, Save } from 'lucide-react';
import type { Lang } from '../../lib/types';
import type { FarmerProfile } from '../../lib/profileAndSecurity';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  profile: FarmerProfile;
  onSave: (updated: FarmerProfile) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  lang,
  profile,
  onSave,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  const isHi = lang === 'hi';
  const [form, setForm] = useState<FarmerProfile>({ ...profile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert(isHi ? 'कृपया किसान का नाम दर्ज करें' : 'Please enter farmer name');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--sk-border)] bg-gradient-to-r from-emerald-950/40 via-[var(--sk-card)] to-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
              {isHi ? 'किसान प्रोफ़ाइल सुधारें' : 'Edit Farmer Profile'}
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs flex-1">
          <div>
            <label className="block font-semibold text-[var(--sk-text)] mb-1">
              {isHi ? 'किसान का पूरा नाम' : 'Farmer Full Name'} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isHi ? 'उदा. रामेश्वर पाटीदार' : 'e.g. Rameshwar Patidar'}
              className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--sk-text)] mb-1">
              {isHi ? 'मोबाइल / व्हाट्सएप नंबर' : 'Phone / WhatsApp'}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="98260XXXXX"
              className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'गांव / कस्बा' : 'Village / Town'}
              </label>
              <input
                type="text"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                placeholder={isHi ? 'कनार्दिया' : 'Village'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'तहसील' : 'Tehsil'}
              </label>
              <input
                type="text"
                value={form.tehsil}
                onChange={(e) => setForm({ ...form, tehsil: e.target.value })}
                placeholder={isHi ? 'सांवेर' : 'Tehsil'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'जिला' : 'District'}
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder={isHi ? 'इन्दौर' : 'District'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1">
                {isHi ? 'राज्य' : 'State'}
              </label>
              <input
                type="text"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder={isHi ? 'मध्य प्रदेश' : 'State'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-[var(--sk-muted)] leading-relaxed pt-1">
            {isHi
              ? 'यह विवरण पीडीएफ बहीखाते, व्हाट्सएप बिल और रसीदों के शीर्ष (Header) पर प्रिंट होगा।'
              : 'This profile information appears on the top header of printable PDF ledgers and statements.'}
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{isHi ? 'सहेजें' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
