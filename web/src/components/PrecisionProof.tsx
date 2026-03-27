'use client';

import { useState } from 'react';
import { BaziResult } from '@/lib/bazi/calculator';
import { generateVerification, VerificationData } from '@/lib/bazi/verification';

interface PrecisionProofProps {
  bazi: BaziResult;
  year: number;
  month: number;
  day: number;
  hour: number | null;
}

// ==================== Sub Components ====================

function AccuracyShield({ engineInfo }: { engineInfo: VerificationData['engineInfo'] }) {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 text-center glow-gold-soft slide-up">
      {/* Shield Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border-2 border-gold-500/40 mb-5">
        <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>

      <h2 className="font-display text-2xl font-bold text-gradient-gold mb-2">
        精準驗證
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        您的命盤由天文曆算引擎以數學精度計算
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="text-xs px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-500/80 border border-gold-500/20">
          {engineInfo.engine} v{engineInfo.version}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-500/80 border border-gold-500/20">
          {engineInfo.method}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {engineInfo.features.map((f, i) => (
          <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/[0.03] text-gray-500 border border-white/[0.06]">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function LLMComparisonCard({ point, index }: { point: VerificationData['llmFailPoints'][0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all duration-300 slide-up hover:border-white/[0.12]`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 press-effect"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">{point.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-200 mb-1">{point.category}</h4>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-red-400/80">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                常見錯誤
              </span>
              <span className="text-gray-600">vs</span>
              <span className="flex items-center gap-1 text-gold-500/80">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Daimon
              </span>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 fade-in">
          <div className="h-px bg-white/[0.06]" />

          {/* What LLMs get wrong */}
          <div className="rounded-lg bg-red-500/[0.06] border border-red-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-red-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-[10px] font-semibold text-red-400/70 uppercase tracking-wider">常見計算錯誤</span>
            </div>
            <p className="text-xs text-red-300/60 leading-relaxed">{point.whatLLMsGetWrong}</p>
          </div>

          {/* Our method */}
          <div className="rounded-lg bg-gold-500/[0.06] border border-gold-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-gold-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[10px] font-semibold text-gold-500/70 uppercase tracking-wider">正確方法</span>
            </div>
            <p className="text-xs text-gold-500/60 leading-relaxed">{point.correctMethod}</p>
          </div>

          {/* Your result */}
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">您的命盤結果</span>
            </div>
            <p className="text-xs text-gray-400/80 leading-relaxed">{point.ourResult}</p>
          </div>

          {/* Typical error */}
          <p className="text-[10px] text-gray-600 italic leading-relaxed pl-1">
            常見錯誤輸出: {point.typicalLLMError}
          </p>
        </div>
      )}
    </div>
  );
}

function CalculationStepAccordion({ steps }: { steps: VerificationData['calculationSteps'] }) {
  const [openStep, setOpenStep] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.step}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-200"
        >
          <button
            onClick={() => setOpenStep(openStep === step.step ? null : step.step)}
            className="w-full text-left p-3 flex items-center gap-3 press-effect"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-500">
              {step.step}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-300 font-medium">{step.label}</span>
            </div>
            <span className="text-xs text-gray-500 font-mono truncate max-w-[120px] hidden sm:inline">
              {step.output.length > 20 ? step.output.substring(0, 20) + '...' : step.output}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${openStep === step.step ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openStep === step.step && (
            <div className="px-3 pb-3 fade-in">
              <div className="h-px bg-white/[0.06] mb-3" />
              <div className="space-y-2 pl-10">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider w-12 flex-shrink-0 pt-0.5">Input</span>
                  <span className="text-xs text-gray-400 font-mono">{step.input}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider w-12 flex-shrink-0 pt-0.5">Output</span>
                  <span className="text-xs text-gold-500/80 font-mono chinese-char">{step.output}</span>
                </div>
                <div className="mt-2 rounded-lg bg-white/[0.02] p-2.5">
                  <p className="text-[11px] text-gray-500 leading-relaxed">{step.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VerifyYourself() {
  const links = [
    { name: 'SiZhu (四柱) Calculator', url: 'https://www.sizhu.com', note: 'Professional BaZi reference' },
    { name: 'Lunar Calendar (寿星万年历)', url: 'https://www.nongli.com', note: 'Solar term verification' },
    { name: 'Hong Kong Observatory', url: 'https://www.hko.gov.hk', note: 'Astronomical data source' },
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">自行驗證</h4>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        不必只聽我們說。與以下權威來源交叉驗證，確認每項計算的精度。
      </p>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-gold-500/20 hover:bg-gold-500/[0.03] transition-all duration-200 press-effect group"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-gold-500/70 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-300 font-medium">{link.name}</span>
              <span className="text-[10px] text-gray-600 block">{link.note}</span>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

// ==================== Main Component ====================

export default function PrecisionProof({ bazi, year, month, day, hour }: PrecisionProofProps) {
  const verification = generateVerification(bazi, year, month, day, hour);

  return (
    <div className="space-y-8 fade-in pb-8">
      {/* Accuracy Shield */}
      <AccuracyShield engineInfo={verification.engineInfo} />

      {/* LLM Comparison Section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-300 uppercase" style={{ letterSpacing: '0.12em' }}>
            為什麼精準很重要
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          傳統八字計算需要天文級精度。月份邊界遵循節氣而非日曆日期。以下是常見人工或自動計算錯誤導致命盤結果偏差的 6 個領域。
        </p>

        <div className="space-y-2">
          {verification.llmFailPoints.map((point, i) => (
            <LLMComparisonCard key={point.category} point={point} index={i} />
          ))}
        </div>
      </div>

      {/* Calculation Steps */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-300 uppercase" style={{ letterSpacing: '0.12em' }}>
            計算審計軌跡
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          從您的出生日期到最終命盤的每一步，透明且可驗證。
        </p>

        <CalculationStepAccordion steps={verification.calculationSteps} />
      </div>

      {/* Verify Yourself */}
      <VerifyYourself />
    </div>
  );
}
