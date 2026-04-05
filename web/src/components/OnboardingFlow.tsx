'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingFlowProps {
  onComplete: (data: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    name: string;
    gender: 'male' | 'female';
    interests: string[];
  }) => void;
}

const INTERESTS = [
  { id: 'career', label: '事業財運', icon: '💼' },
  { id: 'love', label: '感情姻緣', icon: '❤️' },
  { id: 'health', label: '健康養生', icon: '🌿' },
  { id: 'wealth', label: '財富投資', icon: '💰' },
  { id: 'family', label: '家庭關係', icon: '👨‍👩‍👧' },
  { id: 'growth', label: '個人成長', icon: '🌟' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const label = `${String(i).padStart(2, '0')}:00`;
  const shichen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
  return { value: i, label: `${label} (${shichen[i]}時)` };
});

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Data
  const [interests, setInterests] = useState<string[]>([]);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const currentYear = new Date().getFullYear();

  const getDaysInMonth = () => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  // Transition helper
  const goTo = useCallback((nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setFadeIn(true);
    }, 200);
  }, []);

  // Loading animation for step 5
  useEffect(() => {
    if (step !== 5) return;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => goTo(6), 400);
          return 100;
        }
        // Non-linear progress — fast start, slow middle, fast end
        const increment = prev < 30 ? 4 : prev < 70 ? 1.5 : 3;
        return Math.min(100, prev + increment);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [step, goTo]);

  const totalSteps = 7;
  const progressPercent = Math.min(100, ((step) / totalSteps) * 100);

  // Step 0: Animated intro
  const renderIntro = () => (
    <div className="text-center max-w-md mx-auto">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-gold-soft animate-float">
          <span className="text-5xl chinese-char text-gold-500">{'\u547d'}</span>
        </div>
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient-gold mb-4">
        命運揭示之旅
      </h1>
      <p className="text-gray-400 leading-relaxed mb-2">
        千年八字智慧，結合現代AI深度解讀
      </p>
      <p className="text-sm text-gray-500 mb-10">
        僅需 60 秒，揭開屬於你的命運密碼
      </p>
      <button
        onClick={() => goTo(1)}
        className="px-10 py-4 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold text-lg glow-gold-soft hover:glow-gold press-effect btn-shimmer transition-all duration-300"
      >
        開始探索
      </button>
      <p className="text-xs text-gray-600 mt-4">已有 10,000+ 人完成命運解讀</p>
    </div>
  );

  // Step 1: Interest selection (sunk cost — choosing makes you invested)
  const renderInterests = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">你最想了解什麼？</h2>
        <p className="text-sm text-gray-500">選擇你關心的方向，AI 將為你量身解讀</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {INTERESTS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setInterests(prev =>
                prev.includes(item.id)
                  ? prev.filter(i => i !== item.id)
                  : [...prev, item.id]
              );
            }}
            className={`py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border press-effect flex items-center gap-2.5 ${
              interests.includes(item.id)
                ? 'bg-gold-500/10 border-gold-500/40 text-gold-500 shadow-[0_0_10px_rgba(200,169,110,0.1)]'
                : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => goTo(2)}
        disabled={interests.length === 0}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        繼續
      </button>
    </div>
  );

  // Step 2: Gender
  const renderGender = () => (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">你的性別</h2>
        <p className="text-sm text-gray-500">影響大運順逆排列</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => { setGender('male'); setTimeout(() => goTo(3), 300); }}
          className={`py-8 rounded-2xl text-center transition-all duration-200 border press-effect ${
            gender === 'male'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          <span className="text-4xl block mb-2">{'\u4e7e'}</span>
          <span className="text-sm font-medium">男</span>
        </button>
        <button
          type="button"
          onClick={() => { setGender('female'); setTimeout(() => goTo(3), 300); }}
          className={`py-8 rounded-2xl text-center transition-all duration-200 border press-effect ${
            gender === 'female'
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-500'
              : 'bg-void-lighter border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          <span className="text-4xl block mb-2">{'\u5764'}</span>
          <span className="text-sm font-medium">女</span>
        </button>
      </div>
    </div>
  );

  // Step 3: Name + Birth date
  const renderBirthInfo = () => (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">出生資料</h2>
        <p className="text-sm text-gray-500">用於排列八字四柱</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm text-gold-500 mb-1.5 font-medium">
            稱呼 <span className="text-gray-500 text-xs">（選填）</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字或暱稱"
            className="w-full bg-void-lighter border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-gold-500 mb-1.5 font-medium">
            出生日期 <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="select-premium">
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); if (day && e.target.value && month && parseInt(day) > new Date(parseInt(e.target.value), parseInt(month), 0).getDate()) setDay(''); }}
                required
                className="w-full bg-void-lighter border border-gray-700 rounded-xl px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">年</option>
                {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="select-premium">
              <select
                value={month}
                onChange={(e) => { setMonth(e.target.value); if (day && year && e.target.value && parseInt(day) > new Date(parseInt(year), parseInt(e.target.value), 0).getDate()) setDay(''); }}
                required
                className="w-full bg-void-lighter border border-gray-700 rounded-xl px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div className="select-premium">
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
                className="w-full bg-void-lighter border border-gray-700 rounded-xl px-3 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">日</option>
                {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => goTo(4)}
        disabled={!year || !month || !day}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        繼續
      </button>
    </div>
  );

  // Step 4: Birth hour (optional, with encouragement)
  const renderBirthHour = () => (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">出生時辰</h2>
        <p className="text-sm text-gray-500">知道時辰可提升解讀精確度 40%</p>
      </div>

      <div className="mb-6">
        <div className="select-premium">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full bg-void-lighter border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="">不確定/不記得</option>
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          可詢問父母或查看出生證明
        </p>
      </div>

      <button
        onClick={() => { setLoadingProgress(0); goTo(5); }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base press-effect btn-shimmer transition-all"
      >
        {hour ? '開始推演命盤' : '跳過，開始推演'}
      </button>
    </div>
  );

  // Step 5: Loading animation (dramatic pause — builds anticipation)
  const renderLoading = () => {
    const stages = [
      { threshold: 15, text: '排列八字四柱…' },
      { threshold: 35, text: '推算五行強弱…' },
      { threshold: 55, text: '解析十神格局…' },
      { threshold: 75, text: '匹配神煞星曜…' },
      { threshold: 90, text: '生成命運報告…' },
      { threshold: 101, text: '命盤推演完成' },
    ];
    const currentStage = stages.find(s => loadingProgress < s.threshold) || stages[stages.length - 1];

    return (
      <div className="text-center max-w-sm mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse">
            <span className="text-3xl chinese-char text-gold-500 animate-pulse-slow">{'\u547d'}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-100 mb-2">
          正在推演你的命盤
        </h2>
        <p className="text-sm text-gold-500/70 mb-8 transition-opacity duration-300">
          {currentStage.text}
        </p>

        {/* Progress bar */}
        <div className="w-64 mx-auto h-1.5 rounded-full overflow-hidden bg-white/[0.03] mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-500 transition-all duration-200"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{Math.round(loadingProgress)}%</p>
      </div>
    );
  };

  // Step 6: Result preview / teaser (sunk cost + information gap peak)
  const renderPreview = () => {
    const interestLabels = interests.map(id => INTERESTS.find(i => i.id === id)?.label).filter(Boolean);

    return (
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center mb-4">
            <span className="text-3xl chinese-char text-gold-500">{'\u7B54'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient-gold mb-2">你的命盤已就緒</h2>
          <p className="text-sm text-gray-500">{name || '求問者'}，以下內容已為你推演完成</p>
        </div>

        {/* Teaser list — shows what's waiting behind the paywall */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-void-lighter border border-gray-800">
            <span className="text-gold-500/50 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-300">八字四柱命盤排列</p>
              <p className="text-xs text-gray-600">年柱 · 月柱 · 日柱 · 時柱</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-void-lighter border border-gray-800">
            <span className="text-gold-500/50 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-300">五行強弱 + 十神格局分析</p>
              <p className="text-xs text-gray-600">揭示你的先天優勢與潛在挑戰</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-void-lighter border border-gray-800">
            <span className="text-gold-500/50 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-300">AI 深度命運解讀</p>
              <p className="text-xs text-gray-600">
                {interestLabels.length > 0 ? `重點: ${interestLabels.join('、')}` : '性格、事業、感情全方位解讀'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gold-500/5 border border-gold-500/15">
            <span className="text-gold-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gold-500 font-medium">命運報告已生成</p>
              <p className="text-xs text-gray-500">點擊查看完整解讀</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onComplete({
              year: parseInt(year),
              month: parseInt(month),
              day: parseInt(day),
              hour: hour ? parseInt(hour) : null,
              name: name || '求問者',
              gender: gender || 'male',
              interests,
            });
          }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-lg press-effect btn-shimmer glow-gold-soft transition-all"
        >
          查看我的命運
        </button>

        <p className="text-center text-xs text-gray-600 mt-3">
          免費查看基礎命盤 · 每日 2 次解讀機會
        </p>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0: return renderIntro();
      case 1: return renderInterests();
      case 2: return renderGender();
      case 3: return renderBirthInfo();
      case 4: return renderBirthHour();
      case 5: return renderLoading();
      case 6: return renderPreview();
      default: return renderIntro();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar — hidden on intro and loading */}
      {step > 0 && step !== 5 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-0.5 bg-white/[0.03]">
            <div
              className="h-full bg-gradient-to-r from-gold-700 to-gold-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && step !== 5 && (
        <div className="pt-4 px-4">
          <button
            onClick={() => goTo(step - 1)}
            className="text-gray-500 hover:text-gray-300 transition-colors press-effect flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex items-center justify-center px-4 py-8 transition-opacity duration-200 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {renderStep()}
      </div>

      {/* Brand footer — only on intro */}
      {step === 0 && (
        <div className="pb-6 text-center">
          <p className="text-xs text-gray-700">Daimon · 精準命理引擎</p>
        </div>
      )}
    </div>
  );
}
