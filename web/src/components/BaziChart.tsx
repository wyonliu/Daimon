'use client';

import { BaziResult, DaYunPillar, LiuNianInfo } from '@/lib/bazi/calculator';
import { ShenSha as ShenShaType, KongWang, ChartPattern } from '@/lib/bazi/shensha';
import { ZodiacResult } from '@/lib/astro/zodiac';

interface BaziChartProps {
  bazi: BaziResult;
  zodiac: ZodiacResult;
}

const EC: Record<string, string> = {
  '木': '#22c55e', '火': '#ef4444', '土': '#eab308', '金': '#f59e0b', '水': '#3b82f6',
};

const stemToElement = (s: string): string => {
  const m: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  return m[s] || '';
};

// ==================== Sub Components ====================

function PillarCard({ label, labelCn, pillar, isDayMaster }: {
  label: string; labelCn: string; pillar: BaziResult['year']; isDayMaster?: boolean;
}) {
  return (
    <div className={`relative rounded-xl p-3 md:p-4 text-center transition-all duration-300 hover:border-opacity-60 ${isDayMaster
      ? 'bg-gradient-to-b from-gold-500/10 to-transparent border border-gold-500/30 hover:shadow-[0_0_20px_rgba(200,169,110,0.1)]'
      : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
    }`}>
      {isDayMaster && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void text-[9px] px-3 py-0.5 rounded-full font-semibold tracking-[0.15em] uppercase" style={{ letterSpacing: '0.15em' }}>
          日主
        </div>
      )}

      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className="text-xs text-gold-500/70 chinese-char mb-3">{labelCn}</div>

      {/* Ten God */}
      <div className="text-[10px] text-gray-400 mb-2 h-4">
        {pillar.tenGodEn !== 'Day Master' ? (
          <span className="px-1.5 py-0.5 rounded bg-white/[0.05]">{pillar.tenGod}</span>
        ) : null}
      </div>

      {/* Stem */}
      <div className="mb-1">
        <span className="text-3xl md:text-4xl font-bold chinese-char leading-none" style={{ color: EC[pillar.stemElement] || '#c8a96e' }}>
          {pillar.stem}
        </span>
      </div>
      <div className="text-[10px] text-gray-500 mb-4">
        {pillar.stemElementEn} {pillar.stemPolarity === 'yang' ? '阳' : '阴'}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />

      {/* Branch */}
      <div className="mb-1">
        <span className="text-3xl md:text-4xl font-bold chinese-char leading-none" style={{ color: EC[pillar.branchElement] || '#c8a96e' }}>
          {pillar.branch}
        </span>
      </div>
      <div className="text-[10px] text-gray-500 mb-3">
        {pillar.branchElementEn} · {pillar.animalCn}{pillar.animal}
      </div>

      {/* Hidden Stems */}
      <div className="bg-void/50 rounded-lg p-2">
        <div className="text-[9px] text-gray-600 mb-1">藏干</div>
        <div className="flex justify-center gap-1.5">
          {pillar.hiddenStems.map((hs, i) => (
            <div key={i} className="text-center">
              <span className="text-sm chinese-char font-medium" style={{ color: EC[stemToElement(hs)] || '#999' }}>
                {hs}
              </span>
              {pillar.tenGodZhi[i] && (
                <div className="text-[8px] text-gray-600 mt-0.5">{pillar.tenGodZhi[i]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nayin */}
      <div className="mt-2 text-[9px] text-gray-600">
        <span className="chinese-char">{pillar.nayin}</span>
      </div>
    </div>
  );
}

function ElementBar({ element, elementEn, percentage, color, emoji }: {
  element: string; elementEn: string; percentage: number; color: string; emoji: string;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="text-base w-6">{emoji}</span>
      <span className="text-xs text-gray-400 w-12 md:w-14">{elementEn}</span>
      <div className="flex-1 bg-white/[0.03] rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full element-bar"
          style={{ backgroundColor: color, '--bar-width': `${percentage}%`, opacity: 0.85 } as React.CSSProperties}
        />
      </div>
      <span className="text-xs text-gray-500 w-9 text-right font-mono">{percentage}%</span>
    </div>
  );
}

function DaYunTimeline({ daYun, liuNian }: { daYun: DaYunPillar[]; liuNian: LiuNianInfo[] }) {
  const validDaYun = daYun.filter(d => d.ganZhi);
  if (validDaYun.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* 大运 */}
      <div>
        <h4 className="text-xs text-gray-500 mb-3">大運</h4>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {validDaYun.map((d, i) => (
            <div
              key={i}
              className={`flex-shrink-0 rounded-lg p-2 text-center min-w-[60px] transition-all ${
                d.isCurrent
                  ? 'bg-gold-500/15 border border-gold-500/40 ring-1 ring-gold-500/20'
                  : 'bg-white/[0.02] border border-white/[0.05]'
              }`}
            >
              <div className="flex justify-center gap-0.5 mb-1">
                <span className="text-sm chinese-char font-medium" style={{ color: EC[stemToElement(d.stem)] }}>
                  {d.stem}
                </span>
                <span className="text-sm chinese-char font-medium" style={{ color: EC[stemToElement(d.branch)] || '#999' }}>
                  {d.branch}
                </span>
              </div>
              <div className="text-[9px] text-gray-500">{d.startAge}-{d.endAge}</div>
              <div className="text-[9px] text-gray-600">{d.startYear}</div>
              {d.isCurrent && <div className="text-[8px] text-gold-500 mt-0.5 font-medium">當前</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 流年 */}
      {liuNian.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 mb-3">流年</h4>
          <div className="grid grid-cols-5 gap-1.5">
            {liuNian.map((ln) => (
              <div
                key={ln.year}
                className={`rounded-lg p-1.5 text-center transition-all ${
                  ln.isCurrent
                    ? 'bg-gold-500/15 border border-gold-500/40'
                    : 'bg-white/[0.02] border border-white/[0.05]'
                }`}
              >
                <div className="text-xs chinese-char font-medium text-gray-300">{ln.ganZhi}</div>
                <div className="text-[9px] text-gray-500">{ln.year}</div>
                {ln.isCurrent && <div className="text-[8px] text-gold-500 font-medium">今年</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BranchInteractions({ interactions }: { interactions: BaziResult['branchInteractions'] }) {
  if (interactions.length === 0) return null;

  const typeColors = {
    clash: 'text-red-400 bg-red-500/10 border-red-500/20',
    combination: 'text-green-400 bg-green-500/10 border-green-500/20',
    harm: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    punishment: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="space-y-2">
      {interactions.map((bi, i) => (
        <div key={i} className={`rounded-lg border p-3 ${typeColors[bi.type]}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium chinese-char">{bi.branches.join('')}{bi.typeCn}</span>
            <span className="text-[10px] opacity-60">{bi.pillars.join(' – ')}</span>
          </div>
          <p className="text-[11px] opacity-70 leading-relaxed">{bi.description}</p>
        </div>
      ))}
    </div>
  );
}

function ChartPatternCard({ pattern }: { pattern: ChartPattern }) {
  const qualityColors: Record<string, string> = {
    noble: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    wealth: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    authority: 'text-red-400 bg-red-500/10 border-red-500/20',
    intelligence: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    resource: 'text-green-400 bg-green-500/10 border-green-500/20',
    special: 'text-gold-500 bg-gold-500/10 border-gold-500/20',
  };
  return (
    <div className={`rounded-xl border p-4 ${qualityColors[pattern.quality] || qualityColors.special}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold chinese-char">{pattern.name}</span>
        <span className="text-xs opacity-70">{pattern.nameEn}</span>
      </div>
      <p className="text-[11px] opacity-80 leading-relaxed">{pattern.description}</p>
    </div>
  );
}

function ShenShaGrid({ stars }: { stars: ShenShaType[] }) {
  if (stars.length === 0) return null;
  const typeStyles = {
    auspicious: 'bg-green-500/10 border-green-500/20 text-green-400',
    inauspicious: 'bg-red-500/10 border-red-500/20 text-red-400',
    neutral: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {stars.map((s, i) => (
        <div key={i} className={`rounded-lg border p-3 ${typeStyles[s.type]}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium chinese-char">{s.name}</span>
            <span className="text-[10px] opacity-60">{s.nameEn}</span>
            {s.pillar && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] opacity-50">{s.pillar}</span>}
          </div>
          <p className="text-[10px] opacity-70 leading-relaxed line-clamp-2">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

function KongWangDisplay({ kongWang }: { kongWang: KongWang }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-500">空亡:</span>
      <div className="flex gap-1.5">
        {kongWang.branches.map((b) => (
          <span key={b} className="text-base chinese-char text-gray-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">{b}</span>
        ))}
      </div>
      {kongWang.affectedPillars.length > 0 && (
        <span className="text-[10px] text-amber-400/70">
          影響: {kongWang.affectedPillars.join(', ')}
        </span>
      )}
    </div>
  );
}

// ==================== Main Component ====================

export default function BaziChart({ bazi, zodiac }: BaziChartProps) {
  const strengthColor = { strong: 'text-green-400', weak: 'text-blue-400', balanced: 'text-gold-500' };
  const strengthLabel = { strong: '身旺 Strong', weak: '身弱 Weak', balanced: '中和 Balanced' };

  return (
    <div className="space-y-6 fade-in">
      {/* Accuracy Badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-0 px-3 py-2 rounded-lg bg-gold-500/[0.04] border border-gold-500/10">
        <svg className="w-4 h-4 text-gold-500/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span>精準計算</span>
        <span className="text-gold-500/30">&middot;</span>
        <span>天文曆算引擎</span>
        <span className="text-gold-500/30">&middot;</span>
        <span className="text-gold-500/70">可驗證方法論</span>
      </div>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-5 md:p-7 transition-all duration-300 hover:border-white/[0.12]">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-5 gap-3">
          <div className="flex items-start gap-4">
            <span className="chinese-char text-gradient-gold text-4xl md:text-5xl font-bold leading-none mt-0.5">{bazi.dayMaster.stem}</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">
                {bazi.dayMaster.elementEn} {bazi.dayMaster.polarity === 'yang' ? '陽' : '陰'} 日主
              </h2>
              <p className="text-sm text-gray-500">
                {zodiac.sunSign.symbol} {zodiac.sunSign.name} · {bazi.year.animalCn}{bazi.year.animal}年 · {bazi.birthInfo.lunarCn}
              </p>
            </div>
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/[0.05] ${strengthColor[bazi.dayMasterStrength]}`}>
            {strengthLabel[bazi.dayMasterStrength]}
          </div>
        </div>
        <div className="divider-gold mb-5" />
        <p className="text-sm text-gray-400 leading-relaxed">{bazi.dayMaster.description}</p>
      </div>

      {/* Four Pillars */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase" style={{ letterSpacing: '0.12em' }}>四柱八字</h3>
          <span className="text-sm text-gold-500/50 chinese-char">四柱八字</span>
        </div>
        <div className="pillars-grid grid grid-cols-4 gap-2 md:gap-3">
          <PillarCard label="年" labelCn="年柱" pillar={bazi.year} />
          <PillarCard label="月" labelCn="月柱" pillar={bazi.month} />
          <PillarCard label="日" labelCn="日柱" pillar={bazi.day} isDayMaster />
          <PillarCard label="時" labelCn="时柱" pillar={bazi.hour} />
        </div>
      </div>

      {/* Five Elements */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">五行</h3>
          <span className="text-sm text-gold-500/50 chinese-char">五行</span>
        </div>
        <div className="space-y-2.5 mb-5">
          {bazi.fiveElements.map((e) => (
            <ElementBar key={e.element} element={e.element} elementEn={e.elementEn} percentage={e.percentage} color={e.color} emoji={e.emoji} />
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-sm text-gray-400 mb-3">{bazi.strengthAnalysis}</p>
          <div className="flex flex-wrap gap-2">
            {bazi.favorableElements.map((e) => (
              <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                喜 {e}
              </span>
            ))}
            {bazi.unfavorableElements.map((e) => (
              <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                忌 {e}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Interactions */}
      {bazi.branchInteractions.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">地支關係</h3>
            <span className="text-sm text-gold-500/50 chinese-char">地支关系</span>
          </div>
          <BranchInteractions interactions={bazi.branchInteractions} />
        </div>
      )}

      {/* Chart Pattern + ShenSha */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">格局</h3>
          <span className="text-sm text-gold-500/50 chinese-char">格局</span>
        </div>
        <ChartPatternCard pattern={bazi.chartPattern} />
      </div>

      {/* Special Stars */}
      {bazi.shenSha.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">神煞</h3>
              <span className="text-sm text-gold-500/50 chinese-char">神煞</span>
            </div>
            <KongWangDisplay kongWang={bazi.kongWang} />
          </div>
          <ShenShaGrid stars={bazi.shenSha} />
        </div>
      )}

      {/* DaYun + LiuNian */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">大運流年</h3>
          <span className="text-sm text-gold-500/50 chinese-char">大运流年</span>
        </div>
        <DaYunTimeline daYun={bazi.daYun} liuNian={bazi.liuNian} />
      </div>

      {/* Western Astrology */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">西洋占星</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{zodiac.sunSign.symbol}</span>
              <div>
                <span className="text-gold-500 font-semibold">太陽 {zodiac.sunSign.name}</span>
                <span className="text-[10px] text-gray-500 block">{zodiac.sunSign.element} · {zodiac.sunSign.modality} · {zodiac.sunSign.rulingPlanet}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">{zodiac.sunSign.description}</p>
            <div className="flex flex-wrap gap-1">
              {zodiac.sunSign.traits.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-gray-400">{t}</span>
              ))}
            </div>
          </div>
          {zodiac.moonSign && (
            <div className="rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{zodiac.moonSign.symbol}</span>
                <div>
                  <span className="text-indigo-400 font-semibold">月亮 {zodiac.moonSign.name}</span>
                  <span className="text-[10px] text-gray-500 block">{zodiac.moonSign.element} · approx.</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{zodiac.moonSign.description}</p>
              <div className="flex flex-wrap gap-1">
                {zodiac.moonSign.traits.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-gray-400">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
