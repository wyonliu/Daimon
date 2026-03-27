'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';

interface InlinePaywallProps {
  chartPattern?: string;
  currentDaYun?: string;
  nextDaYunYear?: number;
  branchClashes?: number;
  onUpgrade: () => void;
}

export default function InlinePaywall({
  chartPattern,
  currentDaYun,
  nextDaYunYear,
  branchClashes,
}: InlinePaywallProps) {
  const { t } = useLocale();

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/reading';
  const singlePayUrl = `/pay?plan=single&returnUrl=${encodeURIComponent(currentPath)}`;
  const proPayUrl = `/pay?plan=pro&returnUrl=${encodeURIComponent(currentPath)}`;

  const teasers: string[] = [];

  if (chartPattern) {
    teasers.push(
      `「${chartPattern}」格局對您的事業時機和人生策略有特殊啟示⋯⋯`
    );
  }

  if (currentDaYun && nextDaYunYear) {
    teasers.push(
      `您的大運即將在${nextDaYunYear}年轉入「${currentDaYun}」——命運軌跡的關鍵轉折`
    );
  } else if (currentDaYun) {
    teasers.push(
      `當前大運「${currentDaYun}」正在塑造您這個階段的人生走向`
    );
  }

  if (branchClashes && branchClashes > 0) {
    teasers.push(
      `命盤中有${branchClashes}組地支交互影響感情和健康——看懂它們，一切都不一樣`
    );
  }

  if (teasers.length === 0) {
    teasers.push(
      '您的命盤蘊含著事業、感情和個人成長的關鍵時機'
    );
  }

  teasers.push('解鎖完整的命運分析');

  return (
    <div className="relative mt-0">
      {/* Gradient fade overlay */}
      <div className="reading-fade h-32 -mt-32 relative z-10" />

      {/* Paywall content */}
      <div className="relative z-20 rounded-2xl border border-gold-500/20 bg-gradient-to-b from-void-lighter/95 to-void p-6 sm:p-8 text-center">
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center">
            <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>

        {/* Personalized teasers */}
        <div className="space-y-3 mb-6 max-w-sm mx-auto">
          {teasers.map((teaser, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-left ${
                i === teasers.length - 1 ? 'mt-4' : ''
              }`}
            >
              <span className="text-gold-500 mt-0.5 flex-shrink-0">
                {i === teasers.length - 1 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  i === teasers.length - 1
                    ? 'text-gold-500 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {teaser}
              </span>
            </div>
          ))}
        </div>

        {/* Primary CTA — Single Reading */}
        <Link
          href={singlePayUrl}
          className="w-full max-w-xs mx-auto py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect btn-shimmer block text-center"
        >
          {t('inline.unlock.single')}
        </Link>

        {/* Secondary CTA — Pro subscription */}
        <Link
          href={proPayUrl}
          className="w-full max-w-xs mx-auto mt-3 py-2.5 rounded-xl border border-gold-500/30 text-gold-500 font-medium text-sm hover:bg-gold-500/5 hover:border-gold-500/50 transition-all press-effect block text-center"
        >
          {t('inline.unlock.pro')}
        </Link>

        {/* Subtext */}
        <p className="text-xs text-gray-600 mt-3">
          {t('inline.subtext')}
        </p>
      </div>
    </div>
  );
}
