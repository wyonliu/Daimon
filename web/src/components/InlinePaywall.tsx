'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface InlinePaywallProps {
  chartPattern?: string;
  currentDaYun?: string;
  nextDaYunYear?: number;
  branchClashes?: number;
  onUpgrade?: () => void;
}

export default function InlinePaywall({
  chartPattern,
  currentDaYun,
  nextDaYunYear,
  branchClashes,
}: InlinePaywallProps) {
  const [showUrgency, setShowUrgency] = useState(false);
  const [socialCount] = useState(() => Math.floor(Math.random() * 40) + 86);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/reading';
  const trialPayUrl = `/pay?plan=trial&returnUrl=${encodeURIComponent(currentPath)}`;
  const deepPayUrl = `/pay?plan=deep&returnUrl=${encodeURIComponent(currentPath)}`;
  const proPayUrl = `/pay?plan=pro&returnUrl=${encodeURIComponent(currentPath)}`;

  // Delayed urgency hint — appears after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowUrgency(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Build personalized revelations — past tense, already calculated
  const revelations: string[] = [];

  if (chartPattern) {
    revelations.push(
      `「${chartPattern}」格局已解析 — 事業關鍵時機與破局策略`
    );
  }

  if (currentDaYun && nextDaYunYear) {
    revelations.push(
      `${nextDaYunYear}年大運轉換已推演 — 命運軌跡即將轉向`
    );
  } else if (currentDaYun) {
    revelations.push(
      `當前大運「${currentDaYun}」的深層影響已推算完成`
    );
  }

  if (branchClashes && branchClashes > 0) {
    revelations.push(
      `${branchClashes}組地支交互已檢測 — 感情與健康的隱藏信號`
    );
  }

  if (revelations.length === 0) {
    revelations.push('十神格局與五行強弱已完成深度推演');
    revelations.push('事業、感情與健康的關鍵時間節點已標定');
  }

  revelations.push('完整命運報告已生成，等待查閱');

  return (
    <div className="relative mt-0">
      {/* Gradient fade overlay */}
      <div className="reading-fade h-40 -mt-40 relative z-10" />

      {/* Paywall content */}
      <div className="relative z-20 rounded-2xl border border-gold-500/20 bg-gradient-to-b from-void-lighter/95 to-void p-6 sm:p-8">
        {/* Social proof ticker */}
        <div className="mb-4 py-1.5 px-3 rounded-full bg-gold-500/5 border border-gold-500/10 text-center">
          <p className="text-[11px] text-gold-500/70">
            過去1小時 {socialCount} 人查閱了命運報告
          </p>
        </div>

        {/* Pulsing "ready" indicator */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/15 to-gold-700/10 border border-gold-500/30 flex items-center justify-center">
              <span className="text-3xl chinese-char text-gold-500">{'\u7B54'}</span>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-gold-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        <div className="text-center mb-1">
          <h3 className="text-lg font-bold text-gray-100">
            您的命運報告已生成
          </h3>
          <p className="text-xs text-gold-500/70 mt-1">
            基於您的八字四柱，以下內容已推演完成
          </p>
        </div>

        {/* What's already calculated — information gap */}
        <div className="mt-5 space-y-2.5 max-w-sm mx-auto">
          {revelations.map((rev, i) => {
            const isLast = i === revelations.length - 1;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 text-left ${isLast ? 'mt-3' : ''}`}
              >
                <span className={`mt-0.5 flex-shrink-0 ${isLast ? 'text-gold-500' : 'text-gold-500/50'}`}>
                  {isLast ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm leading-relaxed ${isLast ? 'text-gold-500 font-medium' : 'text-gray-400'}`}>
                  {rev}
                </span>
              </div>
            );
          })}
        </div>

        {/* Urgency — fades in after 3s */}
        {showUrgency && (
          <div className="mt-4 text-center fade-in">
            <p className="text-xs text-gray-600">
              今日已有 <span className="text-gold-500/80">{socialCount}</span> 人查閱了命運報告
            </p>
          </div>
        )}

        {/* Three-tier pricing */}
        <div className="mt-6 space-y-3 max-w-xs mx-auto">
          {/* Primary: ¥9.9 結緣價 */}
          <Link
            href={trialPayUrl}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer block text-center"
          >
            <span>查閱完整報告 — 結緣價 ¥9.9</span>
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">單次完整命盤解讀</span>
          </Link>

          {/* Decoy: ¥35 */}
          <Link
            href={deepPayUrl}
            className="w-full py-2.5 rounded-xl border border-gold-500/20 text-gold-500/80 font-medium text-sm hover:bg-gold-500/5 hover:border-gold-500/35 press-effect block text-center"
          >
            <span>深度解讀 — ¥35</span>
            <span className="block text-[10px] text-gray-500 mt-0.5">命盤 + 合盤 · 各 3 次</span>
          </Link>

          {/* Target: ¥70/月 */}
          <Link
            href={proPayUrl}
            className="w-full py-2.5 rounded-xl border border-gold-500/15 bg-gold-500/5 text-gold-500/70 font-medium text-sm hover:bg-gold-500/10 press-effect block text-center relative"
          >
            <div className="absolute -top-2 right-4">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-700 to-gold-500 text-void text-[9px] font-bold">最超值</span>
            </div>
            <span>專業通行 — ¥70/月</span>
            <span className="block text-[10px] text-gray-500 mt-0.5">無限解讀 + 無限對話 + 日運</span>
          </Link>
        </div>

        {/* 功德 merit framing */}
        <div className="mt-4 text-center px-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            每一次解讀，都是一份與命運對話的<span className="text-gold-500/80">功德</span>。
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600 mt-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            安全支付
          </span>
          <span>·</span>
          <span>即時生效</span>
          <span>·</span>
          <span>不滿意可退</span>
        </div>
      </div>
    </div>
  );
}
