/**
 * User profile persistence — localStorage-based
 * Saves birth data so the Daily Destiny feature can work without re-entering info
 */

export interface UserProfile {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  gender: 'male' | 'female';
  savedAt: string; // ISO date
}

const PROFILE_KEY = 'daimon_user_profile';

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or unavailable
  }
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}
