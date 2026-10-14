'use client';

import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  ArrowRightLeft,
  Trash2,
  Printer,
  UserCheck,
  Share2,
  X,
} from 'lucide-react';
import { Partner, PartnerCashEntry, FarmRecord, Lang } from '../../lib/types';
import { fmt, formatDate } from '../../lib/utils';
import { FormCard } from '../common/UI';
import { printFinancialReport } from '../../lib/pdfExport';
import { generatePartnerWhatsAppSummary } from '../../lib/whatsappSharing';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface PartnershipSectionProps {
  lang: Lang;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  partnerCash: PartnerCashEntry[];
  setPartnerCash: React.Dispatch<React.SetStateAction<PartnerCashEntry[]>>;
  farmRecords: FarmRecord[];
}

export function PartnershipSection({
  lang,
  partners,
  setPartners,
  partnerCash,
  setPartnerCash,
  farmRecords,
}: PartnershipSectionProps) {
  const isHi = lang === 'hi';

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    partners[0]?.id || ''
  );

  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showCashEntryModal, setShowCashEntryModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [newPartner, setNewPartner] = useState({
    name: '',
    phone: '',
    relationship: 'batai_50_50' as Partner['relationship'],
    sharePercent: '50',
    khetName: '',
    crop: 'Wheat',
    season: 'Rabi 2026',
    notes: '',
  });

  const [newCash, setNewCash] = useState({
    partnerId: selectedPartnerId || (partners[0]?.id || ''),
    date: new Date().toISOString().slice(0, 10),
    type: 'gave_to_partner' as PartnerCashEntry['type'],
    amount: '',
    mode: 'cash' as PartnerCashEntry['mode'],
    note: '',
  });

  const activePartner = useMemo(() => {
    return partners.find((p) => p.id === selectedPartnerId) || partners[0] || null;
  }, [partners, selectedPartnerId]);

  const metrics = useMemo(() => {
    if (!activePartner) {
      return {
        totalExpense: 0,
        myExpensePaid: 0,
        partnerExpensePaid: 0,
        sharedExpensePaid: 0,
        totalSales: 0,
        partnerSharePercent: 50,
        partnerCostShare: 0,
        partnerSalesShare: 0,
        directCashGave: 0,
        directCashReceived: 0,
        netBalance: 0,
        partnerOwesMe: 0,
        iOwePartner: 0,
      };
    }

    const sharePct = activePartner.sharePercent || 50;
    const mySharePct = 100 - sharePct;

    const records = farmRecords.filter(
      (r) =>
        r.partnerId === activePartner.id ||
        (r.field && activePartner.khetName && r.field.toLowerCase() === activePartner.khetName.toLowerCase())
    );

    let totalExpense = 0;
    let myExpensePaid = 0;
    let partnerExpensePaid = 0;
    let sharedExpensePaid = 0;
    let totalSales = 0;

    records.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if (r.type === 'Expense') {
        totalExpense += amt;
        if (r.paidBy === 'partner') {
          partnerExpensePaid += amt;
        } else if (r.paidBy === 'shared') {
          sharedExpensePaid += amt;
        } else {
          myExpensePaid += amt;
        }
      }
      if (r.type === 'Sale') {
        const saleAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
        totalSales += saleAmt;
      }
    });

    const partnerCashEntries = partnerCash.filter((c) => c.partnerId === activePartner.id);
    let directCashGave = 0;
    let directCashReceived = 0;

    partnerCashEntries.forEach((c) => {
      if (c.type === 'gave_to_partner') {
        directCashGave += Number(c.amount) || 0;
      } else {
        directCashReceived += Number(c.amount) || 0;
      }
    });

    const partnerCostShare = (totalExpense * sharePct) / 100;
    const partnerSalesShare = (totalSales * sharePct) / 100;

    const partnerOwesMe = (myExpensePaid * sharePct) / 100 + directCashGave;
    const iOwePartner = (partnerExpensePaid * mySharePct) / 100 + partnerSalesShare + directCashReceived;
    const netBalance = partnerOwesMe - iOwePartner;

    return {
      totalExpense,
      myExpensePaid,
      partnerExpensePaid,
      sharedExpensePaid,
      totalSales,
      partnerSharePercent: sharePct,
      partnerCostShare,
      partnerSalesShare,
      directCashGave,
      directCashReceived,
      netBalance: Math.round(netBalance),
      partnerOwesMe: Math.round(partnerOwesMe),
      iOwePartner: Math.round(iOwePartner),
    };
  }, [activePartner, farmRecords, partnerCash]);

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name.trim()) return;
    const share = parseFloat(newPartner.sharePercent) || 50;
    const created: Partner = {
      id: `partner-${Date.now()}`,
      name: newPartner.name.trim(),
      phone: newPartner.phone.trim(),
      relationship: newPartner.relationship,
      sharePercent: share,
      khetName: newPartner.khetName.trim(),
      crop: newPartner.crop.trim(),
      season: newPartner.season.trim(),
      startDate: new Date().toISOString().slice(0, 10),
      notes: newPartner.notes.trim(),
    };
    const updated = [...partners, created];
    setPartners(updated);
    setSelectedPartnerId(created.id);
    setShowAddPartnerModal(false);
    setNewPartner({
      name: '',
      phone: '',
      relationship: 'batai_50_50',
      sharePercent: '50',
      khetName: '',
      crop: 'Wheat',
      season: 'Rabi 2026',
      notes: '',
    });
  };

  const handleSaveCashEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newCash.amount);
    if (!amt || amt <= 0 || !activePartner) return;
    const entry: PartnerCashEntry = {
      id: `cash-${Date.now()}`,
      partnerId: activePartner.id,
      date: newCash.date,
      type: newCash.type,
      amount: amt,
      mode: newCash.mode,
      note: newCash.note.trim(),
    };
    setPartnerCash([entry, ...partnerCash]);
    setShowCashEntryModal(false);
    setNewCash({
      partnerId: activePartner.id,
      date: new Date().toISOString().slice(0, 10),
      type: 'gave_to_partner',
      amount: '',
      mode: 'cash',
      note: '',
    });
  };

  const handleDeletePartner = (id: string) => {
    if (confirm(isHi ? 'क्या आप इस साझीदार को हटाना चाहते हैं?' : 'Delete partner?')) {
      const updated = partners.filter((p) => p.id !== id);
      setPartners(updated);
      if (selectedPartnerId === id) {
        setSelectedPartnerId(updated[0]?.id || '');
      }
    }
  };

  const handleDeleteCash = (id: string) => {
    setPartnerCash((cur) => cur.filter((c) => c.id !== id));
  };

  const printStatement = () => {
    if (!activePartner) return;
    const partnerCashEntries = partnerCash.filter((c) => c.partnerId === activePartner.id);
    const balanceText =
      metrics.netBalance > 0
        ? `लेने हैं: ₹${metrics.netBalance.toLocaleString('en-IN')}`
        : metrics.netBalance < 0
        ? `देने हैं: ₹${Math.abs(metrics.netBalance).toLocaleString('en-IN')}`
        : 'चुकता (₹0)';

    printFinancialReport({
      title: `बटाई हिसाब पर्चा - ${activePartner.name}`,
      subtitle: `साझेदारी: ${activePartner.sharePercent}% | खेत: ${activePartner.khetName || 'साझा खेत'}`,
      lang: lang === 'hi' ? 'hi' : 'en',
      summaryCards: [
        {
          label: 'कुल खेती खर्च',
          value: fmt(metrics.totalExpense),
          color: '#dc2626',
        },
        {
          label: `साझीदार का हिस्सा (${activePartner.sharePercent}%)`,
          value: fmt(metrics.partnerCostShare),
          color: '#d97706',
        },
        {
          label: 'कुल फसल बिक्री',
          value: fmt(metrics.totalSales),
          color: '#2563eb',
        },
        {
          label: 'अंतिम निपटान',
          value: balanceText,
          color: metrics.netBalance >= 0 ? '#16a34a' : '#dc2626',
        },
      ],
      tableHeaders: ['दिनांक', 'प्रकार', 'विवरण', 'रकम (₹)'],
      tableRows: partnerCashEntries.map((c) => ({
        cells: [
          formatDate(c.date),
          c.type === 'gave_to_partner' ? 'साझीदार को दिया (Advance)' : 'साझीदार से लिया (Received)',
          c.note || '-',
          fmt(c.amount),
        ],
      })),
      footerNotes: `प्रमाणित दिनांक: ${new Date().toLocaleDateString('hi-IN')}`,
    });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-28 sm:pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="text-emerald-400" size={24} />
            {isHi ? 'बटाई व साझीदार हिसाब-किताब' : 'Batai & Partner Settlement'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {isHi
              ? 'अधिया (50-50) व तिहाई साझेदारी, सांझा खाद-बीज खर्च, बिक्री और नकद निपटान'
              : 'Complete ledger for 50-50 partnership, shared inputs, harvest sales and net cash settlement'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddPartnerModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>{isHi ? '+ साझीदार जोड़ें' : '+ Add Partner'}</span>
          </button>
        </div>
      </div>

      {/* PARTNER TABS */}
      {partners.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {partners.map((p) => {
            const isSelected = p.id === activePartner?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPartnerId(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-white'
                }`}
              >
                <UserCheck size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                  {p.sharePercent}%
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
          <Users size={32} className="mx-auto mb-2 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-300">
            {isHi ? 'कोई साझीदार नहीं है' : 'No partner added yet'}
          </h3>
          <p className="text-xs text-[var(--sk-muted)] mt-1 max-w-sm mx-auto">
            {isHi
              ? "ऊपर '+ साझीदार जोड़ें' बटन दबाकर अधिया (50-50) या बटाईदार का खाता शुरू करें।"
              : 'Add partner to track 50-50 crop expenses, harvest sales and net settlement balance.'}
          </p>
          <button
            type="button"
            onClick={() => setShowAddPartnerModal(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            {isHi ? '+ पहला साझीदार जोड़ें' : '+ Add First Partner'}
          </button>
        </div>
      )}

      {/* SELECTED PARTNER HERO SETTLEMENT CARD */}
      {activePartner && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border shadow-lg transition-all ${
              metrics.netBalance > 0
                ? 'bg-gradient-to-br from-emerald-950/40 via-[var(--sk-card)] to-slate-900 border-emerald-500/40 shadow-emerald-950/30'
                : metrics.netBalance < 0
                ? 'bg-gradient-to-br from-red-950/40 via-[var(--sk-card)] to-slate-900 border-red-500/40 shadow-red-950/30'
                : 'bg-slate-900/60 border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {activePartner.name}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                    {activePartner.sharePercent}% {isHi ? 'हिस्सा (अधिया)' : 'Share'}
                  </span>
                </div>
                <div className="text-xs text-[var(--sk-muted)] mt-1 flex flex-wrap items-center gap-2">
                  {activePartner.khetName && (
                    <span>खेत: <b className="text-slate-200">{activePartner.khetName}</b></span>
                  )}
                  {activePartner.crop && (
                    <span>फसल: <b className="text-slate-200">{activePartner.crop}</b></span>
                  )}
                  {activePartner.phone && (
                    <span>फोन: <b className="text-slate-200">{activePartner.phone}</b></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCashEntryModal(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft size={14} />
                  <span>{isHi ? 'नकद लेनदेन' : 'Record Cash'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(true)}
                  className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="WhatsApp शेयर"
                >
                  <Share2 size={14} className="text-emerald-400" />
                  <span>{isHi ? 'WhatsApp पर्चा' : 'WhatsApp'}</span>
                </button>
                <button
                  type="button"
                  onClick={printStatement}
                  className="px-3 py-2 rounded-xl border border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  title="PDF / Print"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">प्रिंट</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePartner(activePartner.id)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete Partner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* BIG BALANCE STATUS BANNER */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Box 1: What Partner owes me */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-emerald-400 font-semibold">
                  {isHi ? 'साझीदार से आपको लेने हैं:' : 'Partner Owes Me:'}
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                  ₹{metrics.partnerOwesMe.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  (आपके द्वारा दिया गया {metrics.partnerSharePercent}% खर्च + पेशगी नकद)
                </div>
              </div>

              {/* Box 2: What I owe partner */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-red-300 font-semibold">
                  {isHi ? 'आपको साझीदार को देने हैं:' : 'I Owe Partner:'}
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-red-400 mt-1">
                  ₹{metrics.iOwePartner.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  (बिक्री में साझीदार का {metrics.partnerSharePercent}% हिस्सा + साझीदार का खर्च)
                </div>
              </div>

              {/* Box 3: Final NET SETTLEMENT */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  metrics.netBalance > 0
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : metrics.netBalance < 0
                    ? 'bg-red-950/40 border-red-500/50 text-red-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-[11px] font-bold">
                    {metrics.netBalance > 0
                      ? isHi ? 'अंतिम शुद्ध लेना (Net Receivable):' : 'Net You Receive:'
                      : metrics.netBalance < 0
                      ? isHi ? 'अंतिम शुद्ध देना (Net Payable):' : 'Net You Pay:'
                      : isHi ? 'हिसाब चुकता (Settled):' : 'All Settled:'}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 ${
                      metrics.netBalance > 0
                        ? 'text-emerald-400'
                        : metrics.netBalance < 0
                        ? 'text-red-400'
                        : 'text-white'
                    }`}
                  >
                    ₹{Math.abs(metrics.netBalance).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-[10px] font-semibold opacity-90 mt-1">
                  {metrics.netBalance > 0
                    ? `साझीदार से ₹${metrics.netBalance.toLocaleString('en-IN')} वसूल करना है।`
                    : metrics.netBalance < 0
                    ? `साझीदार को ₹${Math.abs(metrics.netBalance).toLocaleString('en-IN')} भुगतान करना है।`
                    : 'खाता शून्य पर संतुलित है।'}
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED 4-PILLAR BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Total Expenses */}
            <div className="p-3.5 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)]">
              <div className="text-[11px] text-slate-400 font-medium">1. कुल खेती खर्च</div>
              <div className="text-base font-bold font-mono text-red-400 mt-1">
                {fmt(metrics.totalExpense)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 border-t border-slate-800 pt-1.5 font-mono">
                <div>आपने दिया: {fmt(metrics.myExpensePaid)}</div>
                <div>साझीदार ने दिया: {fmt(metrics.partnerExpensePaid)}</div>
              </div>
            </div>

            {/* 2. Partner's Cost Share */}
            <div className="p-3.5 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)]">
              <div className="text-[11px] text-slate-400 font-medium">
                2. साझीदार का {metrics.partnerSharePercent}% खर्च हिस्सा
              </div>
              <div className="text-base font-bold font-mono text-amber-400 mt-1">
                {fmt(metrics.partnerCostShare)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1.5">
                (कुल खर्च का {metrics.partnerSharePercent}%)
              </div>
            </div>

            {/* 3. Harvest Sales Share */}
            <div className="p-3.5 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)]">
              <div className="text-[11px] text-slate-400 font-medium">
                3. साझीदार का {metrics.partnerSharePercent}% बिक्री हिस्सा
              </div>
              <div className="text-base font-bold font-mono text-blue-400 mt-1">
                {fmt(metrics.partnerSalesShare)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1.5">
                कुल बिक्री: {fmt(metrics.totalSales)}
              </div>
            </div>

            {/* 4. Direct Cash Given/Received */}
            <div className="p-3.5 rounded-xl bg-[var(--sk-card)] border border-[var(--sk-border)]">
              <div className="text-[11px] text-slate-400 font-medium">4. नकद लेनदेन (Advance)</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                आपने दिया: {fmt(metrics.directCashGave)}
              </div>
              <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                आपने लिया: {fmt(metrics.directCashReceived)}
              </div>
            </div>
          </div>

          {/* CASH ENTRIES & ADVANCE LEDGER TABLE */}
          <FormCard>
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-emerald-400" />
                <h3 className="font-bold text-xs sm:text-sm text-[var(--sk-text)]">
                  {isHi ? 'नकद पेशगी व लेनदेन विवरण (Cash Ledger)' : 'Cash Ledger'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCashEntryModal(true)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>{isHi ? 'नया नकद जोड़ें' : 'Add Entry'}</span>
              </button>
            </div>

            {/* Cash Transactions List */}
            <div className="mt-3 divide-y divide-white/5 text-xs">
              {partnerCash
                .filter((c) => c.partnerId === activePartner.id)
                .map((entry) => {
                  const isGave = entry.type === 'gave_to_partner';
                  return (
                    <div
                      key={entry.id}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGave
                                ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                            }`}
                          >
                            {isGave
                              ? isHi ? 'साझीदार को दिया (Advance)' : 'You Gave'
                              : isHi ? 'साझीदार से लिया (Received)' : 'You Received'}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            📅 {formatDate(entry.date)}
                          </span>
                          {entry.mode && (
                            <span className="text-[10px] text-slate-500">
                              ({entry.mode === 'cash' ? 'नकद' : 'ऑनलाइन'})
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-[11px] text-[var(--sk-muted)] mt-1 truncate">
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className={`font-mono font-bold text-sm ${
                            isGave ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isGave ? '+' : '-'} ₹{entry.amount.toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCash(entry.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {partnerCash.filter((c) => c.partnerId === activePartner.id).length === 0 && (
                <div className="py-6 text-center text-xs text-[var(--sk-dim)]">
                  {isHi ? 'कोई नकद लेनदेन दर्ज नहीं है।' : 'No cash entries recorded.'}
                </div>
              )}
            </div>
          </FormCard>
        </div>
      )}

      {/* ADD PARTNER MODAL */}
      {showAddPartnerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddPartnerModal(false);
          }}
        >
          <form
            onSubmit={handleSavePartner}
            className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <span>{isHi ? 'नया साझीदार जोड़ें' : 'Add Partner'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddPartnerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                  {isHi ? 'साझीदार का नाम:' : 'Partner Name:'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHi ? 'उदा. रमेश पटेल' : 'e.g. Ramesh Patel'}
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'हिस्सेदारी % (Share):' : 'Share %:'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      value={newPartner.sharePercent}
                      onChange={(e) => setNewPartner({ ...newPartner, sharePercent: e.target.value })}
                      className="w-full h-10 px-3 pr-7 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'मोबाइल नंबर:' : 'Phone:'}
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'संबंधित खेत:' : 'Field Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHi ? 'खेत 1' : 'Field 1'}
                    value={newPartner.khetName}
                    onChange={(e) => setNewPartner({ ...newPartner, khetName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'फसल:' : 'Crop:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHi ? 'गेहूं' : 'Wheat'}
                    value={newPartner.crop}
                    onChange={(e) => setNewPartner({ ...newPartner, crop: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">
                  {isHi ? 'टिप्पणी / समझौता विवरण:' : 'Notes:'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. 50-50 बीज, खाद व उपज शेयर' : '50-50 crop and input share'}
                  value={newPartner.notes}
                  onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--sk-border)]">
              <button
                type="button"
                onClick={() => setShowAddPartnerModal(false)}
                className="flex-1 h-10 rounded-xl border border-[var(--sk-border)] text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                {isHi ? 'साझीदार जोड़ें' : 'Save Partner'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD CASH ENTRY MODAL */}
      {showCashEntryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCashEntryModal(false);
          }}
        >
          <form
            onSubmit={handleSaveCashEntry}
            className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-emerald-400" />
                <span>{isHi ? 'नकद लेनदेन दर्ज करें' : 'Record Cash Transaction'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCashEntryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                  {isHi ? 'लेनदेन प्रकार:' : 'Transaction Type:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCash({ ...newCash, type: 'gave_to_partner' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      newCash.type === 'gave_to_partner'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isHi ? 'साझीदार को दिया (Advance)' : 'You Gave'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCash({ ...newCash, type: 'received_from_partner' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      newCash.type === 'received_from_partner'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isHi ? 'साझीदार से लिया' : 'You Received'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                  {isHi ? 'रकम (₹):' : 'Amount (₹):'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="उदा. 5000"
                  value={newCash.amount}
                  onChange={(e) => setNewCash({ ...newCash, amount: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-sm text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'तारीख:' : 'Date:'}
                  </label>
                  <input
                    type="date"
                    value={newCash.date}
                    onChange={(e) => setNewCash({ ...newCash, date: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'माध्यम (Mode):' : 'Payment Mode:'}
                  </label>
                  <select
                    value={newCash.mode}
                    onChange={(e) => setNewCash({ ...newCash, mode: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="cash">{isHi ? 'नकद (Cash)' : 'Cash'}</option>
                    <option value="online">{isHi ? 'UPI / फोनपे' : 'Online'}</option>
                    <option value="bank">{isHi ? 'बैंक ट्रांसफर' : 'Bank Transfer'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">
                  {isHi ? 'विवरण (टिप्पणी):' : 'Note / Remarks:'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. डीजल या खाद हेतु पेशगी' : 'Advance for diesel'}
                  value={newCash.note}
                  onChange={(e) => setNewCash({ ...newCash, note: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--sk-border)]">
              <button
                type="button"
                onClick={() => setShowCashEntryModal(false)}
                className="flex-1 h-10 rounded-xl border border-[var(--sk-border)] text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                {isHi ? 'दर्ज करें' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WHATSAPP SHARE MODAL */}
      {activePartner && (
        <WhatsAppShareModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          lang={lang}
          recipientName={activePartner.name}
          defaultPhone={activePartner.phone || ''}
          fullMessage={generatePartnerWhatsAppSummary({
            partnerName: activePartner.name,
            khetName: activePartner.khetName,
            cropName: activePartner.crop,
            sharePercent: activePartner.sharePercent,
            totalExpense: metrics.totalExpense,
            partnerCostShare: metrics.partnerCostShare,
            myExpensePaid: metrics.myExpensePaid,
            partnerExpensePaid: metrics.partnerExpensePaid,
            totalSales: metrics.totalSales,
            partnerSalesShare: metrics.partnerSalesShare,
            directCashGave: metrics.directCashGave,
            directCashReceived: metrics.directCashReceived,
            netBalance: metrics.netBalance,
          })}
          shortMessage={`🌾 ${activePartner.name} जी का बटाई हिसाब: कुल खर्च ₹${metrics.totalExpense.toLocaleString('en-IN')}, आपका ${activePartner.sharePercent}% हिस्सा ₹${metrics.partnerCostShare.toLocaleString('en-IN')}, नकद दिया ₹${metrics.directCashGave.toLocaleString('en-IN')}। ${
            metrics.netBalance > 0
              ? `लेने हैं: ₹${metrics.netBalance.toLocaleString('en-IN')}`
              : metrics.netBalance < 0
              ? `देने हैं: ₹${Math.abs(metrics.netBalance).toLocaleString('en-IN')}`
              : `हिसाब चुकता (₹0)`
          }`}
        />
      )}
    </div>
  );
}
