'use client';

import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, Sparkles } from 'lucide-react';
import type { Lang } from '../../lib/types';
import { shareViaWhatsApp } from '../../lib/whatsappSharing';

export interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  recipientName: string;
  defaultPhone?: string;
  fullMessage: string;
  shortMessage?: string;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  lang,
  recipientName,
  defaultPhone = '',
  fullMessage,
  shortMessage,
}: WhatsAppShareModalProps) {
  if (!isOpen) return null;

  const isHi = lang === 'hi';
  const [phone, setPhone] = useState(defaultPhone);
  const [selectedFormat, setSelectedFormat] = useState<'full' | 'short'>('full');
  const [copied, setCopied] = useState(false);

  const activeMessage = selectedFormat === 'short' && shortMessage ? shortMessage : fullMessage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSend = () => {
    shareViaWhatsApp(activeMessage, phone || undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--sk-border)] bg-gradient-to-r from-emerald-950/40 via-[var(--sk-card)] to-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)] flex items-center gap-2">
                <span>{isHi ? 'व्हाट्सएप पर शेयर करें' : 'Share via WhatsApp'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  {recipientName}
                </span>
              </h3>
              <p className="text-[11px] text-[var(--sk-muted)]">
                {isHi ? 'बहीखाता व लेन-देन का सीधा संदेश' : 'Direct ledger & payment summary'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--sk-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Phone Number Input */}
          <div>
            <label className="block font-semibold text-[var(--sk-text)] mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-400" />
              <span>{isHi ? 'प्राप्तकर्ता का फोन नंबर (वैकल्पिक)' : 'Phone Number (Optional)'}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isHi ? '10 अंकों का व्हाट्सएप नंबर' : '10-digit WhatsApp number'}
                className="w-full pl-12 pr-3 py-2 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] text-[var(--sk-text)] placeholder-[var(--sk-muted)] focus:outline-none focus:border-emerald-500 transition text-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-[var(--sk-muted)] mt-1">
              {isHi
                ? 'नंबर न डालने पर व्हाट्सएप चैट लिस्ट में किसी को भी चुन सकते हैं।'
                : 'Leave empty to pick any contact directly inside WhatsApp.'}
            </p>
          </div>

          {/* Format Selection (Full vs Short) */}
          {shortMessage && (
            <div>
              <label className="block font-semibold text-[var(--sk-text)] mb-1.5">
                {isHi ? 'संदेश का प्रारूप' : 'Message Format'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('full')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedFormat === 'full'
                      ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold'
                      : 'border-[var(--sk-border)] bg-[var(--sk-card2)] text-[var(--sk-muted)] hover:text-[var(--sk-text)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span>{isHi ? 'विस्तृत बहीखाता' : 'Full Ledger'}</span>
                    <Sparkles size={12} className={selectedFormat === 'full' ? 'text-emerald-400' : 'opacity-40'} />
                  </div>
                  <p className="text-[10px] opacity-75 font-normal">
                    {isHi ? 'लागत, बिक्री व नकद का पूरा हिसाब' : 'Complete line-by-line metrics'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat('short')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedFormat === 'short'
                      ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold'
                      : 'border-[var(--sk-border)] bg-[var(--sk-card2)] text-[var(--sk-muted)] hover:text-[var(--sk-text)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span>{isHi ? 'संक्षिप्त सारांश' : 'Short Summary'}</span>
                    <MessageSquare size={12} className={selectedFormat === 'short' ? 'text-emerald-400' : 'opacity-40'} />
                  </div>
                  <p className="text-[10px] opacity-75 font-normal">
                    {isHi ? 'केवल मुख्य बकाया व रकम' : 'Quick balance & amount'}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[var(--sk-text)]">
                {isHi ? 'संदेश पूर्वावलोकन (Preview)' : 'Message Preview'}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} />
                    <span>{isHi ? 'कॉपी हो गया' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>{isHi ? 'कॉपी करें' : 'Copy Text'}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-sans text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto selection:bg-emerald-500/30">
              {activeMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--sk-border)] bg-[var(--sk-card2)]/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--sk-border)] text-xs font-semibold text-[var(--sk-muted)] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            {isHi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Send size={14} />
            <span>{isHi ? 'व्हाट्सएप भेजें' : 'Send on WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
