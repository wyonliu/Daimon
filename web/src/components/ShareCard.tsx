'use client';

import { useRef, useState } from 'react';
import { BaziResult } from '@/lib/bazi/calculator';
import { ZodiacResult } from '@/lib/astro/zodiac';

interface ShareCardProps {
  bazi: BaziResult;
  zodiac: ZodiacResult;
  name: string;
}

export default function ShareCard({ bazi, zodiac, name }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const elementColors: Record<string, string> = {
    Wood: '#22c55e', Fire: '#ef4444', Earth: '#eab308', Metal: '#f59e0b', Water: '#3b82f6',
  };

  const dayMasterColor = elementColors[bazi.dayMaster.elementEn] || '#c8a96e';

  const handleShare = async () => {
    // Create shareable text
    const text = `${name}'s Destiny Chart | Daimon
${zodiac.sunSign.symbol} ${zodiac.sunSign.name} Sun · ${bazi.dayMaster.stem} ${bazi.dayMaster.elementEn} Day Master

Four Pillars: ${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}
${bazi.year.animal} Year · ${bazi.dayMaster.polarity === 'yang' ? 'Yang' : 'Yin'} ${bazi.dayMaster.elementEn}

${bazi.dayMaster.description}

Discover your destiny at daimon.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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

  return (
    <div className="space-y-4 fade-in">
      {/* Visual Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(200,169,110,0.1)]"
        style={{
          background: `linear-gradient(135deg, #0a0a16 0%, #12121f 50%, #0a0a16 100%)`,
          border: '1.5px solid rgba(200, 169, 110, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,169,110,0.08)',
        }}
      >
        {/* Subtle pattern watermark */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,110,1) 0.5px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-gold-500">
            <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" strokeWidth="0.5" />
            <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.3" />
            <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.3" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-gold-500 text-xs tracking-wider uppercase mb-1">Daimon Destiny Chart</div>
              <div className="text-white text-lg font-semibold">{name}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl">{zodiac.sunSign.symbol}</div>
              <div className="text-xs text-gray-500">{zodiac.sunSign.name}</div>
            </div>
          </div>

          {/* Four Pillars mini */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {(['hour', 'day', 'month', 'year'] as const).map((p) => {
              const pillar = bazi[p];
              return (
                <div key={p} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">{p === 'hour' ? '时' : p === 'day' ? '日' : p === 'month' ? '月' : '年'}</div>
                  <div className="text-xl chinese-char" style={{ color: elementColors[pillar.stemElementEn] }}>
                    {pillar.stem}
                  </div>
                  <div className="text-xl chinese-char" style={{ color: elementColors[pillar.branchElementEn] }}>
                    {pillar.branch}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Master */}
          <div className="bg-void-lighter/50 rounded-xl p-4 mb-4" style={{ borderLeft: `3px solid ${dayMasterColor}` }}>
            <div className="text-xs text-gray-500 mb-1">Day Master · 日主</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl chinese-char" style={{ color: dayMasterColor }}>{bazi.dayMaster.stem}</span>
              <div>
                <span className="text-sm text-gray-300">
                  {bazi.dayMaster.polarity === 'yang' ? 'Yang' : 'Yin'} {bazi.dayMaster.elementEn}
                </span>
                <span className="text-xs text-gray-500 block">
                  {bazi.dayMasterStrength === 'strong' ? 'Strong' : bazi.dayMasterStrength === 'weak' ? 'Needs support' : 'Balanced'}
                </span>
              </div>
            </div>
          </div>

          {/* Elements mini bar */}
          <div className="flex gap-1 mb-4 h-2 rounded-full overflow-hidden">
            {bazi.fiveElements.map((e) => (
              <div
                key={e.element}
                className="rounded-full"
                style={{
                  backgroundColor: e.color,
                  width: `${e.percentage}%`,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent mb-3" />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{bazi.birthInfo.solar} · {bazi.year.animal} Year</span>
            <span className="text-gradient-gold font-medium" style={{ letterSpacing: '0.15em', fontSize: '11px' }}>DAIMON.APP</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
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
              Copy Chart Summary
            </>
          )}
        </button>
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: `${name}'s Destiny Chart | Daimon`, url });
            } else {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
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
