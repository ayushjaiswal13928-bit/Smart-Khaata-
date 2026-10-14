import { useEffect, useState, useCallback } from 'react';
import type { BeforeInstallPromptEvent } from '../lib/pwaPromptCapture';

export interface PWAEnvironmentInfo {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isInIframe: boolean;
  install: () => Promise<boolean>;
  openInExternalBrowser: () => void;
  markInstalled: () => void;
}

const STORAGE_KEY = 'smartkhaata_app_installed';

function checkIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check standalone display mode (running as installed PWA)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone) return true;

  // 2. Check localStorage mark saved after successful installation
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {
    // Ignore localStorage errors
  }

  return false;
}

export function usePWAInstall(): PWAEnvironmentInfo {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__pwaDeferredPrompt) {
      return window.__pwaDeferredPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsInstalled());
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  const markInstalled = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
    setIsInstalled(true);
    if (typeof window !== 'undefined') {
      window.__pwaDeferredPrompt = null;
    }
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect user agent
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isChromeBrowser = /chrome|crios/.test(userAgent) && !/edge|opr\//.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsChrome(isChromeBrowser);

    // Check if running inside iframe (e.g. AI Studio preview)
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }
    setIsInIframe(inIframe);

    // Initial check from global early listener
    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      markInstalled();
    };

    const handleCustomPromptReady = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-prompt-ready', handleCustomPromptReady);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-prompt-ready', handleCustomPromptReady);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, [markInstalled]);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaDeferredPrompt : null);
    if (!promptEvent) return false;

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        markInstalled();
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  };

  const openInExternalBrowser = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.assign(url);
    }
  };

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwaDeferredPrompt)),
    isInstalled,
    isIOS,
    isAndroid,
    isChrome,
    isInIframe,
    install,
    openInExternalBrowser,
    markInstalled,
  };
}
