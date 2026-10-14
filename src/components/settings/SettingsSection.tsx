'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Compass,
  Languages,
  Moon,
  Sun,
  Smartphone,
  Check,
  ChevronRight,
  Database,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import type { Lang, FarmRecord, RentRecord, HomeExpense } from '../../lib/types';
import {
  getFarmerProfile,
  saveFarmerProfile,
  getSecuritySettings,
  saveSecuritySettings,
  getLastBackupTimestamp,
  recordBackupTimestamp,
  FarmerProfile,
  SecuritySettings,
} from '../../lib/profileAndSecurity';
import { downloadPhysicalBackup } from '../../lib/storageMigration';
import { EditProfileModal } from './EditProfileModal';
import { ChangePinModal } from './ChangePinModal';
import { ResetDataModal } from './ResetDataModal';
import { LandSettingsModal } from '../farm/LandSettingsModal';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SettingsSectionProps {
  lang: Lang;
  toggleLang: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  farmRecords: FarmRecord[];
  setFarmRecords: React.Dispatch<React.SetStateAction<FarmRecord[]>>;
  rentRecords: RentRecord[];
  setRentRecords: React.Dispatch<React.SetStateAction<RentRecord[]>>;
  homeExpenses: HomeExpense[];
  setHomeExpenses: React.Dispatch<React.SetStateAction<HomeExpense[]>>;
}

export function SettingsSection({
  lang,
  toggleLang,
  theme,
  toggleTheme,
  farmRecords,
  setFarmRecords,
  rentRecords,
  setRentRecords,
  homeExpenses,
  setHomeExpenses,
}: SettingsSectionProps) {
  const isHi = lang === 'hi';

  const [profile, setProfile] = useState<FarmerProfile>(() => getFarmerProfile());
  const [security, setSecurity] = useState<SecuritySettings>(() => getSecuritySettings());
  const [lastBackup, setLastBackup] = useState<number | null>(() => getLastBackupTimestamp());

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showResetData, setShowResetData] = useState(false);
  const [showLandModal, setShowLandModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (updated: FarmerProfile) => {
    setProfile(updated);
    saveFarmerProfile(updated);
    showToast(isHi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
  };

  const handleSavePin = (newPin: string) => {
    const updated: SecuritySettings = {
      ...security,
      pin: newPin,
      isLockEnabled: true,
    };
    setSecurity(updated);
    saveSecuritySettings(updated);
    showToast(isHi ? 'सुरक्षा पिन सफलतापूर्वक सेट हो गया!' : 'Security PIN updated successfully!');
  };

  const handleTogglePinLock = () => {
    const updated: SecuritySettings = {
      ...security,
      isLockEnabled: !security.isLockEnabled,
    };
    setSecurity(updated);
    saveSecuritySettings(updated);
    showToast(
      updated.isLockEnabled
        ? isHi
          ? 'पिन सुरक्षा चालू कर दी गई है'
          : 'PIN protection enabled'
        : isHi
        ? 'पिन सुरक्षा बंद कर दी गई है'
        : 'PIN protection disabled'
    );
  };

  const handleBackupDownload = () => {
    downloadPhysicalBackup();
    recordBackupTimestamp();
    setLastBackup(Date.now());
    showToast(isHi ? 'बैकअप फ़ाइल डाउनलोड हो गई!' : 'Backup file downloaded successfully!');
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (data.records && Array.isArray(data.records)) {
          setFarmRecords(data.records);
          localStorage.setItem('sk-farm-records', JSON.stringify(data.records));
        }
        if (data.khets && Array.isArray(data.khets)) {
          localStorage.setItem('sk-khets-v2', JSON.stringify(data.khets));
        }
        if (data.rentRecords && Array.isArray(data.rentRecords)) {
          setRentRecords(data.rentRecords);
          localStorage.setItem('sk-rent-records', JSON.stringify(data.rentRecords));
        }
        if (data.homeExpenses && Array.isArray(data.homeExpenses)) {
          setHomeExpenses(data.homeExpenses);
          localStorage.setItem('sk-home-expenses', JSON.stringify(data.homeExpenses));
        }
        if (data.farmerProfile) {
          setProfile(data.farmerProfile);
          saveFarmerProfile(data.farmerProfile);
        }

        showToast(isHi ? 'डेटा सफलतापूर्वक पुनर्स्थापित (Restore) हो गया!' : 'Data restored successfully!');
      } catch (err) {
        alert(isHi ? 'अमान्य बैकअप फ़ाइल!' : 'Invalid backup JSON file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = (mode: 'sample' | 'clear') => {
    if (mode === 'clear') {
      setFarmRecords([]);
      setRentRecords([]);
      setHomeExpenses([]);
      localStorage.removeItem('sk-farm-records');
      localStorage.removeItem('sk-rent-records');
      localStorage.removeItem('sk-home-expenses');
      localStorage.removeItem('sk-khets-v2');
      localStorage.removeItem('sk-crop-stocks');
      showToast(isHi ? 'सभी रिकॉर्ड साफ़ कर दिए गए!' : 'All records cleared!');
    } else {
      localStorage.removeItem('sk-farm-records');
      localStorage.removeItem('sk-rent-records');
      localStorage.removeItem('sk-home-expenses');
      localStorage.removeItem('sk-khets-v2');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)] flex items-center gap-2">
            <Settings className="text-slate-400" />
            <span>{isHi ? 'ऐप सेटिंग्स व सुरक्षा' : 'Settings & Security'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi
              ? 'किसान प्रोफ़ाइल, सुरक्षा पिन, जमीन का पैमाना और डेटा बैकअप'
              : 'Farmer profile, PIN security, acreage settings & data backup'}
          </p>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. FARMER PROFILE CARD */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {profile.name ? profile.name.charAt(0) : 'ख'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {profile.name || (isHi ? 'किसान मित्र' : 'Farmer')}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  {isHi ? 'खाता स्वामी' : 'Account Owner'}
                </span>
              </div>
              <p className="text-xs text-[var(--sk-muted)] mt-0.5">
                📞 {profile.phone || '98260XXXXX'} • 📍 {profile.village}, {profile.tehsil}, {profile.district}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEditProfile(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            {isHi ? 'प्रोफ़ाइल बदलें' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* 2-COLUMN SETTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* APP PREFERENCES */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-400" />
            <span>{isHi ? 'भाषा व रूप-रंग' : 'Language & Display'}</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
              <div>
                <div className="font-semibold text-xs text-white">
                  {isHi ? 'ऐप की भाषा (Language)' : 'App Language'}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {isHi ? 'वर्तमान: हिन्दी' : 'Current: English'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleLang}
                className="px-3 py-1.5 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-card)] hover:bg-white/10 text-xs font-semibold text-emerald-400 transition cursor-pointer flex items-center gap-1.5"
              >
                <Languages size={14} />
                <span>{isHi ? 'Switch to English' : 'हिन्दी करें'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
              <div>
                <div className="font-semibold text-xs text-white">
                  {isHi ? 'थीम (Theme)' : 'Theme Mode'}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {theme === 'dark' ? (isHi ? 'डार्क मोड' : 'Dark Mode') : (isHi ? 'लाइट मोड' : 'Light Mode')}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-card)] hover:bg-white/10 text-xs font-semibold text-white transition cursor-pointer flex items-center gap-1.5"
              >
                {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                <span>{theme === 'dark' ? (isHi ? 'लाइट थीम' : 'Light') : (isHi ? 'डार्क थीम' : 'Dark')}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
              <div>
                <div className="font-semibold text-xs text-white">
                  {isHi ? 'जमीन पैमाना सेटिंग्स' : 'Land Measurement Units'}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {isHi ? 'बीघा, बिस्वा व एकड़ अनुपात' : 'Bigha, Biswa & Acre presets'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLandModal(true)}
                className="px-3 py-1.5 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-card)] hover:bg-white/10 text-xs font-semibold text-amber-400 transition cursor-pointer flex items-center gap-1.5"
              >
                <Compass size={14} />
                <span>{isHi ? 'पैमाना बदलें' : 'Configure'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECURITY & PIN */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span>{isHi ? 'सुरक्षा व 4-अंकीय पिन' : 'App Security & PIN Lock'}</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
              <div>
                <div className="font-semibold text-xs text-white">
                  {isHi ? 'पिन लॉक सुरक्षा' : 'PIN Lock Status'}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {security.isLockEnabled
                    ? isHi
                      ? 'सुरक्षा सक्रिय (Protected)'
                      : 'Active protection'
                    : isHi
                    ? 'सुरक्षा बंद (Disabled)'
                    : 'Disabled'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleTogglePinLock}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  security.isLockEnabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {security.isLockEnabled ? (isHi ? 'चालू' : 'Enabled') : (isHi ? 'बंद' : 'Disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
              <div>
                <div className="font-semibold text-xs text-white">
                  {isHi ? 'सुरक्षा पिन बदलें' : 'Change Security PIN'}
                </div>
                <div className="text-[11px] text-[var(--sk-muted)]">
                  {isHi ? '4-अंकीय गुप्त कोड' : '4-digit secret passcode'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePin(true)}
                className="px-3 py-1.5 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-card)] hover:bg-white/10 text-xs font-semibold text-blue-400 transition cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound size={14} />
                <span>{isHi ? 'पिन बदलें' : 'Change PIN'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
              💡 {isHi
                ? 'पिन सुरक्षा चालू करने पर आपके लेन-देन और फोन किसी अन्य के हाथ में होने पर भी सुरक्षित रहते हैं।'
                : 'PIN lock ensures your accounts and tenant details stay private if someone else uses your device.'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DATA BACKUP & RESTORE */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Database size={16} className="text-purple-400" />
          <span>{isHi ? 'डेटा बैकअप, रिस्टोर व रीसेट' : 'Data Backup, Restore & Reset'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download Backup */}
          <div className="p-3.5 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] flex flex-col justify-between space-y-2">
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                <Download size={14} className="text-emerald-400" />
                <span>{isHi ? 'फोन में बैकअप लें' : 'Download Backup'}</span>
              </div>
              <p className="text-[10px] text-[var(--sk-muted)] mt-1">
                {lastBackup
                  ? isHi
                    ? `अंतिम बैकअप: ${new Date(lastBackup).toLocaleDateString('hi-IN')}`
                    : `Last backup: ${new Date(lastBackup).toLocaleDateString()}`
                  : isHi
                  ? 'अभी तक कोई बैकअप नहीं लिया'
                  : 'No backup downloaded yet'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackupDownload}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Download size={13} />
              <span>{isHi ? 'JSON बैकअप डाउनलोड' : 'Download JSON'}</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-3.5 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] flex flex-col justify-between space-y-2">
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                <Upload size={14} className="text-blue-400" />
                <span>{isHi ? 'बैकअप रिस्टोर करें' : 'Restore Backup'}</span>
              </div>
              <p className="text-[10px] text-[var(--sk-muted)] mt-1">
                {isHi
                  ? 'पहले से ली गई बैकअप फ़ाइल चुनकर डेटा लोड करें'
                  : 'Load accounts from a previous JSON backup'}
              </p>
            </div>
            <label className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow text-center">
              <Upload size={13} />
              <span>{isHi ? 'फ़ाइल चुनें (Restore)' : 'Select Backup File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Factory Reset */}
          <div className="p-3.5 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] flex flex-col justify-between space-y-2">
            <div>
              <div className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                <RefreshCw size={14} className="text-red-400" />
                <span>{isHi ? 'डेटा रीसेट करें' : 'Reset / Restore'}</span>
              </div>
              <p className="text-[10px] text-[var(--sk-muted)] mt-1">
                {isHi
                  ? 'नमूना डेटा पुनः लोड करें या शून्य से नई शुरुआत करें'
                  : 'Restore demo dataset or wipe clean'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetData(true)}
              className="w-full py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>{isHi ? 'रीसेट विकल्प' : 'Reset Options'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA INSTALL CARD FOR MOBILE */}
      <div className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-sm">
        <PWAInstallButton lang={lang} variant="banner" />
      </div>

      {/* MODALS */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        lang={lang}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <ChangePinModal
        isOpen={showChangePin}
        onClose={() => setShowChangePin(false)}
        lang={lang}
        currentPin={security.pin}
        onSavePin={handleSavePin}
      />

      <ResetDataModal
        isOpen={showResetData}
        onClose={() => setShowResetData(false)}
        lang={lang}
        onConfirmReset={handleConfirmReset}
      />

      <LandSettingsModal
        isOpen={showLandModal}
        onClose={() => setShowLandModal(false)}
        lang={lang}
      />
    </div>
  );
}
