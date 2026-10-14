import React, { useState } from 'react';
import {
  Download,
  Share,
  X,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  MoreVertical,
  PlusSquare,
  Check,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Lang } from '../../lib/types';

interface PWAInstallButtonProps {
  lang: Lang;
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang,
  variant = 'header',
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isInIframe,
    install,
    openInExternalBrowser,
    markInstalled,
  } = usePWAInstall();

  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const isHi = lang === 'hi';

  // If already installed (either detected in standalone mode, through event, or user completed installation), do not render the install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    // If browser triggered the native install prompt event
    if (isInstallable) {
      try {
        setIsInstalling(true);
        const accepted = await install();
        if (accepted) {
          setInstallSuccess(true);
          setShowGuide(false);
          // Toast shows for 3 seconds then disappears, button already unmounts because isInstalled becomes true
          setTimeout(() => setInstallSuccess(false), 3500);
          return;
        }
      } finally {
        setIsInstalling(false);
      }
    }

    // If native prompt is not available (e.g. inside iframe sandbox, iOS Safari, or browser requiring manual menu tap)
    setShowGuide(true);
  };

  const handleManualInstalled = () => {
    markInstalled();
    setShowGuide(false);
    setInstallSuccess(true);
    setTimeout(() => setInstallSuccess(false), 3500);
  };

  return (
    <>
      {/* HEADER BUTTON */}
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-75 shrink-0"
          title={isHi ? 'ऐप को अपने फोन में इंस्टॉल करें' : 'Install Smart Khaata App'}
        >
          <Download size={14} className={isInstalling ? 'animate-bounce' : ''} />
          <span className="hidden sm:inline">
            {isInstalling ? (isHi ? 'इंस्टॉल हो रहा है...' : 'Installing...') : (isHi ? 'ऐप इंस्टॉल करें' : 'Install App')}
          </span>
          <span className="hidden min-[400px]:inline sm:hidden">{isHi ? 'इंस्टॉल' : 'Install'}</span>
        </button>
      )}

      {/* BANNER VARIANT */}
      {variant === 'banner' && (
        <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-green-950/70 p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/icon-192.png"
                alt="Smart Khaata"
                className="w-11 h-11 rounded-2xl shadow-md border border-green-500/40 shrink-0 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-black flex items-center justify-center text-[10px] font-black shadow">
                ✓
              </span>
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                {isHi ? 'स्मार्ट खाता ऐप इंस्टॉल करें' : 'Install Smart Khaata App'}
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-green-500/20 text-green-300 font-semibold border border-green-500/30">
                  PWA Mobile App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isHi
                  ? 'होम स्क्रीन पर जोड़ें — बिना इंटरनेट भी हिसाब देखें, फास्ट चलेगा और ऐप जैसा खुलेगा!'
                  : 'Add to Home Screen for one-tap offline access & full app experience.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
            >
              <Download size={14} className={isInstalling ? 'animate-bounce' : ''} />
              {isInstalling ? (isHi ? 'इंस्टॉल हो रहा है...' : 'Installing...') : (isHi ? 'अभी इंस्टॉल करें' : 'Install Now')}
            </button>

            {isInIframe && (
              <button
                type="button"
                onClick={openInExternalBrowser}
                className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                title={isHi ? 'ब्राउज़र में अलग टैब में खोलें' : 'Open in new tab'}
              >
                <ExternalLink size={13} className="text-green-400" />
                <span className="hidden md:inline">{isHi ? 'फुल स्क्रीन' : 'Open Tab'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* INSTALL SUCCESS TOAST */}
      {installSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[130] px-4 py-2.5 rounded-2xl bg-green-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{isHi ? 'ऐप सफलतापूर्वक इंस्टॉल हो गया!' : 'App installed successfully!'}</span>
        </div>
      )}

      {/* STEP-BY-STEP MODAL GUIDE (Opens when browser blocks direct popup in iframe or needs manual add) */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--sk-border2)] bg-[var(--sk-card)] p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/icon-192.png"
                  alt="Smart Khaata"
                  className="w-10 h-10 rounded-2xl shadow border border-green-500/40 object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-[var(--sk-text)] flex items-center gap-1.5">
                    {isHi ? 'स्मार्ट खाता ऐप इंस्टॉल करें' : 'Install Smart Khaata App'}
                    <Sparkles size={13} className="text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-[var(--sk-muted)]">
                    {isHi ? 'Android / iPhone / Computer के लिए' : 'For Android / iPhone / PC'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--sk-muted)] hover:bg-white/10 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* IFRAME NOTICE IF APPLICABLE */}
            {isInIframe && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <span className="font-bold text-sm shrink-0">ℹ️</span>
                <div className="space-y-1">
                  <p className="font-semibold">
                    {isHi
                      ? 'सुरक्षा नियम: प्रीव्यू (iFrame) में ब्राउज़र डायरेक्ट डायलॉग ब्लॉक करता है।'
                      : 'Notice: Inside preview frames, browsers block automatic install popups.'}
                  </p>
                  <p className="text-[11px] text-amber-200/90">
                    {isHi
                      ? 'नीचे दिए गए बटन से इसे सीधे अपने Chrome / Safari ब्राउज़र में खोलें और इंस्टॉल करें:'
                      : 'Open directly in Chrome / Safari tab below and install:'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      openInExternalBrowser();
                      setShowGuide(false);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer shadow"
                  >
                    <ArrowUpRight size={14} />
                    {isHi ? 'ब्राउज़र में खोलें (Open in Browser)' : 'Open in Browser Tab'}
                  </button>
                </div>
              </div>
            )}

            {/* PLATFORM SPECIFIC INSTRUCTIONS */}
            {isIOS ? (
              /* iOS SAFARI */
              <div className="space-y-3 text-xs text-[var(--sk-text2)]">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone size={14} className="text-blue-400" />
                  <span>{isHi ? 'iPhone / iPad (Safari) में आसान तरीका:' : 'On iPhone / iPad (Safari):'}</span>
                </div>

                <div className="space-y-2 rounded-2xl bg-[var(--sk-card2)] p-3.5 border border-[var(--sk-border)]">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      {isHi ? 'सफारी ब्राउज़र के नीचे ' : 'Tap the '}
                      <strong className="text-white inline-flex items-center gap-1 font-bold">
                        <Share size={13} className="text-blue-400" /> {isHi ? 'शेयर (Share)' : 'Share'}
                      </strong>
                      {isHi ? ' बटन दबाएं।' : ' icon at the bottom.'}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      {isHi ? 'मेनू में नीचे जाएं और ' : 'Scroll down and tap '}
                      <strong className="text-green-400 inline-flex items-center gap-1 font-bold">
                        <PlusSquare size={13} /> {isHi ? '"होम स्क्रीन में जोड़ें" (Add to Home Screen)' : '"Add to Home Screen"'}
                      </strong>
                      {isHi ? ' चुनें।' : '.'}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      {isHi ? 'ऊपर दाईं ओर ' : 'Tap '}
                      <strong className="text-white font-bold">{isHi ? '"जोड़ें" (Add)' : '"Add"'}</strong>
                      {isHi ? ' पर क्लिक करें। ऐप आपके फोन स्क्रीन पर आ जाएगा!' : ' to complete!'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ANDROID / CHROME / DESKTOP */
              <div className="space-y-3 text-xs text-[var(--sk-text2)]">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone size={14} className="text-green-400" />
                  <span>
                    {isHi
                      ? 'Android फ़ोन या Chrome ब्राउज़र में तरीका:'
                      : 'On Android Phone or Chrome:'}
                  </span>
                </div>

                <div className="space-y-2.5 rounded-2xl bg-[var(--sk-card2)] p-3.5 border border-[var(--sk-border)]">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      {isHi ? 'Chrome ब्राउज़र के ऊपर कोने में तीन डॉट्स ' : 'In Chrome, tap the 3 dots menu '}
                      <strong className="text-white inline-flex items-center gap-0.5 font-bold">
                        <MoreVertical size={13} className="text-slate-300" /> (⋮)
                      </strong>
                      {isHi ? ' पर टैप करें।' : ' at top right.'}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      {isHi ? 'मेनू में से ' : 'Select '}
                      <strong className="text-green-400 font-bold">
                        {isHi ? '"ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें"' : '"Install app" or "Add to Home screen"'}
                      </strong>
                      {isHi ? ' चुनें।' : '.'}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      {isHi
                        ? '"Install" पर क्लिक करें — ऐप आपके मोबाइल की होम स्क्रीन पर असली ऐप जैसा सेव हो जाएगा और ऑफलाइन भी चलेगा!'
                        : 'Confirm "Install" — the app will be added to your home screen!'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {isInIframe && (
                <button
                  type="button"
                  onClick={() => {
                    openInExternalBrowser();
                    setShowGuide(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold text-xs text-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <ExternalLink size={14} />
                  {isHi ? 'ब्राउज़र में खोलें' : 'Open in Browser'}
                </button>
              )}

              <button
                type="button"
                onClick={handleManualInstalled}
                className="py-2.5 px-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/40 font-bold text-xs text-white transition cursor-pointer flex items-center justify-center gap-1.5"
                title={isHi ? 'अगर आपने इंस्टॉल कर लिया है, तो बटन छुपाएं' : 'Mark as installed'}
              >
                <Check size={14} />
                {isHi ? 'इंस्टॉल हो गया (बटन छुपाएं)' : 'Installed (Hide)'}
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="py-2.5 px-3 rounded-xl bg-[var(--sk-card2)] hover:bg-white/5 border border-[var(--sk-border)] font-semibold text-xs text-slate-200 transition cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
