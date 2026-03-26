// Client-side subscription management (MVP — localStorage-based)

export interface UserPlan {
  plan: 'free' | 'pro' | 'master';
  freeReadingsUsed: number;
  maxFreeReadings: number;
  expiresAt?: string; // ISO date
  sessionId?: string;
  monthKey?: string; // "YYYY-MM" for monthly reset tracking
}

const STORAGE_KEY = 'daimon_user_plan';
const MAX_FREE_READINGS = 3;

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getDefaultPlan(): UserPlan {
  return {
    plan: 'free',
    freeReadingsUsed: 0,
    maxFreeReadings: MAX_FREE_READINGS,
    monthKey: getCurrentMonthKey(),
  };
}

export function getUserPlan(): UserPlan {
  if (typeof window === 'undefined') return getDefaultPlan();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPlan();

    const parsed: UserPlan = JSON.parse(stored);

    // Monthly reset for free users
    const currentMonth = getCurrentMonthKey();
    if (parsed.plan === 'free' && parsed.monthKey !== currentMonth) {
      parsed.freeReadingsUsed = 0;
      parsed.monthKey = currentMonth;
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
    parsed.maxFreeReadings = MAX_FREE_READINGS;

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
  plan.monthKey = getCurrentMonthKey();
  setUserPlan(plan);
}

export function isPro(): boolean {
  const plan = getUserPlan();
  return plan.plan === 'pro' || plan.plan === 'master';
}

export function activatePro(sessionId: string, planType: 'pro' | 'master' = 'pro'): void {
  const plan: UserPlan = {
    plan: planType,
    freeReadingsUsed: 0,
    maxFreeReadings: MAX_FREE_READINGS,
    sessionId,
    monthKey: getCurrentMonthKey(),
    // Set expiry to ~30 days from now for MVP
    // In production, this would be managed by LemonSqueezy webhooks
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
