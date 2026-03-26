'use client';

import { useState } from 'react';

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
  onUpgrade,
}: InlinePaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        onUpgrade();
      }
    } catch {
      setLoading(false);
      onUpgrade();
    }
  };

  const teasers: string[] = [];

  if (chartPattern) {
    teasers.push(
      `Your ${chartPattern} pattern has specific implications for career timing and life strategy...`
    );
  }

  if (currentDaYun && nextDaYunYear) {
    teasers.push(
      `Your current luck pillar transitions to ${currentDaYun} in ${nextDaYunYear} \u2014 a pivotal shift that reshapes your trajectory`
    );
  } else if (currentDaYun) {
    teasers.push(
      `Your current luck pillar (${currentDaYun}) carries energy that directly shapes this chapter of your life`
    );
  }

  if (branchClashes && branchClashes > 0) {
    teasers.push(
      `${branchClashes} branch interaction${branchClashes > 1 ? 's' : ''} in your chart affect relationships and health \u2014 understanding them changes everything`
    );
  }

  if (teasers.length === 0) {
    teasers.push(
      'Your chart contains patterns that reveal critical timing for career, relationships, and personal growth'
    );
  }

  teasers.push('Unlock your complete destiny analysis');

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

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full max-w-xs mx-auto py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer block"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting...
            </span>
          ) : (
            'Reveal Full Reading \u2014 $9.99/mo'
          )}
        </button>

        {/* Subtext */}
        <p className="text-xs text-gray-600 mt-3">
          Cancel anytime &middot; Instant access &middot; All features unlocked
        </p>
      </div>
    </div>
  );
}
