'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import BaziChart from '@/components/BaziChart';
import ChatInterface from '@/components/ChatInterface';
import ShareCard from '@/components/ShareCard';
import PrecisionProof from '@/components/PrecisionProof';
import PaywallModal from '@/components/PaywallModal';
import InlinePaywall from '@/components/InlinePaywall';
import { BaziResult } from '@/lib/bazi/calculator';
import { ZodiacResult } from '@/lib/astro/zodiac';
import { canUseReading, useReading, getUserPlan, getReadingsRemaining, isPro, activatePro } from '@/lib/subscription';

function ReadingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const year = searchParams.get('y');
  const month = searchParams.get('m');
  const day = searchParams.get('d');
  const hour = searchParams.get('h');
  const name = searchParams.get('n') || 'Seeker';
  const gender = searchParams.get('g') || 'male';

  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [zodiac, setZodiac] = useState<ZodiacResult | null>(null);
  const [baziText, setBaziText] = useState('');
  const [zodiacText, setZodiacText] = useState('');
  const [initialReading, setInitialReading] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'reading' | 'share' | 'verify'>('chart');
  const [showPaywall, setShowPaywall] = useState(false);
  const [readingsRemaining, setReadingsRemaining] = useState(3);
  const [userIsPro, setUserIsPro] = useState(false);
  const [readingCounted, setReadingCounted] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showInlinePaywall, setShowInlinePaywall] = useState(false);

  // Check for Stripe success redirect params
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan') as 'pro' | 'master' | null;
    if (sessionId && plan) {
      activatePro(sessionId, plan);
      setUserIsPro(true);
      setShowPaywall(false);
    }
  }, [searchParams]);

  // Check subscription status on mount
  useEffect(() => {
    const pro = isPro();
    setUserIsPro(pro);
    setReadingsRemaining(getReadingsRemaining());

    if (!canUseReading()) {
      setShowPaywall(true);
      setLoading(false);
    } else if (!pro) {
      const plan = getUserPlan();
      // First reading ever: full reading. Subsequent free readings: truncated.
      if (plan.freeReadingsUsed > 0) {
        setIsTruncated(true);
      }
    }
    setSubscriptionChecked(true);
  }, []);


  useEffect(() => {
    if (!year || !month || !day) {
      router.push('/');
      return;
    }
    if (!subscriptionChecked) return;

    // Don't load data if paywall is showing
    if (showPaywall) return;

    async function loadData() {
      try {
        // Step 1: Calculate chart
        const calcResponse = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, month, day, hour, gender }),
        });

        if (!calcResponse.ok) throw new Error('Calculation failed');
        const calcData = await calcResponse.json();

        setBazi(calcData.bazi);
        setZodiac(calcData.zodiac);
        setBaziText(calcData.baziText);
        setZodiacText(calcData.zodiacText);

        // Step 2: Get initial AI reading
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baziText: calcData.baziText,
            zodiacText: calcData.zodiacText,
            isInitial: true,
            truncated: isTruncated,
          }),
        });

        if (!chatResponse.ok) throw new Error('AI reading failed');

        const reader = chatResponse.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.paywall) {
                  setShowInlinePaywall(true);
                } else if (parsed.text) {
                  fullText += parsed.text;
                  setInitialReading(fullText);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        // Count this reading usage
        if (!readingCounted && fullText.length > 100) {
          useReading();
          setReadingCounted(true);
          setReadingsRemaining(getReadingsRemaining());
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading reading:', err);
        setError('Failed to generate your reading. Please try again in a moment.');
        setLoading(false);
      }
    }

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day, hour, router, showPaywall, subscriptionChecked, isTruncated]);

  if (showPaywall) {
    const plan = getUserPlan();
    return (
      <main className="min-h-screen">
        <PaywallModal
          onDismiss={() => router.push('/')}
          readingsUsed={plan.freeReadingsUsed}
          maxReadings={plan.maxFreeReadings}
          chartPattern={bazi?.chartPattern ? `${bazi.chartPattern.name} (${bazi.chartPattern.nameEn})` : undefined}
          branchClashes={bazi?.branchInteractions?.filter((bi: { type: string }) => bi.type === 'clash').length}
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-200 mb-2">The Stars Are Unclear</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gold-500 transition-colors press-effect"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm hidden sm:inline">Home</span>
          </button>

          <div className="text-center min-w-0">
            <span className="text-gold-500 font-bold">Daimon</span>
            <span className="text-gray-600 text-sm ml-2 hidden sm:inline">
              {`${name}\u2019s Reading \u00b7 ${year}/${month}/${day}`}
            </span>
          </div>

          <div className="text-right min-w-[2rem] sm:min-w-[5rem]">
            {!userIsPro && (
              <span className="text-xs text-gray-500">
                <span className="text-gold-500/70">{readingsRemaining}</span>
                <span className="hidden sm:inline">/{getUserPlan().maxFreeReadings} free</span>
              </span>
            )}
            {userIsPro && (
              <span className="text-xs text-gold-500/70">Pro</span>
            )}
          </div>
        </div>
      </header>

      {/* Trust Line */}
      <div className="max-w-6xl mx-auto px-4 py-1.5">
        <p className="text-[10px] text-gray-600 text-center tracking-wider uppercase">
          Calculated by astronomical ephemeris engine &middot; 四柱命理 tradition &middot; Est. 2000+ years
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800/50 px-4">
        <div className="max-w-6xl mx-auto flex gap-1 tabs-scroll">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'chart'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Chart Analysis
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'reading'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Your Reading
            {loading && initialReading === '' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
            )}
            {initialReading && !loading && (
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'share'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Share
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'verify'
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            How It Works
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {loading && !bazi ? (
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse mb-6">
              <span className="text-2xl chinese-char text-gold-500 animate-pulse-slow">命</span>
            </div>
            <p className="text-gray-400 mb-2">Casting your destiny chart...</p>
            <p className="text-xs text-gray-600 mb-6">Analyzing Four Pillars and planetary alignments</p>
            <div className="w-48 h-1 rounded-full overflow-hidden bg-white/[0.03]">
              <div className="h-full loading-shimmer rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'chart' && bazi && zodiac && (
              <div className="max-w-3xl mx-auto tab-content">
                <BaziChart bazi={bazi} zodiac={zodiac} />
                {loading && (
                  <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-500/5 border border-gold-500/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                    <span className="text-xs text-gold-500/70">Chart synthesis in progress...</span>
                  </div>
                )}
                {!loading && initialReading && activeTab === 'chart' && (
                  <button
                    onClick={() => setActiveTab('reading')}
                    className="mt-4 w-full py-3 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-500 text-sm hover:bg-gold-500/15 transition-colors press-effect flex items-center justify-center gap-2"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                    Your reading is ready — tap to view
                  </button>
                )}
              </div>
            )}

            {activeTab === 'reading' && (
              <div className="max-w-3xl mx-auto tab-content" style={{ height: showInlinePaywall ? 'auto' : 'calc(100dvh - 200px)' }}>
                {initialReading ? (
                  <>
                    <ChatInterface
                      baziText={baziText}
                      zodiacText={zodiacText}
                      initialReading={initialReading}
                      disableChat={showInlinePaywall}
                    />
                    {showInlinePaywall && (
                      <InlinePaywall
                        chartPattern={bazi?.chartPattern ? `${bazi.chartPattern.name} (${bazi.chartPattern.nameEn})` : undefined}
                        currentDaYun={bazi?.currentDaYun?.ganZhi}
                        nextDaYunYear={bazi?.currentDaYun ? bazi.currentDaYun.endYear + 1 : undefined}
                        branchClashes={bazi?.branchInteractions?.filter((bi: { type: string }) => bi.type === 'clash').length}
                        onUpgrade={() => router.push('/pricing')}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse mb-4">
                      <span className="text-lg chinese-char text-gold-500">命</span>
                    </div>
                    <p className="text-gray-400 mt-2 mb-1">Synthesizing your chart...</p>
                    <p className="text-xs text-gray-600">Synthesizing Eastern and Western traditions</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'share' && bazi && zodiac && (
              <div className="max-w-md mx-auto tab-content overflow-y-auto">
                <ShareCard bazi={bazi} zodiac={zodiac} name={name} />
              </div>
            )}

            {activeTab === 'verify' && bazi && (
              <div className="max-w-3xl mx-auto tab-content">
                <PrecisionProof
                  bazi={bazi}
                  year={Number(year)}
                  month={Number(month)}
                  day={Number(day)}
                  hour={hour ? Number(hour) : null}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse mb-4">
          <span className="text-xl chinese-char text-gold-500">命</span>
        </div>
        <p className="text-sm text-gray-500">Preparing your reading...</p>
      </main>
    }>
      <ReadingContent />
    </Suspense>
  );
}
