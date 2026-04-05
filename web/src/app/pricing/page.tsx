'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function PricingContent() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const checkIcon = (
    <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  );
  const checkDim = (
    <svg className="w-5 h-5 text-gold-500/50 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  );
  const crossIcon = (
    <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  );

  const faqs = [
    {
      q: '八字分析的準確度如何？',
      a: 'Daimon 使用專業級四柱引擎，精確計算天干地支、十神、神煞及五行力量分析。計算精度達到專業命理師水準。',
    },
    {
      q: '什麼是「結緣價」？',
      a: '結緣價 ¥9.9 是您與命運報告建立連結的最低門檻。我們相信，深度的命理解讀不應是奢侈品。一杯咖啡的價格，即可查閱為您專屬推演的完整報告。',
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
      q: '如何付款？',
      a: '選擇方案後，您可以查看報告包含的具體內容，確認後通過支付寶完成支付，即時為您開啟完整的命理報告。',
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
            您的命盤已排定
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto slide-up slide-up-delay-1">
            命運報告已生成，選擇查閱的深度。
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-5 sm:gap-6 items-start">

          {/* -- Free -- */}
          <div className="glass-card rounded-2xl p-7 sm:p-8 card-hover slide-up">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-4">
                <span className="text-xl chinese-char text-gray-400">{'\u63A2'}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-200 mb-1">探索者</h3>
              <p className="text-xs text-gray-500">體驗基礎命盤</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-100 font-display">免費</span>
            </div>

            <div className="divider-gold mb-6" />

            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              <li className="flex items-start gap-3">{checkDim}<span>每日 2 次解讀</span></li>
              <li className="flex items-start gap-3">{checkDim}<span>基礎八字四柱命盤</span></li>
              <li className="flex items-start gap-3">{checkDim}<span>西洋太陽星座概覽</span></li>
              <li className="flex items-start gap-3">{crossIcon}<span className="text-gray-600">無深度解讀報告</span></li>
              <li className="flex items-start gap-3">{crossIcon}<span className="text-gray-600">無對話追問</span></li>
            </ul>

            <button
              onClick={() => router.push('/#reading')}
              className="block w-full text-center py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:border-gold-500/40 hover:text-gold-500 transition-all duration-300 press-effect"
            >
              免費體驗
            </button>
          </div>

          {/* -- 结缘价 ¥9.9 (PRIMARY) -- */}
          <div className="relative glass-card rounded-2xl p-7 sm:p-8 card-hover border-gold-500/30 shadow-[0_0_60px_rgba(200,169,110,0.08)] slide-up slide-up-delay-1">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void text-xs font-bold tracking-wider shadow-lg">
                結緣價
              </span>
            </div>

            <div className="mb-6 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mb-4 glow-gold-soft">
                <span className="text-xl chinese-char text-gold-500">{'\u7B54'}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gold-500 mb-1">結緣解讀</h3>
              <p className="text-xs text-gray-500">一杯咖啡，查閱一份命運報告</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gradient-gold font-display">&yen;9.9</span>
              <span className="text-sm text-gray-500 ml-2">/ 次</span>
            </div>

            <div className="divider-gold mb-6" />

            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex items-start gap-3">{checkIcon}<span><strong className="text-gold-500/90">1 次</strong>完整深度報告</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>八字四柱 + 西洋占星雙引擎</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>十神 · 五行 · 格局深度解讀</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>AI 命理師個性化報告</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>無需訂閱</span></li>
            </ul>

            <Link
              href="/pay?plan=trial"
              className="block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void font-bold text-base glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300"
            >
              結緣查閱
            </Link>
            <p className="text-xs text-gray-600 text-center mt-2.5">一次性費用，即時生效</p>
          </div>

          {/* -- ¥49 深度解讀 x5 (decoy) -- */}
          <div className="glass-card rounded-2xl p-7 sm:p-8 card-hover slide-up slide-up-delay-2">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mb-4">
                <span className="text-xl chinese-char text-gold-500">{'\u547D'}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-200 mb-1">深度解讀</h3>
              <p className="text-xs text-gray-500">次數制，深入探索核心議題</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-100 font-display">&yen;49</span>
              <span className="text-sm text-gray-500 ml-2">5 次</span>
            </div>

            <div className="divider-gold mb-6" />

            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex items-start gap-3">{checkIcon}<span><strong className="text-gold-500/90">5 次</strong>完整深度報告</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>命盤 / 合盤 / 日運均可使用</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>東西方跨傳統融合解讀</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>AI 命理師個性化報告</span></li>
              <li className="flex items-start gap-3">{crossIcon}<span className="text-gray-600">不含無限 AI 對話</span></li>
            </ul>

            <Link
              href="/pay?plan=deep"
              className="block w-full text-center py-3 rounded-xl border border-gold-500/30 text-gold-500 font-bold hover:bg-gold-500/5 hover:border-gold-500/50 transition-all duration-300 press-effect"
            >
              查閱 5 次報告
            </Link>
            <p className="text-xs text-gray-600 text-center mt-2.5">一次性費用，無需訂閱</p>
          </div>

          {/* -- Pro ¥59/30天 (TARGET — highlighted) -- */}
          <div className="relative glass-card rounded-2xl p-7 sm:p-8 card-hover border-gold-500/40 shadow-[0_0_80px_rgba(200,169,110,0.1)] slide-up slide-up-delay-3">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void text-xs font-bold tracking-wider shadow-lg">
                命主推薦
              </span>
            </div>

            <div className="mb-6 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/35 flex items-center justify-center mb-4 glow-gold-soft">
                <span className="text-xl chinese-char text-gold-500">{'\u9053'}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gold-500 mb-1">命主專業</h3>
              <p className="text-xs text-gray-500">無限次探索命運的每一個維度</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gradient-gold font-display">&yen;59</span>
              <span className="text-sm text-gray-500 ml-2">/ 30 天</span>
            </div>

            <div className="divider-gold mb-6" />

            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex items-start gap-3">{checkIcon}<span><strong className="text-gold-500/90">無限次</strong>深度解讀</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>命盤 / 合盤 / 日運全功能</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span><strong className="text-gold-500/90">無限次</strong> AI 命理師對話</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>東西方跨傳統融合</span></li>
              <li className="flex items-start gap-3">{checkIcon}<span>僅比 5 次版多 &yen;10</span></li>
            </ul>

            <Link
              href="/pay?plan=pro"
              className="block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void font-bold text-base glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300"
            >
              開通命主專業
            </Link>
            <p className="text-xs text-gray-600 text-center mt-2.5">到期自動停止，無隱藏費用</p>
          </div>
        </div>

        {/* -- High anchor: ¥128 Master 90 天 -- */}
        <div className="max-w-3xl mx-auto mt-8 sm:mt-10">
          <Link
            href="/pay?plan=master"
            className="relative block rounded-2xl border border-gold-500/25 bg-gradient-to-r from-void-lighter/90 via-void to-void-lighter/90 p-6 sm:p-7 press-effect hover:border-gold-500/45 transition-all overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/35 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl chinese-char text-gold-500">{'\u5929'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold text-gold-500">命主尊享 90 天</h3>
                    <span className="px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 text-[10px] font-bold">最超值</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">全功能 90 天通行 · 平均每月 &yen;42 · 比專業版省 <span className="text-gold-500/80 font-medium">&yen;49</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                <div>
                  <span className="text-3xl font-bold text-gradient-gold font-display">&yen;128</span>
                  <span className="text-xs text-gray-600 ml-1 line-through">&yen;177</span>
                </div>
                <span className="text-xs text-gold-500/80 font-medium">開通尊享 &rarr;</span>
              </div>
            </div>
          </Link>
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
