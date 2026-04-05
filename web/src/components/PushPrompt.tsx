'use client';

import { useState, useEffect } from 'react';
import {
  shouldShowPushPrompt,
  requestPushPermission,
  dismissPushPrompt,
  registerServiceWorker,
} from '@/lib/push-notifications';

export default function PushPrompt() {
  const [show, setShow] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    // Register SW on mount regardless
    registerServiceWorker();
    // Check if we should show push prompt (delayed for better UX)
    const timer = setTimeout(() => {
      if (shouldShowPushPrompt()) {
        setShow(true);
      }
    }, 5000); // Show after 5s of engagement
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const handleEnable = async () => {
    setEnabling(true);
    const success = await requestPushPermission();
    if (success) {
      setShow(false);
    } else {
      setEnabling(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setShow(false);
  };

  return (
    <div className="rounded-xl border border-gold-500/20 bg-gradient-to-r from-gold-500/5 to-transparent p-4 fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 mb-0.5">
            每日運勢提醒
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            開啟通知，每天第一時間查看運勢
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={enabling}
              className="px-4 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-medium hover:bg-gold-500/15 press-effect transition-all disabled:opacity-50"
            >
              {enabling ? '開啟中...' : '開啟提醒'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              暫不需要
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
