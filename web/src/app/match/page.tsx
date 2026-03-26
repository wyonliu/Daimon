'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BaziResult } from '@/lib/bazi/calculator';
import { CompatibilityResult, CrossBranchInteraction } from '@/lib/bazi/compatibility';
import MatchShareCard from '@/components/MatchShareCard';
import InlinePaywall from '@/components/InlinePaywall';
import { isPro } from '@/lib/subscription';

// ==================== Types ====================

interface PersonData {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female';
}

const defaultPerson = (): PersonData => ({
  name: '', year: '', month: '', day: '', hour: '', gender: 'male',
});

// ==================== Markdown Renderer ====================

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h1>${trimmed.slice(2)}</h1>`);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${trimmed.slice(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    } else if (trimmed.startsWith('&gt; ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<blockquote>${trimmed.slice(5)}</blockquote>`);
    } else if (trimmed === '---' || trimmed === '***') {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push('<hr/>');
    } else if (trimmed === '') {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push('<br/>');
    } else {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<p>${trimmed}</p>`);
    }
  }
  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');
  return result.join('');
}

// ==================== Element Colors ====================

const EC: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#eab308', Metal: '#f59e0b', Water: '#3b82f6',
};

// ==================== Compact Person Form ====================

function PersonForm({ label, labelCn, data, onChange }: {
  label: string;
  labelCn: string;
  data: PersonData;
  onChange: (data: PersonData) => void;
}) {
  const currentYear = new Date().getFullYear();

  const getDaysInMonth = () => {
    if (!data.year || !data.month) return 31;
    return new Date(parseInt(data.year), parseInt(data.month), 0).getDate();
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const lbl = `${String(i).padStart(2, '0')}:00`;
    const shichen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
    return { value: String(i), label: `${lbl} (${shichen[i]}时)` };
  });

  const selectClass = 'w-full bg-void-lighter border border-gray-700 rounded-lg px-2.5 py-2 text-sm text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer input-glow';

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-gold-500">{label}</span>
        <span className="text-xs text-gold-500/50 chinese-char">{labelCn}</span>
      </div>

      {/* Name */}
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Name"
        className="w-full bg-void-lighter border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors"
      />

      {/* Gender */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...data, gender: 'male' })}
          className={`py-1.5 rounded-lg text-xs font-medium transition-all border press-effect ${
            data.gender === 'male'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          Male
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...data, gender: 'female' })}
          className={`py-1.5 rounded-lg text-xs font-medium transition-all border press-effect ${
            data.gender === 'female'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          Female
        </button>
      </div>

      {/* Date: Year / Month / Day */}
      <div className="grid grid-cols-3 gap-2">
        <div className="select-premium">
          <select
            value={data.year}
            onChange={(e) => onChange({ ...data, year: e.target.value })}
            required
            className={selectClass}
          >
            <option value="">Year</option>
            {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="select-premium">
          <select
            value={data.month}
            onChange={(e) => onChange({ ...data, month: e.target.value })}
            required
            className={selectClass}
          >
            <option value="">Mon</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="select-premium">
          <select
            value={data.day}
            onChange={(e) => onChange({ ...data, day: e.target.value })}
            required
            className={selectClass}
          >
            <option value="">Day</option>
            {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hour (optional) */}
      <div className="select-premium">
        <select
          value={data.hour}
          onChange={(e) => onChange({ ...data, hour: e.target.value })}
          className={selectClass}
        >
          <option value="">Hour (optional)</option>
          {hours.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ==================== Score Ring ====================

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8a96e" />
            <stop offset="50%" stopColor="#e8d5a3" />
            <stop offset="100%" stopColor="#c8a96e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gradient-gold">{score}</span>
        <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ==================== Category Bar ====================

function CategoryBar({ label, labelCn, score }: { label: string; labelCn: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 flex-shrink-0">
        <div className="text-xs text-gray-300">{label}</div>
        <div className="text-[9px] text-gray-600 chinese-char">{labelCn}</div>
      </div>
      <div className="flex-1 bg-white/[0.03] rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full element-bar"
          style={{
            background: 'linear-gradient(90deg, #c8a96e, #e8d5a3)',
            '--bar-width': `${score}%`,
            opacity: 0.85,
          } as React.CSSProperties}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right font-mono">{score}</span>
    </div>
  );
}

// ==================== Day Master Faceoff ====================

function DayMasterFaceoff({ relation }: { relation: CompatibilityResult['dayMasterRelation'] }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="text-center">
        <div
          className="text-5xl chinese-char font-bold leading-none mb-1"
          style={{ color: EC[relation.elementA] || '#c8a96e' }}
        >
          {relation.stemA}
        </div>
        <div className="text-xs text-gray-500">{relation.elementA}</div>
      </div>

      <div className="flex flex-col items-center gap-1 px-3">
        <div className="text-gold-500 text-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gold-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7l4-4m0 0l4 4m-4-4v18M16 17l-4 4m0 0l-4-4" />
          </svg>
        </div>
        <div className="text-[9px] text-gray-500 text-center max-w-[100px] leading-tight">
          {relation.elementRelation}
        </div>
      </div>

      <div className="text-center">
        <div
          className="text-5xl chinese-char font-bold leading-none mb-1"
          style={{ color: EC[relation.elementB] || '#c8a96e' }}
        >
          {relation.stemB}
        </div>
        <div className="text-xs text-gray-500">{relation.elementB}</div>
      </div>
    </div>
  );
}

// ==================== Cross Branch Interactions ====================

function CrossBranchList({ interactions }: { interactions: CrossBranchInteraction[] }) {
  if (interactions.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-3">No significant branch interactions detected.</p>;
  }

  const typeColors = {
    clash: 'text-red-400 bg-red-500/10 border-red-500/20',
    combination: 'text-green-400 bg-green-500/10 border-green-500/20',
    harm: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    punishment: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  // Deduplicate: only show unique type+branchA+branchB combinations
  const seen = new Set<string>();
  const unique = interactions.filter(bi => {
    const key = `${bi.type}-${[bi.branchA, bi.branchB].sort().join('')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {unique.slice(0, 10).map((bi, i) => (
        <div key={i} className={`rounded-lg border p-2.5 ${typeColors[bi.type]}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium chinese-char">{bi.branchA}{bi.branchB}{bi.typeCn}</span>
            <span className="text-[10px] opacity-60">{bi.pillarA}(A) — {bi.pillarB}(B)</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto ${
              bi.impact === 'positive' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {bi.impact === 'positive' ? '+' : '-'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Main Page ====================

export default function MatchPage() {
  const router = useRouter();
  const [personA, setPersonA] = useState<PersonData>(defaultPerson());
  const [personB, setPersonB] = useState<PersonData>({ ...defaultPerson(), gender: 'female' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [baziA, setBaziA] = useState<BaziResult | null>(null);
  const [baziB, setBaziB] = useState<BaziResult | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [userIsPro, setUserIsPro] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserIsPro(isPro());
  }, []);

  const canSubmit = personA.year && personA.month && personA.day && personB.year && personB.month && personB.day;

  // Auto-scroll to results when compatibility loads
  useEffect(() => {
    if (compatibility && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [compatibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    setCompatibility(null);
    setBaziA(null);
    setBaziB(null);
    setAiReading('');
    setShowShare(false);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personA: {
            year: parseInt(personA.year),
            month: parseInt(personA.month),
            day: parseInt(personA.day),
            hour: personA.hour ? parseInt(personA.hour) : null,
            gender: personA.gender,
            name: personA.name || 'Person A',
          },
          personB: {
            year: parseInt(personB.year),
            month: parseInt(personB.month),
            day: parseInt(personB.day),
            hour: personB.hour ? parseInt(personB.hour) : null,
            gender: personB.gender,
            name: personB.name || 'Person B',
          },
        }),
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        // Non-streaming response (fallback)
        const data = await response.json();
        if (data.error && !data.compatibility) {
          throw new Error(data.error);
        }
        setCompatibility(data.compatibility);
        setBaziA(data.baziA);
        setBaziB(data.baziB);
        setLoading(false);
        return;
      }

      // SSE streaming response
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
              setBaziA(parsed.baziA);
              setBaziB(parsed.baziB);
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
      setError('Failed to calculate compatibility. Please try again.');
      setLoading(false);
    }
  };

  const nameA = personA.name || 'Person A';
  const nameB = personB.name || 'Person B';

  return (
    <main className="min-h-screen bg-pattern">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gold-500 transition-colors press-effect"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm hidden sm:inline">Home</span>
          </button>

          <div className="text-center">
            <span className="text-gradient-gold font-bold text-lg font-display">Destiny Match</span>
            <span className="text-xs text-gray-600 block chinese-char">合盘 · 缘分配对</span>
          </div>

          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Input Section */}
        <form onSubmit={handleSubmit} className="slide-up">
          {/* Description */}
          <p className="text-center text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
            Enter two birth dates to reveal the cosmic threads connecting your destinies.
            Precise mathematical analysis of Day Master harmony, branch interactions, and elemental balance.
          </p>

          {/* Two Person Forms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <PersonForm label="Person A" labelCn="甲方" data={personA} onChange={setPersonA} />
            <PersonForm label="Person B" labelCn="乙方" data={personB} onChange={setPersonB} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-3.5 rounded-lg font-semibold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 text-void glow-gold-soft hover:glow-gold press-effect btn-shimmer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
                <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
                <span className="loading-dot w-2 h-2 bg-void rounded-full inline-block"></span>
              </span>
            ) : (
              'Reveal Your Destiny Together'
            )}
          </button>

          <p className="text-center text-xs text-gray-600 mt-3 tracking-wide">
            Your data is processed locally. Nothing is stored.
          </p>
        </form>

        {/* Results Section */}
        {compatibility && (
          <div ref={resultsRef} className="mt-10 space-y-6 fade-in">
            {/* Overall Score */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Compatibility Score</div>
              <div className="text-xs text-gold-500/50 chinese-char mb-4">缘分指数</div>
              <ScoreRing score={compatibility.overallScore} size={140} />
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-sm text-gray-300 font-medium">{nameA}</span>
                <span className="text-gold-500/50 text-xs">x</span>
                <span className="text-sm text-gray-300 font-medium">{nameB}</span>
              </div>
            </div>

            {/* Day Master Face-off */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Day Master Dynamic</h3>
                <span className="text-sm text-gold-500/50 chinese-char">日主关系</span>
              </div>
              <DayMasterFaceoff relation={compatibility.dayMasterRelation} />
              <div className="grid grid-cols-2 gap-3 text-center mb-3">
                <div className="rounded-lg bg-white/[0.03] p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">{nameB} is to {nameA}</div>
                  <div className="text-xs text-gray-300 font-medium">{compatibility.dayMasterRelation.tenGodAtoB}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">{nameA} is to {nameB}</div>
                  <div className="text-xs text-gray-300 font-medium">{compatibility.dayMasterRelation.tenGodBtoA}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{compatibility.dayMasterRelation.description}</p>
            </div>

            {userIsPro ? (
              <>
                {/* Category Scores */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Compatibility Dimensions</h3>
                    <span className="text-sm text-gold-500/50 chinese-char">维度分析</span>
                  </div>
                  <div className="space-y-3">
                    <CategoryBar label="Emotional" labelCn="情感" score={compatibility.categoryScores.emotional} />
                    <CategoryBar label="Intellectual" labelCn="智识" score={compatibility.categoryScores.intellectual} />
                    <CategoryBar label="Physical" labelCn="感应" score={compatibility.categoryScores.physical} />
                    <CategoryBar label="Spiritual" labelCn="灵性" score={compatibility.categoryScores.spiritual} />
                    <CategoryBar label="Practical" labelCn="务实" score={compatibility.categoryScores.practical} />
                  </div>
                </div>

                {/* Branch Interactions */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Branch Interactions</h3>
                    <span className="text-sm text-gold-500/50 chinese-char">地支交互</span>
                  </div>
                  <CrossBranchList interactions={compatibility.branchInteractions} />
                </div>

                {/* Element Balance */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Element Balance</h3>
                    <span className="text-sm text-gold-500/50 chinese-char">五行互补</span>
                  </div>

                  {/* Side-by-side element comparison */}
                  <div className="space-y-2 mb-4">
                    {baziA && baziB && baziA.fiveElements.map((elA, i) => {
                      const elB = baziB.fiveElements[i];
                      return (
                        <div key={elA.element} className="flex items-center gap-2">
                          <span className="text-xs w-12 text-gray-400">{elA.elementEn}</span>
                          <div className="flex-1 flex items-center gap-1">
                            {/* A bar (right-aligned) */}
                            <div className="flex-1 flex justify-end">
                              <div
                                className="h-2 rounded-l-full element-bar"
                                style={{
                                  backgroundColor: elA.color,
                                  '--bar-width': `${elA.percentage}%`,
                                  opacity: 0.7,
                                } as React.CSSProperties}
                              />
                            </div>
                            <span className="text-[9px] text-gray-600 w-6 text-center font-mono">{elA.percentage}</span>
                            <span className="text-[9px] text-gray-600 w-6 text-center font-mono">{elB.percentage}</span>
                            {/* B bar (left-aligned) */}
                            <div className="flex-1">
                              <div
                                className="h-2 rounded-r-full element-bar"
                                style={{
                                  backgroundColor: elB.color,
                                  '--bar-width': `${elB.percentage}%`,
                                  opacity: 0.7,
                                } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between text-[10px] text-gray-600 px-12">
                      <span>{nameA}</span>
                      <span>{nameB}</span>
                    </div>
                  </div>

                  {compatibility.elementBalance.complementary.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {compatibility.elementBalance.complementary.map((el) => (
                        <span key={el} className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          Complementary: {el}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 leading-relaxed">{compatibility.elementBalance.description}</p>
                </div>

                {/* Strengths & Challenges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Strengths</h3>
                      <span className="text-sm text-green-500/50 chinese-char">优势</span>
                    </div>
                    <ul className="space-y-2">
                      {compatibility.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                          <span className="text-green-400 flex-shrink-0 mt-0.5">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Challenges</h3>
                      <span className="text-sm text-amber-500/50 chinese-char">挑战</span>
                    </div>
                    <ul className="space-y-2">
                      {compatibility.challenges.map((c, i) => (
                        <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                          <span className="text-amber-400 flex-shrink-0 mt-0.5">!</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Reading */}
                {aiReading && (
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Daimon Reading</h3>
                      <span className="text-sm text-gold-500/50 chinese-char">命理解读</span>
                      {!aiReading.includes('\n\n') && (
                        <span className="relative flex h-2 w-2 ml-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                        </span>
                      )}
                    </div>
                    <div
                      className="chat-content text-sm text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(aiReading) }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Free users: show inline paywall after Day Master face-off */
              <InlinePaywall
                branchClashes={compatibility.branchInteractions.filter(bi => bi.type === 'clash').length}
                onUpgrade={() => router.push('/pricing')}
              />
            )}

            {/* Share Section */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all duration-200 flex items-center justify-center gap-2 press-effect"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {showShare ? 'Hide Share Card' : 'Share Results'}
              </button>
            </div>

            {/* Share Card */}
            {showShare && compatibility && (
              <div className="fade-in">
                <MatchShareCard
                  compatibility={compatibility}
                  nameA={nameA}
                  nameB={nameB}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
