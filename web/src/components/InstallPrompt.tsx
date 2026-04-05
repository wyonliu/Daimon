'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Don't show if dismissed before
    const dismissed = localStorage.getItem('daimon_install_dismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Only show after user has interacted (visited reading or daily)
    const profile = localStorage.getItem('daimon_user_profile');
    if (!profile) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Capture native install prompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show after 3 seconds
    const timer = setTimeout(() => setShow(true), 3000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('daimon_install_dismissed', new Date().toISOString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 slide-up sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="relative rounded-xl border border-gold-500/20 bg-void-lighter/95 backdrop-blur-lg p-4 shadow-lg shadow-black/30">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 p-1"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg chinese-char text-gold-500">命</span>
          </div>
          <div className="min-w-0 pr-4 flex-1">
            <p className="text-sm font-medium text-gray-200">加入桌面，每日查看運勢</p>
            {isIOS ? (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                點擊底部
                <span className="inline-flex items-center"><svg className="w-3 h-3 mx-0.5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg></span>
                分享按鈕，選擇「加入主畫面」
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  安裝到桌面，一鍵查看每日命運
                </p>
                {deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-medium hover:bg-gold-500/15 press-effect"
                  >
                    立即安裝
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
