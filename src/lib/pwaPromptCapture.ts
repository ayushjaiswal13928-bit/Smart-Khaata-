// Global capture for beforeinstallprompt in case it fires before React hooks mount
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem('smartkhaata_app_installed', 'true');
    } catch (e) {
      // Ignore storage quota or access issues
    }
    window.__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  });
}
