/**
 * PWA Push Notification helpers
 * Zero-cost client-side push notification registration
 */

const SW_PATH = '/sw.js';
const PUSH_ENABLED_KEY = 'daimon_push_enabled';
const PUSH_DISMISSED_KEY = 'daimon_push_dismissed';

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

export function isPushEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PUSH_ENABLED_KEY) === 'true';
}

export function wasPushDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
  if (!dismissed) return false;
  // Allow re-prompt after 7 days
  const dismissedDate = new Date(dismissed);
  const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < 7;
}

export function dismissPushPrompt(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUSH_DISMISSED_KEY, new Date().toISOString());
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH);
    return registration;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await registerServiceWorker();
    if (!registration) return false;

    // For MVP without a push server, we use local scheduled notifications
    // When a push server is added, subscribe here with VAPID key:
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    // });
    // await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });

    localStorage.setItem(PUSH_ENABLED_KEY, 'true');
    return true;
  } catch (err) {
    console.error('Push permission failed:', err);
    return false;
  }
}

/**
 * Schedule a local notification (fallback when no push server)
 * Uses the Service Worker to show a notification
 */
export async function showLocalNotification(title: string, body: string, url?: string): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: url || '/daily' },
      tag: 'daimon-daily',
    } as NotificationOptions);
  } catch (err) {
    console.error('Local notification failed:', err);
  }
}

/**
 * Check if we should show the push prompt
 * Show after user has used the app at least once and hasn't dismissed recently
 */
export function shouldShowPushPrompt(): boolean {
  if (!isPushSupported()) return false;
  if (isPushEnabled()) return false;
  if (wasPushDismissed()) return false;
  if (Notification.permission === 'denied') return false;
  return true;
}
