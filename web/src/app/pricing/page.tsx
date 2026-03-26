'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPro, setLoadingPro] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleProCheckout = async () => {
    setLoadingPro(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', returnUrl: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Dev fallback
        router.push('/success?session_id=dev_mock');
      }
    } catch {
      // Dev fallback
      router.push('/success?session_id=dev_mock');
    } finally {
      setLoadingPro(false);
    }
  };

  const faqs = [
    {
      q: 'How accurate is the BaZi analysis?',
      a: 'Daimon uses a professional-grade Four Pillars engine with accurate Heavenly Stem and Earthly Branch calculations, Ten Gods mapping, Spirit Sha (神煞) identification, and Five Element strength analysis. The computational accuracy matches what a trained practitioner would produce.',
    },
    {
      q: 'What does the Cross-Tradition Synthesis add?',
      a: 'Most destiny tools operate in one tradition. Daimon reads your chart through both BaZi and Western Astrology simultaneously, then synthesizes the results. Where both systems agree, the pattern is strongest. Where they diverge, hidden complexity emerges that neither tradition reveals alone.',
    },
    {
      q: 'Do I need to know my exact birth hour?',
      a: 'The birth hour (时辰) unlocks the Hour Pillar, which reveals your inner self and later life trajectory. Without it, Daimon still provides a thorough analysis using Year, Month, and Day pillars. For the deepest reading, include your birth hour.',
    },
    {
      q: 'Can I cancel my Pro subscription anytime?',
      a: 'Yes. Cancel anytime from your account settings. You keep Pro access through the end of your billing period. No contracts, no hidden fees.',
    },
    {
      q: 'Is my birth data stored or shared?',
      a: 'Your birth data is used only to generate your reading. We do not sell or share personal data. Readings are processed in real-time and you control what is saved to your account.',
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
            Back
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
            Choose Your Path
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto slide-up slide-up-delay-1">
            Every journey begins with a single step. Pick the depth that matches your quest.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 sm:gap-8 items-start">

          {/* ── Seeker (Free) ── */}
          <div className="glass-card rounded-2xl p-8 sm:p-10 card-hover slide-up">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-5">
                <span className="text-2xl chinese-char text-gray-400">探</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gray-200 mb-1">Seeker</h3>
              <p className="text-sm text-gray-500">Explore the basics</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-100 font-display tracking-tight">Free</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-400 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>3 readings per month</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Basic BaZi four pillars chart</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Western Sun Sign overview</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Day Master identification</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-gray-600">No chat follow-up</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="text-gray-600">No 神煞 or 格局 analysis</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/#reading')}
              className="block w-full text-center py-3.5 rounded-xl border border-gray-700 text-gray-300 font-medium hover:border-gold-500/40 hover:text-gold-500 transition-all duration-300 press-effect"
            >
              Start Free
            </button>
          </div>

          {/* ── Pro ($9.99) ── */}
          <div className="relative glass-card rounded-2xl p-8 sm:p-10 card-hover border-gold-500/30 shadow-[0_0_60px_rgba(200,169,110,0.08)] slide-up slide-up-delay-1">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void text-xs font-bold tracking-wider uppercase shadow-lg">
                Most Popular
              </span>
            </div>

            <div className="mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mb-5 glow-gold-soft">
                <span className="text-2xl chinese-char text-gold-500">道</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gold-500 mb-1">Pro</h3>
              <p className="text-sm text-gray-500">Full depth, unlimited power</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gradient-gold font-display tracking-tight">$9.99</span>
              <span className="text-sm text-gray-500 ml-2">/month</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-300 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span><strong className="text-gold-500/90">Unlimited</strong> readings</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Full BaZi: 神煞, 格局, 大運, 流年</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Cross-tradition East &times; West synthesis</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Unlimited consultations</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Shareable destiny cards</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Ten Gods &amp; Five Element balance</span>
              </li>
            </ul>

            <button
              onClick={handleProCheckout}
              disabled={loadingPro}
              className="block w-full text-center py-4 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void font-bold text-lg glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingPro ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
                  <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
                  <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
                </span>
              ) : (
                'Subscribe to Pro'
              )}
            </button>
            <p className="text-xs text-gray-600 text-center mt-3">Cancel anytime. No hidden fees.</p>
          </div>

          {/* ── Master ($29.99) ── */}
          <div className="relative glass-card rounded-2xl p-8 sm:p-10 card-hover slide-up slide-up-delay-2">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-5 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs font-bold tracking-wider uppercase">
                Coming Soon
              </span>
            </div>

            <div className="mb-8 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-5">
                <span className="text-2xl chinese-char text-gray-400">師</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-gray-200 mb-1">Master</h3>
              <p className="text-sm text-gray-500">The ultimate reading</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-100 font-display tracking-tight">$29.99</span>
              <span className="text-sm text-gray-500 ml-2">/month</span>
            </div>

            <div className="divider-gold mb-8" />

            <ul className="space-y-4 text-sm text-gray-400 mb-10">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Priority analysis with extended context</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Downloadable PDF destiny reports</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Annual &amp; decade forecasting</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Compatibility &amp; synastry analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-500/70 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Early access to new features</span>
              </li>
            </ul>

            <button
              disabled
              className="block w-full text-center py-3.5 rounded-xl border border-gray-700 text-gray-600 font-medium cursor-not-allowed"
            >
              Notify Me
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ DIVIDER ═══════════════════ */}
      <div className="divider-gold mx-auto w-full max-w-4xl" />

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-gold text-center mb-14">
            Frequently Asked
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

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <div className="divider-gold mx-auto w-full" />
      <footer className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center">
              <span className="text-sm chinese-char text-gold-500">命</span>
            </div>
            <span className="text-sm font-display text-gray-400">Daimon</span>
          </button>
          <p className="text-xs text-gray-600 text-center sm:text-right max-w-sm">
            Metaphysical analysis for self-reflection and personal insight.
            Not a substitute for professional advice.
          </p>
        </div>
        <p className="text-xs text-gray-700 text-center mt-6">
          &copy; {new Date().getFullYear()} Daimon &middot; Precision destiny engine
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
