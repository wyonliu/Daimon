'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';

interface PaywallModalProps {
  onDismiss: () => void;
  readingsUsed?: number;
  maxReadings?: number;
  chartPattern?: string;
  branchClashes?: number;
}

export default function PaywallModal({ onDismiss, readingsUsed = 3, maxReadings = 3, chartPattern, branchClashes }: PaywallModalProps) {
  const { t } = useLocale();

  const proPayUrl = `/pay?plan=pro&returnUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`;

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
            <span className="text-3xl chinese-char text-gold-500">{'\u9053'}</span>
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
                您的命盤顯示<strong className="text-gold-500">「{chartPattern}」</strong>格局——理解此格局是事業與感情的關鍵。
              </p>
            )}
            {branchClashes && branchClashes > 0 && (
              <p className="text-xs text-gray-400 leading-relaxed text-center mt-1">
                檢測到 {branchClashes} 組地支沖剋——這些塑造了您人生的轉折點。
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
        <Link
          href={proPayUrl}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect block text-center"
        >
          {t('paywall.cta')}
        </Link>

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
