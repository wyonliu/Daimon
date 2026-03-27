'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function PricingContent() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '八字分析的準確度如何？',
      a: 'Daimon 使用專業級四柱引擎，精確計算天干地支、十神、神煞及五行力量分析。計算精度達到專業命理師水準。',
    },
    {
      q: '跨傳統融合有什麼作用？',
      a: '大多數命理工具僅使用單一體系。Daimon 同時通過八字和西方占星術解讀您的命盤，然後融合結果。兩套系統一致之處，模式最強。分歧之處，揭示隱藏的複雜性。',
    },
    {
      q: '我需要知道確切的出生時間嗎？',
      a: '出生時辰開啟時柱，揭示您的內在自我和晚年運勢。沒有時辰，Daimon 仍能使用年、月、日三柱進行完整分析。要獲得最深入的解讀，請提供出生時辰。',
    },
    {
      q: '單次解讀和專業版有什麼區別？',
      a: '單次解讀（¥35）為您提供一次完整的深度解讀和命盤分析。專業版（¥70/月）提供無限次解讀、無限次諮詢及所有功能。如果只想體驗一次深度解讀，單次購買非常適合。',
    },
    {
      q: '如何付款？',
      a: '我們接受支付寶付款。選擇方案後，您會看到一個二維碼，用支付寶掃碼即可完成付款。付款後點擊解鎖按鈕即時生效。',
    },
    {
      q: '我的出生資料會被儲存或分享嗎？',
      a: '您的出生資料僅用於生成解讀。我們不會出售或分享個人資料。解讀即時處理，您可以控制哪些資料被保存。',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="px-4 pt-6 pb-2">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-500 transition-colors press-effect"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="relative px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/[0.03] blur-[100px]" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-gold mb-4 slide-up">
            選擇你的道路
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto slide-up slide-up-delay-1">
            每一段旅程都從第一步開始。選擇適合你的深度方案。
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6 sm:gap-8 items-start">

          {/* -- Seeker (Free) -- */}
          <div className="glass-card rounded-2xl p-8 sm:p-10 card-hover slide-up">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-5">
                <span className="text-2xl chinese-char text-gray-400">{'\u63A2'}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gray-200 mb-1">探索者</h3>
              <p className="text-sm text-gray-500">體驗基礎功能</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-100 font-display tracking-tight">免費</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-400 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>每月 3 次解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>基礎八字四柱命盤</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>西洋太陽星座概覽</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>日主識別</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-gray-600">無對話追問</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/#reading')}
              className="block w-full text-center py-3.5 rounded-xl border border-gray-700 text-gray-300 font-medium hover:border-gold-500/40 hover:text-gold-500 transition-all duration-300 press-effect"
            >
              免費開始
            </button>
          </div>

          {/* -- Single Reading (¥35) -- */}
          <div className="relative glass-card rounded-2xl p-8 sm:p-10 card-hover border-gold-500/30 shadow-[0_0_60px_rgba(200,169,110,0.08)] slide-up slide-up-delay-1">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void text-xs font-bold tracking-wider uppercase shadow-lg">
                最低門檻
              </span>
            </div>

            <div className="mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mb-5 glow-gold-soft">
                <span className="text-2xl chinese-char text-gold-500">{'\u547D'}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gold-500 mb-1">單次解讀</h3>
              <p className="text-sm text-gray-500">一次深度解讀，無需訂閱</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gradient-gold font-display tracking-tight">&yen;35</span>
              <span className="text-sm text-gray-500 ml-2">一次性</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-300 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span><strong className="text-gold-500/90">1 次</strong>完整深度解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>完整八字命盤分析</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>東西方跨傳統融合解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>無需訂閱</span>
              </li>
            </ul>

            <Link
              href="/pay?plan=single"
              className="block w-full text-center py-4 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void font-bold text-lg glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300"
            >
              購買一次解讀
            </Link>
            <p className="text-xs text-gray-600 text-center mt-3">一次付費，無需訂閱。</p>
          </div>

          {/* -- Pro (¥70) -- */}
          <div className="relative glass-card rounded-2xl p-8 sm:p-10 card-hover slide-up slide-up-delay-2">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gray-800 border border-gold-500/30 text-gold-500 text-xs font-bold tracking-wider uppercase">
                最超值
              </span>
            </div>

            <div className="mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mb-5">
                <span className="text-2xl chinese-char text-gold-500">{'\u9053'}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gray-200 mb-1">Pro</h3>
              <p className="text-sm text-gray-500">全面深度，無限力量</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-100 font-display tracking-tight">&yen;70</span>
              <span className="text-sm text-gray-500 ml-2">/月</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-300 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span><strong className="text-gold-500/90">無限次</strong>解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>完整八字：神煞、格局、大運</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>東西方跨傳統融合解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>無限次對話諮詢</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>可分享的命運卡片</span>
              </li>
            </ul>

            <Link
              href="/pay?plan=pro"
              className="block w-full text-center py-3.5 rounded-xl border border-gold-500/30 text-gold-500 font-bold hover:bg-gold-500/5 hover:border-gold-500/50 transition-all duration-300 press-effect"
            >
              訂閱專業版
            </Link>
            <p className="text-xs text-gray-600 text-center mt-3">隨時取消，無隱藏費用。</p>
          </div>

          {/* -- Master (¥199) -- */}
          <div className="relative glass-card rounded-2xl p-8 sm:p-10 card-hover slide-up slide-up-delay-3">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs font-bold tracking-wider uppercase">
                即將推出
              </span>
            </div>

            <div className="mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-5">
                <span className="text-2xl chinese-char text-gray-400">{'\u5E2B'}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gray-200 mb-1">大師版</h3>
              <p className="text-sm text-gray-500">終極命理解讀</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-100 font-display tracking-tight">&yen;199</span>
              <span className="text-sm text-gray-500 ml-2">/月</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-400 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>包含專業版所有功能</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>優先分析與擴展深度解讀</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>可下載 PDF 命理報告</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>流年與大運預測</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>合盤與緣分分析</span>
              </li>
            </ul>

            <button
              disabled
              className="block w-full text-center py-3.5 rounded-xl border border-gray-700 text-gray-600 font-medium cursor-not-allowed"
            >
              通知我
            </button>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="divider-gold mx-auto w-full max-w-4xl" />

      {/* FAQ */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-gold text-center mb-14">
            常見問題
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left press-effect"
                >
                  <span className="text-sm sm:text-base font-medium text-gray-200 pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gold-500/60 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="divider-gold mb-4" />
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="divider-gold mx-auto w-full" />
      <footer className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center">
              <span className="text-sm chinese-char text-gold-500">{'\u547D'}</span>
            </div>
            <span className="text-sm font-display text-gray-400">Daimon</span>
          </button>
          <p className="text-xs text-gray-600 text-center sm:text-right max-w-sm">
            命理分析僅供自我反思與個人洞察之用，不能替代專業建議。
          </p>
        </div>
        <p className="text-xs text-gray-700 text-center mt-6">
          &copy; {new Date().getFullYear()} Daimon &middot; 精準命理引擎
        </p>
      </footer>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
