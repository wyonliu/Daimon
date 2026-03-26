'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm from '@/components/BirthForm';
import { getProfile, saveProfile, UserProfile } from '@/lib/user-profile';
import { isPro } from '@/lib/subscription';
import InlinePaywall from '@/components/InlinePaywall';
import { DailyDestiny } from '@/lib/bazi/daily';
import { useLocale } from '@/components/LocaleProvider';

// ==================== Score Ring Component ====================

function ScoreRing({ score, size = 140, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getScoreColor = (s: number) => {
    if (s >= 75) return '#c8a96e';
    if (s >= 50) return '#a3a3a3';
    return '#ef4444';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    if (s >= 35) return 'Caution';
    return 'Challenging';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-display text-gradient-gold">{score}</span>
        <span className="text-xs text-gray-500 mt-0.5">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

// ==================== Score Bar Component ====================

function ScoreBar({ label, score, icon, delay = 0 }: { label: string; score: number; icon: string; delay?: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 400 + delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const getBarColor = (s: number) => {
    if (s >= 75) return 'from-gold-700 to-gold-500';
    if (s >= 50) return 'from-gray-600 to-gray-400';
    return 'from-red-800 to-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-300">{label}</span>
          <span className="text-sm font-medium text-gold-500/80">{score}</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBarColor(score)}`}
            style={{
              width: `${width}%`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== Main Page ====================

export default function DailyPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [daily, setDaily] = useState<DailyDestiny | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userIsPro, setUserIsPro] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check profile on mount
  useEffect(() => {
    const saved = getProfile();
    setProfile(saved);
    setUserIsPro(isPro());
    if (!saved) {
      setShowForm(true);
      setLoading(false);
    }
    setProfileChecked(true);
  }, []);

  // Fetch daily destiny when profile is available
  const fetchDaily = useCallback(async (prof: UserProfile) => {
    setLoading(true);
    setError('');
    setDaily(null);
    setAiReading('');

    try {
      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: prof.year,
          month: prof.month,
          day: prof.day,
          hour: prof.hour,
          gender: prof.gender,
          locale,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch daily destiny');

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // SSE streaming response
        const reader = response.body?.getReader();
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
                if (parsed.daily) {
                  setDaily(parsed.daily);
                  setLoading(false);
                }
                if (parsed.text) {
                  fullText += parsed.text;
                  setAiReading(fullText);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } else {
        // JSON response (fallback when AI is unavailable)
        const data = await response.json();
        if (data.daily) {
          setDaily(data.daily);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading daily destiny:', err);
      setError('Failed to load your daily reading. Please try again.');
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (profileChecked && profile && !showForm) {
      fetchDaily(profile);
    }
  }, [profileChecked, profile, showForm, fetchDaily]);

  const handleFormSubmit = (data: { year: number; month: number; day: number; hour: number | null; name: string; gender: 'male' | 'female' }) => {
    const newProfile: UserProfile = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    saveProfile(newProfile);
    setProfile(newProfile);
    setShowForm(false);
  };

  const todayStr = locale === 'zh-TW'
    ? new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('daily.greeting.morning');
    if (h < 17) return t('daily.greeting.afternoon');
    return t('daily.greeting.evening');
  };

  // ==================== Birth Form View ====================
  if (showForm) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-gray-800/50 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold-500 transition-colors press-effect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">{t('common.home')}</span>
            </button>
            <span className="text-gold-500 font-bold">Daimon</span>
            <div className="w-12" />
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-gold-soft animate-float">
              <span className="text-3xl chinese-char text-gold-500">{'\u904b'}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold mb-3">
              {t('daily.formTitle')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('daily.formSubtitle')}
            </p>
          </div>
          <BirthForm onSubmit={handleFormSubmit} loading={false} />
          {profile && (
            <button
              onClick={() => setShowForm(false)}
              className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gold-500 transition-colors"
            >
              {t('daily.cancelProfile')}
            </button>
          )}
        </div>
      </main>
    );
  }

  // ==================== Loading View ====================
  if (loading && !daily) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-gray-800/50 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold-500 transition-colors press-effect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">{t('common.home')}</span>
            </button>
            <span className="text-gold-500 font-bold">Daimon</span>
            <div className="w-12" />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 fade-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse mb-6">
            <span className="text-2xl chinese-char text-gold-500 animate-pulse-slow">{'\u904b'}</span>
          </div>
          <p className="text-gray-400 mb-2">
            {profile?.name
              ? `${getGreeting()}, ${profile.name}. ${t('daily.loading')}`
              : t('daily.loading')}
          </p>
          <p className="text-xs text-gray-600 mb-6">{todayStr}</p>
          <div className="w-48 h-1 rounded-full overflow-hidden bg-white/[0.03]">
            <div className="h-full loading-shimmer rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  // ==================== Error View ====================
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-200 mb-2">{t('reading.error.title')}</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => profile && fetchDaily(profile)}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect"
          >
            {t('reading.error.retry')}
          </button>
        </div>
      </main>
    );
  }

  if (!daily) return null;

  // ==================== Main Daily View ====================
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
            <span className="text-sm hidden sm:inline">{t('common.home')}</span>
          </button>
          <div className="text-center">
            <span className="text-gold-500 font-bold">{t('daily.title')}</span>
          </div>
          <div className="w-12 text-right">
            {userIsPro && (
              <span className="text-xs text-gold-500/70">{t('common.pro')}</span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Date + GanZhi Header */}
        <div className="text-center slide-up">
          <p className="text-sm text-gray-500 mb-1">{todayStr}</p>
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-3xl chinese-char text-gold-500">{daily.liuRi.ganZhi}</span>
          </div>
          <p className="text-xs text-gray-600">
            {daily.liuRi.elementEn} Day &middot; {daily.liuRi.nayin} ({daily.liuRi.nayinEn})
          </p>
          <p className="text-xs text-gray-700 mt-0.5">
            {daily.liuYue.ganZhi} Month &middot; {daily.liuNian.ganZhi} Year
          </p>
        </div>

        {/* Overall Score Ring */}
        <div className="flex flex-col items-center slide-up slide-up-delay-1">
          <ScoreRing score={daily.scores.overall} />
          <div className="mt-3 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              daily.dayMasterRelation.favorability === 'favorable'
                ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                : daily.dayMasterRelation.favorability === 'unfavorable'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              {daily.dayMasterRelation.tenGod} ({daily.dayMasterRelation.tenGodEn})
              {daily.dayMasterRelation.favorability === 'favorable' && ' \u2014 Auspicious'}
              {daily.dayMasterRelation.favorability === 'unfavorable' && ' \u2014 Challenging'}
            </span>
          </div>
        </div>

        {/* Score Bars */}
        <div className="glass-card rounded-2xl p-5 space-y-4 slide-up slide-up-delay-2">
          <ScoreBar label={t('daily.career')} score={daily.scores.career} icon="&#128188;" delay={0} />
          <ScoreBar label={t('daily.relationships')} score={daily.scores.relationships} icon="&#128150;" delay={100} />
          <ScoreBar label={t('daily.health')} score={daily.scores.health} icon="&#127807;" delay={200} />
          <ScoreBar label={t('daily.wealth')} score={daily.scores.wealth} icon="&#128176;" delay={300} />
        </div>

        {/* Branch Interaction Alerts */}
        {daily.branchInteractions.length > 0 && (
          <div className="space-y-2 slide-up slide-up-delay-3">
            {daily.branchInteractions.map((bi, idx) => (
              <div
                key={idx}
                className={`rounded-xl px-4 py-3 text-sm border ${
                  bi.impact === 'negative'
                    ? 'bg-red-500/5 border-red-500/15 text-red-300'
                    : bi.impact === 'positive'
                    ? 'bg-gold-500/5 border-gold-500/15 text-gold-500'
                    : 'bg-gray-500/5 border-gray-500/15 text-gray-400'
                }`}
              >
                <div className="font-medium">{bi.type}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {bi.branches} &middot; {bi.withPillar} Pillar
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lucky Section */}
        <div className="glass-card rounded-2xl p-5 slide-up slide-up-delay-3">
          <h3 className="text-sm font-medium text-gold-500 mb-4">{t('daily.lucky')}</h3>

          {/* Colors */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">{t('daily.colors')}</div>
            <div className="flex gap-2">
              {daily.luckyColors.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/10"
                    style={{ background: getColorHex(color) }}
                  />
                  <span className="text-xs text-gray-300">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Directions */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">{t('daily.directions')}</div>
            <div className="flex flex-wrap gap-2">
              {daily.luckyDirections.map((dir, i) => (
                <span key={i} className="text-xs bg-void-lighter px-2.5 py-1 rounded-full text-gray-300 border border-gray-700/50">
                  &#129517; {dir}
                </span>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-green-400/70 mb-2">{t('daily.do')}</div>
              <ul className="space-y-1">
                {daily.luckyActivities.map((act, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                    <span className="text-green-400/60 mt-px">&#10003;</span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-red-400/70 mb-2">{t('daily.avoid')}</div>
              <ul className="space-y-1">
                {daily.avoidActivities.map((act, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                    <span className="text-red-400/60 mt-px">&#10007;</span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Reading */}
        {userIsPro ? (
          <div className="glass-card rounded-2xl p-5 slide-up">
            <h3 className="text-sm font-medium text-gold-500 mb-3">{t('daily.reading')}</h3>
            {aiReading ? (
              <div className="chat-content text-sm text-gray-300 leading-relaxed prose-sm">
                {aiReading.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} className="text-gold-500 font-semibold mt-3 mb-1 text-sm">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.match(/^\*\*.*\*\*/)) {
                    const parts = line.split(/(\*\*[^*]+\*\*)/);
                    return (
                      <p key={i} className="mb-2">
                        {parts.map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j} className="text-gold-500/90">{part.replace(/\*\*/g, '')}</strong>
                            : <span key={j}>{part}</span>
                        )}
                      </p>
                    );
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="mb-2">{line}</p>;
                })}
                {!aiReading.includes('[DONE]') && loading && (
                  <span className="inline-flex gap-1 ml-1">
                    <span className="typing-dot w-1.5 h-1.5 bg-gold-500/50 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-gold-500/50 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-gold-500/50 rounded-full inline-block" />
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                </span>
                {t('daily.generating')}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5 slide-up">
            <h3 className="text-sm font-medium text-gold-500 mb-3">{t('daily.reading')}</h3>
            {aiReading ? (
              <div className="relative">
                <div className="chat-content text-sm text-gray-300 leading-relaxed prose-sm">
                  <p className="mb-2">{aiReading.split('\n').find(l => l.trim() !== '') || aiReading.slice(0, 150)}</p>
                </div>
                <InlinePaywall
                  onUpgrade={() => router.push('/pricing')}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                </span>
                {t('daily.generating')}
              </div>
            )}
          </div>
        )}

        {/* Change Birth Data */}
        <div className="text-center pb-8">
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-gray-600 hover:text-gold-500/70 transition-colors"
          >
            {t('daily.changeBirth')}
          </button>
        </div>
      </div>
    </main>
  );
}

// ==================== Helpers ====================

function getColorHex(name: string): string {
  const map: Record<string, string> = {
    Green: '#22c55e',
    Emerald: '#10b981',
    Teal: '#14b8a6',
    Red: '#ef4444',
    Purple: '#a855f7',
    Orange: '#f97316',
    Yellow: '#eab308',
    Brown: '#92400e',
    Beige: '#d4a574',
    White: '#f1f5f9',
    Gold: '#c8a96e',
    Silver: '#94a3b8',
    Black: '#1e293b',
    Blue: '#3b82f6',
    Navy: '#1e3a5f',
  };
  return map[name] || '#888';
}
