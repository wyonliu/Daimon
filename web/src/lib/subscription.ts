// Client-side subscription management (MVP — localStorage-based)

export interface UserPlan {
  plan: 'free' | 'pro' | 'master';
  freeReadingsUsed: number;
  maxFreeReadings: number;
  expiresAt?: string; // ISO date
  sessionId?: string;
  dayKey?: string; // "YYYY-MM-DD" for daily reset tracking
}

const STORAGE_KEY = 'daimon_user_plan';
const MAX_FREE_READINGS_PER_DAY = 2;

function getCurrentDayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDefaultPlan(): UserPlan {
  return {
    plan: 'free',
    freeReadingsUsed: 0,
    maxFreeReadings: MAX_FREE_READINGS_PER_DAY,
    dayKey: getCurrentDayKey(),
  };
}

export function getUserPlan(): UserPlan {
  if (typeof window === 'undefined') return getDefaultPlan();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPlan();

    const parsed: UserPlan = JSON.parse(stored);

    // Daily reset for free users (also handles legacy monthly keys)
    const currentDay = getCurrentDayKey();
    const needsReset = parsed.plan === 'free' && (
      parsed.dayKey !== currentDay ||
      // Migrate from old monthly format (e.g. "2026-04" → "2026-04-03")
      (parsed.dayKey && parsed.dayKey.length <= 7)
    );
    if (needsReset) {
      parsed.freeReadingsUsed = 0;
      parsed.dayKey = currentDay;
      parsed.maxFreeReadings = MAX_FREE_READINGS_PER_DAY;
      setUserPlan(parsed);
    }

    // Check if pro/master subscription expired
    if (parsed.plan !== 'free' && parsed.expiresAt) {
      if (new Date(parsed.expiresAt) < new Date()) {
        const reset = getDefaultPlan();
        setUserPlan(reset);
        return reset;
      }
    }

    // Ensure maxFreeReadings is set
    if (!parsed.maxFreeReadings) {
      parsed.maxFreeReadings = MAX_FREE_READINGS_PER_DAY;
    }

    return parsed;
  } catch {
    return getDefaultPlan();
  }
}

export function setUserPlan(plan: UserPlan): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Storage full or unavailable
  }
}

export function canUseReading(): boolean {
  const plan = getUserPlan();
  if (plan.plan === 'pro' || plan.plan === 'master') return true;
  return plan.freeReadingsUsed < plan.maxFreeReadings;
}

export function useReading(): void {
  const plan = getUserPlan();
  if (plan.plan === 'pro' || plan.plan === 'master') return;
  plan.freeReadingsUsed += 1;
  plan.dayKey = getCurrentDayKey();
  setUserPlan(plan);
}

export function isPro(): boolean {
  const plan = getUserPlan();
  return plan.plan === 'pro' || plan.plan === 'master';
}

export function activatePro(sessionId: string, planType: 'pro' | 'master' = 'pro', durationDays?: number): void {
  // Default: pro = 30 days, master = 90 days
  const days = durationDays ?? (planType === 'master' ? 90 : 30);
  const plan: UserPlan = {
    plan: planType,
    freeReadingsUsed: 0,
    maxFreeReadings: MAX_FREE_READINGS_PER_DAY,
    sessionId,
    dayKey: getCurrentDayKey(),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  };
  setUserPlan(plan);
}

export function grantSingleReading(): void {
  const plan = getUserPlan();
  // Add 1 extra reading to the user's allowance
  plan.maxFreeReadings += 1;
  setUserPlan(plan);
}

export function getReadingsRemaining(): number {
  const plan = getUserPlan();
  if (plan.plan === 'pro' || plan.plan === 'master') return Infinity;
  return Math.max(0, plan.maxFreeReadings - plan.freeReadingsUsed);
}
