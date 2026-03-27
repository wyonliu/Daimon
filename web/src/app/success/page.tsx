'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { activatePro, grantSingleReading } from '@/lib/subscription';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'pro';

  useEffect(() => {
    if (sessionId) {
      if (plan === 'single') {
        grantSingleReading();
      } else {
        activatePro(sessionId, plan as 'pro' | 'master');
      }
    }
  }, [sessionId, plan]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const isSingle = plan === 'single';

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md fade-in">
        {/* Success icon */}
        <div className="mb-6 slide-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-gold">
            <span className="text-4xl chinese-char text-gold-500">
              {isSingle ? '\u547D' : '\u9053'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gold-500 text-glow-gold mb-3 slide-up slide-up-delay-1">
          {isSingle ? '解讀已解鎖！' : '歡迎加入 Daimon Pro'}
        </h1>

        <p className="text-gray-400 mb-2 slide-up slide-up-delay-2">
          {isSingle
            ? '您的深度解讀已就緒。'
            : '更深層的智慧之旅從此開始。'}
        </p>
        <p className="text-sm text-gray-500 mb-8 slide-up slide-up-delay-2">
          {isSingle
            ? '已為您解鎖一次完整的命盤深度分析。'
            : '無限次數的命盤解讀、完整分析、深度命理綜合已全部開通。'}
        </p>

        <div className="space-y-3 slide-up slide-up-delay-3">
          <button
            onClick={() => router.push('/')}
            className="w-full max-w-xs mx-auto block py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect"
          >
            {isSingle ? '查看解讀' : '開始解讀'}
          </button>

          <p className="text-xs text-gray-600">
            {countdown}秒後自動返回⋯⋯
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center glow-pulse">
            <span className="text-xl chinese-char text-gold-500">{'\u9053'}</span>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
