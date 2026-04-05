// Invite system for viral compatibility loop
// Encodes invite data directly in the URL — no server/localStorage needed for cross-device

export interface InviteData {
  // Person A's data (the inviter)
  n: string;  // nameA
  y: number;  // yearA
  m: number;  // monthA
  d: number;  // dayA
  h: number | null;  // hourA
  g: 'M' | 'F';  // genderA
}

// Encode invite data into a URL-safe base64 string
export function encodeInvite(data: {
  nameA: string;
  yearA: number;
  monthA: number;
  dayA: number;
  hourA: number | null;
  genderA: 'male' | 'female';
}): string {
  const compact: InviteData = {
    n: data.nameA,
    y: data.yearA,
    m: data.monthA,
    d: data.dayA,
    h: data.hourA,
    g: data.genderA === 'male' ? 'M' : 'F',
  };
  const json = JSON.stringify(compact);
  // Base64 encode, then make URL-safe
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decode invite data from URL-safe base64 string
export function decodeInvite(encoded: string): {
  nameA: string;
  yearA: number;
  monthA: number;
  dayA: number;
  hourA: number | null;
  genderA: 'male' | 'female';
} | null {
  try {
    // Restore standard base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding
    while (b64.length % 4) b64 += '=';
    const json = decodeURIComponent(escape(atob(b64)));
    const data: InviteData = JSON.parse(json);
    return {
      nameA: data.n || '某人',
      yearA: data.y,
      monthA: data.m,
      dayA: data.d,
      hourA: data.h,
      genderA: data.g === 'M' ? 'male' : 'female',
    };
  } catch {
    return null;
  }
}

export function getInviteUrl(data: {
  nameA: string;
  yearA: number;
  monthA: number;
  dayA: number;
  hourA: number | null;
  genderA: 'male' | 'female';
}): string {
  const encoded = encodeInvite(data);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daimon-app.vercel.app';
  return `${origin}/match/invite/${encoded}`;
}
