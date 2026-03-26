'use client';

import { useState } from 'react';
import { CompatibilityResult } from '@/lib/bazi/compatibility';

interface MatchShareCardProps {
  compatibility: CompatibilityResult;
  nameA: string;
  nameB: string;
}

const EC: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#eab308', Metal: '#f59e0b', Water: '#3b82f6',
};

export default function MatchShareCard({ compatibility, nameA, nameB }: MatchShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    const text = `${nameA} x ${nameB} | Destiny Match by Daimon

Compatibility Score: ${compatibility.overallScore}/100

Day Masters: ${compatibility.dayMasterRelation.stemA} (${compatibility.dayMasterRelation.elementA}) x ${compatibility.dayMasterRelation.stemB} (${compatibility.dayMasterRelation.elementB})
${compatibility.dayMasterRelation.elementRelation}

Emotional: ${compatibility.categoryScores.emotional}/100
Intellectual: ${compatibility.categoryScores.intellectual}/100
Physical: ${compatibility.categoryScores.physical}/100
Spiritual: ${compatibility.categoryScores.spiritual}/100
Practical: ${compatibility.categoryScores.practical}/100

Strengths:
${compatibility.strengths.map(s => `+ ${s}`).join('\n')}

Challenges:
${compatibility.challenges.map(c => `! ${c}`).join('\n')}

Discover your destiny match at daimon.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const text = `${nameA} x ${nameB} — Compatibility: ${compatibility.overallScore}/100. Discover your destiny match at daimon.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nameA} x ${nameB} | Destiny Match`,
          text,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const { dayMasterRelation, categoryScores, overallScore } = compatibility;

  // Score ring (small version for share card)
  const size = 90;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Visual Card — designed for screenshot */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(200,169,110,0.1)]"
        style={{
          background: 'linear-gradient(135deg, #0a0a16 0%, #12121f 50%, #0a0a16 100%)',
          border: '1.5px solid rgba(200, 169, 110, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,169,110,0.08)',
        }}
      >
        {/* Subtle pattern watermark */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,110,1) 0.5px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-28 h-28 opacity-5">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-gold-500">
            <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-gold-500 text-[10px] tracking-[0.2em] uppercase mb-2">Destiny Match</div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-white text-sm font-semibold">{nameA}</span>
              <span className="text-gold-500/50 text-xs chinese-char">x</span>
              <span className="text-white text-sm font-semibold">{nameB}</span>
            </div>
          </div>

          {/* Day Masters + Score */}
          <div className="flex items-center justify-center gap-6 mb-5">
            {/* Person A stem */}
            <div className="text-center">
              <div
                className="text-4xl chinese-char font-bold leading-none mb-1"
                style={{ color: EC[dayMasterRelation.elementA] || '#c8a96e' }}
              >
                {dayMasterRelation.stemA}
              </div>
              <div className="text-[10px] text-gray-500">{dayMasterRelation.elementA}</div>
            </div>

            {/* Score ring */}
            <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="transform -rotate-90">
                <circle
                  cx={size / 2} cy={size / 2} r={radius}
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"
                />
                <circle
                  cx={size / 2} cy={size / 2} r={radius}
                  fill="none"
                  stroke="#c8a96e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gradient-gold">{overallScore}</span>
                <span className="text-[8px] text-gray-500">/ 100</span>
              </div>
            </div>

            {/* Person B stem */}
            <div className="text-center">
              <div
                className="text-4xl chinese-char font-bold leading-none mb-1"
                style={{ color: EC[dayMasterRelation.elementB] || '#c8a96e' }}
              >
                {dayMasterRelation.stemB}
              </div>
              <div className="text-[10px] text-gray-500">{dayMasterRelation.elementB}</div>
            </div>
          </div>

          {/* Category mini bars */}
          <div className="space-y-1.5 mb-4">
            {[
              { label: 'Emotional', cn: '情感', score: categoryScores.emotional },
              { label: 'Intellectual', cn: '智识', score: categoryScores.intellectual },
              { label: 'Physical', cn: '感应', score: categoryScores.physical },
              { label: 'Spiritual', cn: '灵性', score: categoryScores.spiritual },
              { label: 'Practical', cn: '务实', score: categoryScores.practical },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-16">{cat.label}</span>
                <div className="flex-1 bg-white/[0.03] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #c8a96e, #e8d5a3)',
                      width: `${cat.score}%`,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-6 text-right font-mono">{cat.score}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent mb-2" />
          <div className="flex items-center justify-between text-[10px] text-gray-600">
            <span>Discover your destiny</span>
            <span className="text-gradient-gold font-medium" style={{ letterSpacing: '0.15em', fontSize: '10px' }}>DAIMON.APP</span>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyText}
          className="flex-1 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all duration-200 flex items-center justify-center gap-2 press-effect"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Summary
            </>
          )}
        </button>
        <button
          onClick={handleNativeShare}
          className="py-2.5 px-4 rounded-lg border border-gray-700 text-sm text-gray-300 hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all duration-200 press-effect"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
