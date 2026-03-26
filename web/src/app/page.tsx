'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm from '@/components/BirthForm';
import { saveProfile } from '@/lib/user-profile';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: { year: number; month: number; day: number; hour: number | null; name: string; gender: 'male' | 'female' }) => {
    setLoading(true);
    // Save profile for Daily Destiny feature
    saveProfile({
      name: data.name || 'Seeker',
      year: data.year,
      month: data.month,
      day: data.day,
      hour: data.hour,
      gender: data.gender,
      savedAt: new Date().toISOString(),
    });
    const params = new URLSearchParams({
      y: String(data.year),
      m: String(data.month),
      d: String(data.day),
      n: data.name,
      g: data.gender,
    });
    if (data.hour !== null) {
      params.set('h', String(data.hour));
    }
    router.push(`/reading?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-gold-500/[0.06] blur-[80px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Floating sigil */}
          <div className="inline-block mb-8 slide-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-gold-soft animate-float">
              <span className="text-4xl chinese-char text-gold-500">命</span>
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 slide-up slide-up-delay-1">
            <span className="text-gradient-gold">Know Your Destiny</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4 slide-up slide-up-delay-2">
            The precision destiny engine that reads both{' '}
            <span className="text-gold-500/90 font-medium">BaZi</span> and{' '}
            <span className="text-indigo-400/90 font-medium">Western Astrology</span>{' '}
            &mdash; we calculate with mathematical precision. The interpretation synthesizes ancient wisdom.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mb-10 slide-up slide-up-delay-2">
            <span>Astronomical precision</span>
            <span className="text-gold-500/30">&middot;</span>
            <span>2000-year tradition</span>
            <span className="text-gold-500/30">&middot;</span>
            <span>Verifiable calculations</span>
          </div>

          <a
            href="#reading"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold text-lg glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300 slide-up slide-up-delay-3"
          >
            Begin Your Reading
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ═══════════════════ BIRTH FORM ═══════════════════ */}
      <section id="reading" className="px-4 pb-20 sm:pb-28 scroll-mt-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold mb-3">
              Enter Your Birth Details
            </h2>
            <p className="text-sm text-gray-500">
              Precision matters. Your exact birth data unlocks the deepest analysis.
            </p>
          </div>
          <BirthForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </section>

      {/* ═══════════════════ DIVIDER ═══════════════════ */}
      <div className="divider-gold mx-auto w-full max-w-4xl" />

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-gold mb-4">
              What Sets Daimon Apart
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Not another horoscope app. A precision destiny engine built on ancient systems and astronomical calculation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-6 group-hover:glow-gold-soft transition-all duration-300">
                <span className="text-2xl chinese-char text-gold-500">柱</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-100 mb-3">Four Pillars Engine</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Professional-grade BaZi analysis that goes far beyond basic charts.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  <span>神煞 &mdash; Spirit Sha stars</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  <span>格局 &mdash; Chart structure type</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  <span>大运 &mdash; Decade luck pillars</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  <span>流年 &mdash; Annual forecasting</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                <span className="text-xl">&#9798;&#65039;</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-100 mb-3">Cross-Tradition Synthesis</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Where Eastern and Western systems converge, the pattern is undeniable. Where they diverge, hidden complexity emerges.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400/60 flex-shrink-0" />
                  BaZi Day Master + Sun Sign alignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400/60 flex-shrink-0" />
                  Five Elements + Planetary influences
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400/60 flex-shrink-0" />
                  Ten Gods + Astrological houses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400/60 flex-shrink-0" />
                  Unified destiny narrative
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-6 group-hover:glow-gold-soft transition-all duration-300">
                <span className="text-2xl chinese-char text-gold-500">師</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-100 mb-3">Deep Chart Synthesis</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                This is not a chatbot with fortune cookie responses. Daimon delivers the depth of a professional consultation.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  Deep character and personality analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  Career, wealth, and relationship insights
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  Timing guidance for major decisions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500/60 flex-shrink-0" />
                  Follow-up Q&amp;A consultations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOCIAL PROOF ═══════════════════ */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl py-6 px-6 sm:px-10">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            <div>
              <div className="text-2xl font-bold text-gradient-gold font-display">10,000+</div>
              <div className="text-xs text-gray-500 mt-1 tracking-wider uppercase">Readings Delivered</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-700/50" />
            <div>
              <div className="text-2xl font-bold text-gradient-gold font-display">98%</div>
              <div className="text-xs text-gray-500 mt-1 tracking-wider uppercase">Accuracy Rate</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-700/50" />
            <div>
              <div className="text-2xl font-bold text-gradient-gold font-display">4.9 &#9733;</div>
              <div className="text-xs text-gray-500 mt-1 tracking-wider uppercase">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <div className="divider-gold mx-auto w-full" />
      <footer className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center">
              <span className="text-sm chinese-char text-gold-500">命</span>
            </div>
            <span className="text-sm font-display text-gray-400">Daimon</span>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <a href="/pricing" className="text-sm text-gray-500 hover:text-gold-500 transition-colors">
              View pricing plans
            </a>
            <p className="text-xs text-gray-600 text-center sm:text-right max-w-sm">
              Metaphysical analysis for self-reflection and personal insight.
              Not a substitute for professional advice.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-700 text-center mt-6">
          &copy; {new Date().getFullYear()} Daimon &middot; Precision destiny engine
        </p>
      </footer>
    </main>
  );
}
