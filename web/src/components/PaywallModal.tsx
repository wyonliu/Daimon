'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface PaywallModalProps {
  onDismiss: () => void;
  readingsUsed?: number;
  maxReadings?: number;
  chartPattern?: string;
  branchClashes?: number;
}

export default function PaywallModal({ onDismiss, readingsUsed = 2, maxReadings = 2, chartPattern, branchClashes }: PaywallModalProps) {
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [socialCount] = useState(() => Math.floor(Math.random() * 40) + 86);

  const returnUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/');
  const trialPayUrl = `/pay?plan=trial&returnUrl=${returnUrl}`;
  const deepPayUrl = `/pay?plan=deep&returnUrl=${returnUrl}`;
  const proPayUrl = `/pay?plan=pro&returnUrl=${returnUrl}`;

  // Exit offer: when user tries to dismiss, show special offer first
  const handleDismiss = useCallback(() => {
    if (!showExitOffer) {
      setShowExitOffer(true);
    } else {
      onDismiss();
    }
  }, [showExitOffer, onDismiss]);

  // Social proof ticker animation
  const [proofIndex, setProofIndex] = useState(0);
  const proofs = [
    `過去1小時 ${socialCount} 人查閱了命運報告`,
    '98% 用戶認為解讀精準驚人',
    '今日已有 12 人升級專業版',
  ];
  useEffect(() => {
    const timer = setInterval(() => setProofIndex(i => (i + 1) % proofs.length), 3000);
    return () => clearInterval(timer);
  }, [proofs.length]);

  // Exit offer view
  if (showExitOffer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onDismiss} />
        <div className="relative max-w-sm w-full rounded-2xl border border-gold-500/40 bg-gradient-to-b from-void-lighter to-void p-6 slide-up">
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center mb-3">
              <span className="text-2xl chinese-char text-gold-500">{'\u7de3'}</span>
            </div>
            <h3 className="text-lg font-bold text-gold-500 mb-1">等一下——專屬結緣價</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              您的命盤報告已生成，僅需 <span className="text-gold-500 font-bold">¥9.9</span> 即可查閱完整內容
            </p>
          </div>

          {chartPattern && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-gold-500/5 border border-gold-500/15">
              <p className="text-xs text-gold-500/90 text-center">
                「{chartPattern}」格局的完整解讀正在等您
              </p>
            </div>
          )}

          <Link
            href={trialPayUrl}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer block text-center"
          >
            結緣價查閱 — ¥9.9
          </Link>

          <button
            onClick={onDismiss}
            className="w-full mt-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            放棄查看，明天再來
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div className="relative max-w-md w-full rounded-2xl border border-gold-500/30 bg-gradient-to-b from-void-lighter to-void p-6 sm:p-8 slide-up glow-gold-soft max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors press-effect z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Social proof ticker */}
        <div className="mb-4 py-1.5 px-3 rounded-full bg-gold-500/5 border border-gold-500/10 text-center">
          <p className="text-[11px] text-gold-500/70 transition-opacity duration-500">
            {proofs[proofIndex]}
          </p>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center">
              <span className="text-3xl chinese-char text-gold-500">{'\u9053'}</span>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-gold-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Headline — outcome oriented */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gold-500 text-glow-gold mb-2">
          您的命運報告已就緒
        </h2>
        <p className="text-sm text-gray-400 text-center mb-1">
          今日 {readingsUsed}/{maxReadings} 次免費解讀已用完
        </p>
        <p className="text-xs text-gray-500 text-center mb-4">
          明日重置，或解鎖完整報告繼續探索
        </p>

        {/* Personal hooks — information gap */}
        {(chartPattern || (branchClashes && branchClashes > 0)) && (
          <div className="mb-5 px-3 py-3 rounded-xl bg-gold-500/5 border border-gold-500/15">
            {chartPattern && (
              <p className="text-xs text-gold-500/90 leading-relaxed text-center">
                您的命盤顯示<strong className="text-gold-500">「{chartPattern}」</strong>格局——理解此格局是事業與感情的關鍵。
              </p>
            )}
            {branchClashes && branchClashes > 0 && (
              <p className="text-xs text-gray-400 leading-relaxed text-center mt-1">
                檢測到 {branchClashes} 組地支沖剋——揭示人生轉折的隱藏信號。
              </p>
            )}
          </div>
        )}

        {/* Three-tier pricing with decoy */}
        <div className="space-y-3 mb-5">
          {/* Tier 1: ¥9.9 結緣價 — anchor */}
          <Link
            href={trialPayUrl}
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer text-center"
          >
            <span>查閱完整報告 — 結緣價 ¥9.9</span>
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">單次完整命盤解讀</span>
          </Link>

          {/* Tier 2: ¥35 深度解讀 — DECOY (makes ¥70 look reasonable) */}
          <Link
            href={deepPayUrl}
            className="block w-full py-3 rounded-xl border-2 border-gold-500/30 text-gold-500 font-medium text-sm hover:bg-gold-500/5 press-effect text-center relative"
          >
            <span>深度解讀 — ¥35</span>
            <span className="block text-[10px] text-gray-500 mt-0.5">命盤 + 合盤 · 各 3 次</span>
          </Link>

          {/* Tier 3: ¥70 全功能 — target */}
          <Link
            href={proPayUrl}
            className="block w-full py-3 rounded-xl border border-gold-500/20 bg-gold-500/5 text-gold-500/80 font-medium text-sm hover:bg-gold-500/10 press-effect text-center relative"
          >
            <div className="absolute -top-2.5 right-4">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-700 to-gold-500 text-void text-[10px] font-bold">最超值</span>
            </div>
            <span>專業通行 — ¥70/月</span>
            <span className="block text-[10px] text-gray-500 mt-0.5">無限解讀 + 無限對話 + 日運</span>
          </Link>
        </div>

        {/* 功德 merit framing */}
        <div className="text-center mb-3 px-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            每一次解讀，都是一份與命運對話的<span className="text-gold-500/80">功德</span>。
            <br />您的支持讓更多人有機會認識自己的命運。
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            安全支付
          </span>
          <span>·</span>
          <span>即時生效</span>
          <span>·</span>
          <span>不滿意可退</span>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-400 transition-colors press-effect"
        >
          下次再說
        </button>
      </div>
    </div>
  );
}
