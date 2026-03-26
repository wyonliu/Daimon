'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, clearProfile, UserProfile } from '@/lib/user-profile';
import { getUserPlan, isPro, getReadingsRemaining } from '@/lib/subscription';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userIsPro, setUserIsPro] = useState(false);
  const [readingsLeft, setReadingsLeft] = useState(0);
  const [maxReadings, setMaxReadings] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setUserIsPro(isPro());
    setReadingsLeft(getReadingsRemaining());
    const plan = getUserPlan();
    setMaxReadings(plan.maxFreeReadings);
    setMounted(true);
  }, []);

  const handleClearProfile = () => {
    if (confirm('Clear your saved birth data? You will need to re-enter it for future readings.')) {
      clearProfile();
      setProfile(null);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center glow-pulse">
          <span className="text-lg chinese-char text-gold-500">設</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-400 hover:text-gold-500 transition-colors press-effect"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display text-2xl font-bold text-gradient-gold">Settings</h1>
        </div>

        {/* Profile Section */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-gray-200 mb-4">Profile</h2>
          {profile ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm text-gray-200">{profile.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Birth Date</span>
                <span className="text-sm text-gray-200">
                  {profile.year}/{profile.month}/{profile.day}
                  {profile.hour !== null ? ` at ${profile.hour}:00` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Gender</span>
                <span className="text-sm text-gray-200 capitalize">{profile.gender}</span>
              </div>
              <div className="divider-gold my-4" />
              <button
                onClick={handleClearProfile}
                className="w-full py-2.5 rounded-lg border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5 transition-colors press-effect"
              >
                Clear Saved Profile
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No profile saved yet.</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg border border-gold-500/20 text-gold-500 text-sm hover:bg-gold-500/5 transition-colors press-effect"
              >
                Get Your First Reading
              </button>
            </div>
          )}
        </section>

        {/* Subscription Section */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-gray-200 mb-4">Subscription</h2>
          {userIsPro ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium text-gold-500">Pro</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Readings</span>
                <span className="text-sm text-gray-200">Unlimited</span>
              </div>
              <div className="divider-gold my-4" />
              <p className="text-xs text-gray-600 text-center">
                Manage your subscription through your payment provider.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm text-gray-200">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Readings Left</span>
                <span className="text-sm text-gray-200">{readingsLeft} / {maxReadings} this month</span>
              </div>
              <div className="divider-gold my-4" />
              <button
                onClick={() => router.push('/pricing')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold hover:from-gold-600 hover:via-gold-400 hover:to-gold-600 transition-all press-effect btn-shimmer glow-gold-soft"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-gray-200 mb-4">About Daimon</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Version</span>
              <span className="text-sm text-gray-200">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Engine</span>
              <span className="text-sm text-gray-200">BaZi + Western Astrology</span>
            </div>
            <div className="divider-gold my-4" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Daimon is the world&apos;s first AI that reads both BaZi and Western Astrology,
              delivering professional-grade destiny analysis powered by ancient wisdom and modern intelligence.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
