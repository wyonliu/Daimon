'use client';

import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

interface PaywallModalProps {
  onDismiss: () => void;
  readingsUsed?: number;
  maxReadings?: number;
  chartPattern?: string;
  branchClashes?: number;
}

export default function PaywallModal({ onDismiss, readingsUsed = 3, maxReadings = 3, chartPattern, branchClashes }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
          returnUrl: window.location.origin,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal Card */}
      <div className="relative max-w-md w-full rounded-2xl border border-gold-500/30 bg-gradient-to-b from-void-lighter to-void p-6 sm:p-8 slide-up glow-gold-soft">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors press-effect"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse">
            <span className="text-3xl chinese-char text-gold-500">道</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gold-500 text-glow-gold mb-2">
          {t('paywall.title')}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-4">
          {t('paywall.subtitle.pre')}{readingsUsed}/{maxReadings}{t('paywall.subtitle.mid')}
          {t('paywall.subtitle.post')}
        </p>

        {(chartPattern || (branchClashes && branchClashes > 0)) && (
          <div className="mb-6 px-3 py-3 rounded-xl bg-gold-500/5 border border-gold-500/15">
            {chartPattern && (
              <p className="text-xs text-gold-500/90 leading-relaxed text-center">
                Your chart reveals a <strong className="text-gold-500">{chartPattern}</strong> &mdash; understanding this pattern is key to your career and relationships.
              </p>
            )}
            {branchClashes && branchClashes > 0 && (
              <p className="text-xs text-gray-400 leading-relaxed text-center mt-1">
                {branchClashes} branch clash{branchClashes > 1 ? 'es' : ''} detected &mdash; these shape your life&apos;s turning points.
              </p>
            )}
          </div>
        )}

        {/* Feature comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          {/* Free column */}
          <div className="rounded-xl border border-gray-700/50 bg-void/50 p-4">
            <div className="text-gray-400 font-medium mb-3">{t('paywall.free')}</div>
            <ul className="space-y-2 text-gray-500 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-gray-600 mt-0.5">&#10003;</span>
                <span>{t('paywall.free.readings')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gray-600 mt-0.5">&#10003;</span>
                <span>{t('paywall.free.chart')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gray-600 mt-0.5">&#10003;</span>
                <span>{t('paywall.free.overview')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gray-600 mt-0.5">&#10007;</span>
                <span className="line-through">{t('paywall.free.noChat')}</span>
              </li>
            </ul>
          </div>

          {/* Pro column */}
          <div className="rounded-xl border border-gold-500/30 bg-gradient-to-b from-gold-500/5 to-transparent p-4">
            <div className="text-gold-500 font-medium mb-3">{t('paywall.pro')}</div>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-gold-500 mt-0.5">&#10003;</span>
                <span>{t('paywall.pro.readings')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gold-500 mt-0.5">&#10003;</span>
                <span>{t('paywall.pro.chart')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gold-500 mt-0.5">&#10003;</span>
                <span>{t('paywall.pro.synthesis')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-gold-500 mt-0.5">&#10003;</span>
                <span>{t('paywall.pro.consultations')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('paywall.redirecting')}
            </span>
          ) : (
            t('paywall.cta')
          )}
        </button>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-400 transition-colors press-effect"
        >
          {t('paywall.notNow')}
        </button>
      </div>
    </div>
  );
}
