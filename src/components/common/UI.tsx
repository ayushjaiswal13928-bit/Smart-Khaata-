import React from 'react';
import { RentStatus } from '../../lib/types';

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--sk-border)] bg-[var(--sk-card2)] hover:bg-white/5 text-[var(--sk-text)] active:scale-98 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

export const inputCls =
  "w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-sm text-[var(--sk-text)] outline-none focus:border-green-500/70 focus:ring-2 focus:ring-green-500/10 placeholder:text-slate-500 transition";

export const selectCls =
  "w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-sm text-[var(--sk-text)] outline-none focus:border-green-500/70 focus:ring-2 focus:ring-green-500/10 transition cursor-pointer";

export function FormCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-4 sm:p-5 shadow-sm transition-all ${className}`}
    >
      {children}
    </div>
  );
}

export function InputGroup({
  label,
  children,
  error,
}: {
  label?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[var(--sk-muted)]">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export function KpiBox({
  label,
  value,
  bar = false,
  barPct = 0,
  green = false,
  sub,
}: {
  label: string;
  value: string;
  bar?: boolean;
  barPct?: number;
  green?: boolean;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-4 shadow-sm">
      <div className="text-xs font-medium text-[var(--sk-muted)] truncate">{label}</div>
      <div
        className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
          green ? 'text-green-400' : 'text-[var(--sk-text)]'
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-[var(--sk-dim)] mt-0.5">{sub}</div>}
      {bar && (
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)]">
        {title}
      </h2>
      {sub && (
        <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
          {sub}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: RentStatus }) {
  if (status === 'Received') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
        ✓ जमा (Received)
      </span>
    );
  }
  if (status === 'Partial') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
        ⚡ आंशिक (Partial)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      ⏳ बाकी (Pending)
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-slate-700'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
