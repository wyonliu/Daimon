'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { grantSingleReading, activatePro } from '@/lib/subscription';
import Image from 'next/image';

// Plan configs
const PLANS = {
  trial: { price: '9.9', label: '結緣解讀', char: '\u7B54', readings: 1 },
  single: { price: '35', label: '深度解讀', char: '\u547D', readings: 3 },
  pro: { price: '70', label: '專業通行', char: '\u9053', readings: Infinity },
} as const;

type PlanType = keyof typeof PLANS;

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [unlocking, setUnlocking] = useState(false);
  const [step, setStep] = useState<'review' | 'pay'>('review');
  const [showToast, setShowToast] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const plan = (searchParams.get('plan') as PlanType) || 'trial';
  const returnUrl = searchParams.get('returnUrl') || '/';
  const config = PLANS[plan] || PLANS.trial;

  // Simulated "others viewing" for social proof
  useEffect(() => {
    setViewerCount(Math.floor(Math.random() * 30) + 48);
  }, []);

  const handleUnlock = () => {
    setUnlocking(true);
    if (plan === 'pro') {
      activatePro(`alipay_${Date.now()}`, 'pro');
    } else {
      // trial = 1 reading, single = 3 readings
      const grants = plan === 'single' ? 3 : 1;
      for (let i = 0; i < grants; i++) {
        grantSingleReading();
      }
    }
    setShowToast(true);
    setTimeout(() => {
      router.push(returnUrl);
    }, 1200);
  };

  // What each plan unlocks
  const benefitsByPlan: Record<PlanType, { icon: string; text: string }[]> = {
    trial: [
      { icon: '\u{1F4DC}', text: '1 次完整命運深度解讀報告' },
      { icon: '\u{1F300}', text: '八字四柱 + 西洋占星雙引擎推演' },
      { icon: '\u{2728}', text: '十神格局 · 五行強弱 · 命運走向' },
      { icon: '\u{1F4AC}', text: 'AI 命理師個性化解讀' },
    ],
    single: [
      { icon: '\u{1F4DC}', text: '3 次完整命運深度解讀' },
      { icon: '\u{1F300}', text: '命盤 / 合盤 / 日運均可使用' },
      { icon: '\u{2728}', text: '十神 · 神煞 · 大運 · 五行全維度' },
      { icon: '\u{1F4AC}', text: 'AI 命理師個性化解讀報告' },
    ],
    pro: [
      { icon: '\u{267E}\u{FE0F}', text: '30天無限次深度解讀' },
      { icon: '\u{1F4DC}', text: '命盤 / 合盤 / 日運全功能通行' },
      { icon: '\u{1F4AC}', text: '無限次 AI 命理師對話諮詢' },
      { icon: '\u{1F300}', text: '東西方跨傳統融合解讀' },
    ],
  };

  const benefits = benefitsByPlan[plan] || benefitsByPlan.trial;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* ===== Success Overlay ===== */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm fade-in">
          <div className="text-center slide-up">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/40 flex items-center justify-center glow-gold-soft">
              <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gradient-gold font-display mb-2">
              緣已結，卷已開
            </p>
            <p className="text-sm text-gray-400">正在為您展開命運之卷...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => step === 'pay' ? setStep('review') : router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-500 transition-colors press-effect mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {step === 'pay' ? '返回' : t('pay.back')}
        </button>

        {/* ===== STEP 1: Your reading is ready — review what awaits ===== */}
        {step === 'review' && (
          <div className="glass-card rounded-2xl border border-gold-500/20 bg-gradient-to-b from-void-lighter/95 to-void overflow-hidden slide-up">
            {/* Sacred header */}
            <div className="relative px-6 pt-8 pb-6 text-center">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-gold-500/[0.04] blur-[80px]" />
              </div>
              <div className="relative z-10">
                {/* Pulsing icon — reading is "alive" and waiting */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-gold-soft">
                    <span className="text-3xl chinese-char text-gold-500">{config.char}</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-gold-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                </div>
                <h1 className="text-2xl font-bold text-gray-100 font-display mb-1.5">
                  {plan === 'pro' ? '開啟命理之道' : '您的命運報告已生成'}
                </h1>
                <p className="text-sm text-gray-500">
                  {plan === 'pro'
                    ? '無限次探索命運的每一個維度'
                    : '命盤已排定，以下內容已推演完成'}
                </p>
              </div>
            </div>

            <div className="divider-gold mx-6" />

            {/* What you're getting */}
            <div className="px-6 py-5">
              <p className="text-xs text-gold-500/50 uppercase tracking-wider mb-4 font-medium">
                {plan === 'pro' ? '專業版權益' : '報告包含以下內容'}
              </p>
              <div className="space-y-3.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{b.icon}</span>
                    <span className="text-sm text-gray-300 leading-relaxed">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider-gold mx-6" />

            {/* Price + CTA */}
            <div className="px-6 py-6">
              {/* Social proof */}
              {viewerCount > 0 && (
                <p className="text-xs text-gray-600 text-center mb-4">
                  今日已有 <span className="text-gold-500/70">{viewerCount}</span> 人查閱了命運報告
                </p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-400">{config.label}</span>
                  {plan === 'trial' && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">結緣價</span>
                  )}
                </div>
                <span className="text-3xl font-bold text-gold-500 font-display">
                  &yen;{config.price}
                </span>
              </div>

              <button
                onClick={() => setStep('pay')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect btn-shimmer"
              >
                {plan === 'trial' ? '結緣查閱' : plan === 'pro' ? '開通專業版' : '查閱完整報告'}
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                {plan === 'pro' ? '30天全功能，到期自動停止' : '一次性費用，即時生效，無需訂閱'}
              </p>

              {/* Upsell hint for trial users */}
              {plan === 'trial' && (
                <button
                  onClick={() => router.push(`/pay?plan=pro&returnUrl=${encodeURIComponent(returnUrl)}`)}
                  className="w-full mt-3 text-xs text-gray-600 hover:text-gold-500/70 transition-colors text-center"
                >
                  或選擇全功能通行 &yen;70/月 &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== STEP 2: Complete payment ===== */}
        {step === 'pay' && (
          <div className="glass-card rounded-2xl border border-gold-500/20 bg-gradient-to-b from-void-lighter/95 to-void overflow-hidden slide-up">
            {/* Compact order bar */}
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/25 flex items-center justify-center">
                    <span className="text-lg chinese-char text-gold-500">{config.char}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{config.label}</p>
                    <p className="text-xs text-gray-500">即時生效</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gold-500 font-display">&yen;{config.price}</span>
              </div>
            </div>

            <div className="divider-gold mx-6" />

            {/* QR payment */}
            <div className="px-6 py-6">
              <div className="text-center mb-5">
                <h2 className="text-lg font-bold text-gray-200 mb-1">完成支付</h2>
                <p className="text-xs text-gray-500">
                  支付寶掃碼，輸入 <span className="text-gold-500 font-bold">&yen;{config.price}</span>
                </p>
              </div>

              {/* QR with decorative frame */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-52 h-52 rounded-xl border-2 border-gold-500/25 bg-white p-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/alipay-qr.jpg"
                      alt="支付二維碼"
                      width={192}
                      height={192}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-gold-500/40 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-gold-500/40 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-gold-500/40 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-gold-500/40 rounded-br" />
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <svg className="w-4 h-4 text-[#1677FF]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.422 15.358c-.683-.347-1.143-.578-1.532-.82a24.074 24.074 0 01-2.347-1.483c.345-.75.635-1.54.865-2.364h-3.26V9.396h4.073V8.68h-4.073V6.804h-1.785s.013-.315 0-.417c-.013-.102-.143-.404-.143-.404H9.93v2.698H6.074v.716H9.93v1.295H6.912v.716h6.728a14.094 14.094 0 01-.485 1.283c-1.462-.708-3.134-1.223-4.675-.88-2.218.494-3.476 2.16-3.163 4.067.313 1.906 2.242 3.146 4.4 2.792 1.59-.26 2.874-1.198 3.859-2.545.002-.003.003-.005.005-.008 1.364.82 3.078 1.605 3.078 1.605l3.764 1.738z M9.52 18.062c-1.79.38-3.313-.47-3.477-1.95-.163-1.48 1.116-3.023 2.907-3.404.44-.094.867-.114 1.276-.073a8.877 8.877 0 012.647 1.014c-.867 1.634-1.913 3.137-3.354 4.413z"/>
                  </svg>
                  <span className="text-xs text-gray-500">支付寶掃碼支付</span>
                </div>
              </div>

              {/* Minimal steps */}
              <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 text-[10px] font-bold">1</span>
                  <span>掃碼</span>
                </div>
                <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 text-[10px] font-bold">2</span>
                  <span>輸入 &yen;{config.price}</span>
                </div>
                <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 text-[10px] font-bold">3</span>
                  <span>查閱</span>
                </div>
              </div>
            </div>

            <div className="divider-gold mx-6" />

            {/* Unlock button */}
            <div className="px-6 py-5">
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer"
              >
                {unlocking ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    開卷中...
                  </span>
                ) : (
                  '已支付，查閱報告'
                )}
              </button>
              <p className="text-xs text-gray-600 text-center mt-2.5">
                支付完成後點擊上方按鈕即時生效
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        </main>
      }
    >
      <PayContent />
    </Suspense>
  );
}
