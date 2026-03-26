'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { grantSingleReading, activatePro } from '@/lib/subscription';
import Image from 'next/image';

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const [unlocking, setUnlocking] = useState(false);

  const plan = (searchParams.get('plan') as 'single' | 'pro') || 'single';
  const returnUrl = searchParams.get('returnUrl') || '/';

  const isSingle = plan === 'single';
  const price = isSingle ? '35' : '70';
  const planLabel = isSingle ? t('pay.plan.single') : t('pay.plan.pro');

  const handleUnlock = () => {
    setUnlocking(true);
    if (isSingle) {
      grantSingleReading();
    } else {
      activatePro(`alipay_${Date.now()}`, 'pro');
    }
    // Redirect to success page
    router.push(`/success?session_id=alipay_${Date.now()}&plan=${plan}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-500 transition-colors press-effect mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('pay.back')}
        </button>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-gold-500/20 bg-gradient-to-b from-void-lighter/95 to-void p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/30 flex items-center justify-center mb-4 glow-gold-soft">
              <span className="text-2xl chinese-char text-gold-500">{isSingle ? '\u547D' : '\u9053'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gold-500 text-glow-gold mb-1">
              {planLabel}
            </h1>
            <p className="text-3xl font-bold text-gray-100 font-display">
              <span className="text-gold-500">&yen;{price}</span>
            </p>
          </div>

          <div className="divider-gold mb-6" />

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <p className="text-sm text-gray-400 mb-4 text-center">
              {t('pay.scanQr')}
            </p>
            <div className="w-56 h-56 rounded-xl border-2 border-gold-500/30 bg-white p-2 flex items-center justify-center overflow-hidden">
              <Image
                src="/alipay-qr.jpg"
                alt="Alipay QR Code"
                width={208}
                height={208}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <svg className="w-4 h-4 text-[#1677FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.422 15.358c-.683-.347-1.143-.578-1.532-.82a24.074 24.074 0 01-2.347-1.483c.345-.75.635-1.54.865-2.364h-3.26V9.396h4.073V8.68h-4.073V6.804h-1.785s.013-.315 0-.417c-.013-.102-.143-.404-.143-.404H9.93v2.698H6.074v.716H9.93v1.295H6.912v.716h6.728a14.094 14.094 0 01-.485 1.283c-1.462-.708-3.134-1.223-4.675-.88-2.218.494-3.476 2.16-3.163 4.067.313 1.906 2.242 3.146 4.4 2.792 1.59-.26 2.874-1.198 3.859-2.545.002-.003.003-.005.005-.008 1.364.82 3.078 1.605 3.078 1.605l3.764 1.738z M9.52 18.062c-1.79.38-3.313-.47-3.477-1.95-.163-1.48 1.116-3.023 2.907-3.404.44-.094.867-.114 1.276-.073a8.877 8.877 0 012.647 1.014c-.867 1.634-1.913 3.137-3.354 4.413z"/>
              </svg>
              <span className="text-xs text-gray-500">{t('pay.alipay')}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-gold-500/5 border border-gold-500/15 p-4 mb-6">
            <h3 className="text-sm font-medium text-gold-500 mb-2">{t('pay.instructions.title')}</h3>
            <ol className="space-y-1.5 text-xs text-gray-400 list-decimal list-inside">
              <li>{t('pay.instructions.step1')}</li>
              <li>{t('pay.instructions.step2')}</li>
              <li>{t('pay.instructions.step3')}</li>
            </ol>
          </div>

          {/* Notice */}
          <p className="text-xs text-center text-gold-500/80 mb-5">
            {t('pay.notice')}
          </p>

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-bold text-base hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer"
          >
            {unlocking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('pay.unlocking')}
              </span>
            ) : (
              t('pay.unlockBtn')
            )}
          </button>

          {/* Subtext */}
          <p className="text-xs text-gray-600 text-center mt-3">
            {t('pay.honor')}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
        </main>
      }
    >
      <PayContent />
    </Suspense>
  );
}
