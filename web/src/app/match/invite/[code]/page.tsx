'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decodeInvite } from '@/lib/invite';
import { isPro, canUseReading, useReading } from '@/lib/subscription';
import { CompatibilityResult } from '@/lib/bazi/compatibility';
import InlinePaywall from '@/components/InlinePaywall';

// ==================== Person Form (compact) ====================

interface PersonFormData {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female';
}

function InviteForm({ onSubmit, loading }: { onSubmit: (data: PersonFormData) => void; loading: boolean }) {
  const [form, setForm] = useState<PersonFormData>({
    name: '', year: '', month: '', day: '', hour: '', gender: 'female',
  });
  const currentYear = new Date().getFullYear();

  const getDaysInMonth = () => {
    if (!form.year || !form.month) return 31;
    return new Date(parseInt(form.year), parseInt(form.month), 0).getDate();
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const lbl = `${String(i).padStart(2, '0')}:00`;
    const shichen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
    return { value: String(i), label: `${lbl} (${shichen[i]}時)` };
  });

  const canSubmit = form.year && form.month && form.day;
  const selectClass = 'w-full bg-void-lighter border border-gray-700 rounded-lg px-2.5 py-2.5 text-sm text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer input-glow';

  return (
    <div className="space-y-4">
      {/* Name */}
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="你的名字"
        className="w-full bg-void-lighter border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors"
      />

      {/* Gender */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, gender: 'male' })}
          className={`py-2 rounded-lg text-sm font-medium transition-all border press-effect ${
            form.gender === 'male'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          男
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, gender: 'female' })}
          className={`py-2 rounded-lg text-sm font-medium transition-all border press-effect ${
            form.gender === 'female'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          女
        </button>
      </div>

      {/* Date */}
      <div className="grid grid-cols-3 gap-2">
        <div className="select-premium">
          <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={selectClass}>
            <option value="">年</option>
            {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="select-premium">
          <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className={selectClass}>
            <option value="">月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="select-premium">
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className={selectClass}>
            <option value="">日</option>
            {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hour */}
      <div className="select-premium">
        <select value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })} className={selectClass}>
          <option value="">時辰（選填）</option>
          {hours.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(form)}
        disabled={loading || !canSubmit}
        className="w-full py-3.5 rounded-lg font-semibold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void glow-gold-soft press-effect btn-shimmer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
            <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block" />
          </span>
        ) : (
          '揭曉你們的緣分'
        )}
      </button>
    </div>
  );
}

// ==================== Score Ring ====================

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#c8a96e" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gradient-gold">{score}</span>
        <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ==================== Markdown Renderer ====================

function renderMarkdown(text: string): string {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) result.push(`<h3>${trimmed.slice(4)}</h3>`);
    else if (trimmed.startsWith('## ')) result.push(`<h2>${trimmed.slice(3)}</h2>`);
    else if (trimmed.startsWith('- ')) result.push(`<li>${trimmed.slice(2)}</li>`);
    else if (trimmed === '') result.push('<br/>');
    else result.push(`<p>${trimmed}</p>`);
  }
  return result.join('');
}

// ==================== Main Page ====================

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [invite, setInvite] = useState<{
    nameA: string; yearA: number; monthA: number; dayA: number;
    hourA: number | null; genderA: 'male' | 'female';
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Results
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [userIsPro, setUserIsPro] = useState(false);

  useEffect(() => {
    setUserIsPro(isPro() || canUseReading());
    const decoded = decodeInvite(code);
    if (decoded) {
      setInvite(decoded);
    } else {
      setNotFound(true);
    }
  }, [code]);

  const handleSubmit = useCallback(async (formData: PersonFormData) => {
    if (!invite) return;
    setLoading(true);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personA: {
            year: invite.yearA,
            month: invite.monthA,
            day: invite.dayA,
            hour: invite.hourA,
            gender: invite.genderA,
            name: invite.nameA,
          },
          personB: {
            year: parseInt(formData.year),
            month: parseInt(formData.month),
            day: parseInt(formData.day),
            hour: formData.hour ? parseInt(formData.hour) : null,
            gender: formData.gender,
            name: formData.name || '你',
          },
          locale: 'zh-TW',
        }),
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setCompatibility(data.compatibility);
        if (!isPro()) useReading();
        setLoading(false);
        return;
      }

      // SSE streaming
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'data') {
              setCompatibility(parsed.compatibility);
              if (!isPro()) useReading();
              setLoading(false);
            } else if (parsed.type === 'text' && parsed.text) {
              fullText += parsed.text;
              setAiReading(fullText);
            }
          } catch {
            // Skip malformed
          }
        }
      }
    } catch (err) {
      console.error('Match error:', err);
      setLoading(false);
    }
  }, [invite]);

  // ==================== Not Found ====================
  if (notFound) {
    return (
      <main className="min-h-screen bg-pattern flex items-center justify-center px-4">
        <div className="text-center max-w-sm fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-500/15 to-gold-700/10 border border-gold-500/30 flex items-center justify-center">
            <span className="text-4xl chinese-char text-gold-500">{'\u7de3'}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100 mb-3">邀請已過期</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            這個緣分配對邀請可能已過期或無效。<br />
            你可以直接開始一次新的配對。
          </p>
          <button
            onClick={() => router.push('/match')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect btn-shimmer"
          >
            開始新配對
          </button>
        </div>
      </main>
    );
  }

  // ==================== Loading invite data ====================
  if (!invite) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      </main>
    );
  }

  // ==================== Results View ====================
  if (compatibility) {
    const EC: Record<string, string> = {
      Wood: '#22c55e', Fire: '#ef4444', Earth: '#eab308', Metal: '#f59e0b', Water: '#3b82f6',
    };
    const ECN: Record<string, string> = {
      Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水',
    };

    return (
      <main className="min-h-screen bg-pattern">
        <header className="border-b border-gray-800/50 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/match')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold-500 transition-colors press-effect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-gradient-gold font-bold">緣分配對</span>
            <div className="w-12" />
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          {/* Score */}
          <div className="glass-card rounded-2xl p-6 text-center fade-in">
            <div className="text-xs text-gray-500 tracking-wider mb-1">契合度</div>
            <ScoreRing score={compatibility.overallScore} size={140} />
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-sm text-gray-300 font-medium">{invite.nameA}</span>
              <span className="text-gold-500/50 text-xs">×</span>
              <span className="text-sm text-gray-300 font-medium">你</span>
            </div>
          </div>

          {/* Day Master Face-off */}
          <div className="glass-card rounded-2xl p-5 fade-in">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">日主關係</h3>
            <div className="flex items-center justify-center gap-6 py-3">
              <div className="text-center">
                <div className="text-5xl chinese-char font-bold" style={{ color: EC[compatibility.dayMasterRelation.elementA] || '#c8a96e' }}>
                  {compatibility.dayMasterRelation.stemA}
                </div>
                <div className="text-xs text-gray-500 mt-1">{ECN[compatibility.dayMasterRelation.elementA] || compatibility.dayMasterRelation.elementA}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-gold-500/50 text-lg mb-1">×</div>
                <div className="text-[10px] text-gray-500 max-w-[90px] leading-tight">
                  {compatibility.dayMasterRelation.elementRelation}
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl chinese-char font-bold" style={{ color: EC[compatibility.dayMasterRelation.elementB] || '#c8a96e' }}>
                  {compatibility.dayMasterRelation.stemB}
                </div>
                <div className="text-xs text-gray-500 mt-1">{ECN[compatibility.dayMasterRelation.elementB] || compatibility.dayMasterRelation.elementB}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed text-center mt-2">
              {compatibility.dayMasterRelation.description}
            </p>
          </div>

          {userIsPro ? (
            <>
              {/* Category Scores */}
              <div className="glass-card rounded-2xl p-5 fade-in">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">契合維度</h3>
                <div className="space-y-3">
                  {[
                    { label: '情感', score: compatibility.categoryScores.emotional },
                    { label: '智識', score: compatibility.categoryScores.intellectual },
                    { label: '感應', score: compatibility.categoryScores.physical },
                    { label: '靈性', score: compatibility.categoryScores.spiritual },
                    { label: '務實', score: compatibility.categoryScores.practical },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-12">{cat.label}</span>
                      <div className="flex-1 bg-white/[0.03] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full element-bar"
                          style={{
                            background: 'linear-gradient(90deg, #c8a96e, #e8d5a3)',
                            '--bar-width': `${cat.score}%`,
                            opacity: 0.85,
                          } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{cat.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reading */}
              {aiReading && (
                <div className="glass-card rounded-2xl p-5 fade-in">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4">命理解讀</h3>
                  <div
                    className="chat-content text-sm text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(aiReading) }}
                  />
                </div>
              )}
            </>
          ) : (
            <InlinePaywall
              branchClashes={compatibility.branchInteractions.filter(bi => bi.type === 'clash').length}
            />
          )}

          {/* CTA: Do your own match */}
          <div className="text-center space-y-3 pb-8">
            <button
              onClick={() => router.push('/match')}
              className="w-full py-3.5 rounded-lg font-semibold text-base bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect btn-shimmer"
            >
              開始你自己的配對
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gold-500/50 hover:text-gold-500 transition-all press-effect"
            >
              探索更多命理功能
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==================== Invite Landing (Input Form) ====================
  return (
    <main className="min-h-screen bg-pattern">
      <header className="border-b border-gray-800/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-center">
          <span className="text-gold-500 font-bold">Daimon</span>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-10">
        {/* Sacred invitation card */}
        <div className="text-center mb-8 slide-up">
          {/* Pulsing icon */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/15 to-gold-700/10 border border-gold-500/30 flex items-center justify-center">
              <span className="text-4xl chinese-char text-gold-500">{'\u7de3'}</span>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-gold-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
          </div>

          <h1 className="text-xl font-bold text-gray-100 mb-2">
            {invite.nameA} 想知道你們的緣分
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            對方已完成八字推演，正在等待你的生辰資料，<br />
            以揭曉你們命中注定的連結。
          </p>
        </div>

        {/* Teaser: what's already been calculated */}
        <div className="glass-card rounded-2xl p-5 mb-6 slide-up slide-up-delay-1">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 text-gold-500/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-400">{invite.nameA} 的八字四柱已排定</span>
            </div>
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 text-gold-500/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-400">五行互補分析已就緒</span>
            </div>
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 text-gold-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm text-gold-500 font-medium">等待你的生辰，揭曉緣分配對</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="slide-up slide-up-delay-2">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-4">輸入你的生辰</h3>
            <InviteForm onSubmit={handleSubmit} loading={loading} />
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            資料僅用於命理推演，不會被存儲或分享
          </p>
        </div>
      </div>
    </main>
  );
}
