// Canvas-based share image generator
// Generates beautiful dark+gold fortune cards for WeChat/小红书/朋友圈

const GOLD = '#c8a96e';
const GOLD_BRIGHT = '#e8d5a3';
const GOLD_DIM = '#8a7448';
const VOID = '#0a0a16';
const VOID_LIGHT = '#12121f';
const VOID_LIGHTER = '#1a1a2e';
const GRAY_400 = '#9ca3af';
const GRAY_500 = '#6b7280';
const GRAY_600 = '#4b5563';

// ==================== Helpers ====================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGoldDivider(ctx: CanvasRenderingContext2D, y: number, w: number, pad: number) {
  const grad = ctx.createLinearGradient(pad, y, w - pad, y);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.3, `${GOLD}44`);
  grad.addColorStop(0.7, `${GOLD}44`);
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
}

function drawDecorativeCircles(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxR: number) {
  ctx.strokeStyle = `${GOLD}0a`;
  ctx.lineWidth = 0.5;
  for (const r of [maxR, maxR * 0.7, maxR * 0.4]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawDotPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = `${GOLD}06`;
  for (let x = 0; x < w; x += 24) {
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw a simple QR-like pattern (visual placeholder for branding).
 * For a real QR code, we'd need a QR encoder library.
 * This draws a stylized "scan me" mini-code that links visually.
 */
function drawMiniQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cell = size / 7;
  ctx.fillStyle = GOLD;

  // Corner markers (3 corners, classic QR style)
  const drawCorner = (cx: number, cy: number) => {
    ctx.fillRect(cx, cy, cell * 3, cell);
    ctx.fillRect(cx, cy + cell * 2, cell * 3, cell);
    ctx.fillRect(cx, cy, cell, cell * 3);
    ctx.fillRect(cx + cell * 2, cy, cell, cell * 3);
    // Center dot
    ctx.fillRect(cx + cell, cy + cell, cell, cell);
  };

  drawCorner(x, y);                              // top-left
  drawCorner(x + cell * 4, y);                   // top-right
  drawCorner(x, y + cell * 4);                   // bottom-left

  // Some data dots for visual effect
  ctx.fillStyle = `${GOLD}aa`;
  const dots = [[4,4],[5,4],[4,5],[5,5],[6,5],[5,6],[6,6],[3,3],[6,3],[3,6]];
  for (const [dx, dy] of dots) {
    ctx.fillRect(x + dx * cell, y + dy * cell, cell * 0.8, cell * 0.8);
  }
}

function drawBrandFooter(ctx: CanvasRenderingContext2D, y: number, w: number, pad: number) {
  drawGoldDivider(ctx, y, w, pad);

  // QR code on the left
  const qrSize = 42;
  drawMiniQR(ctx, pad, y + 8, qrSize);

  // Text next to QR
  ctx.fillStyle = GRAY_600;
  ctx.font = '500 11px Inter, "Noto Sans SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('掃碼解讀你的命運', pad + qrSize + 10, y + 24);

  // Brand on right
  ctx.textAlign = 'right';
  ctx.fillStyle = GOLD;
  ctx.font = '600 12px Inter, sans-serif';
  const letters = 'D A I M O N . A P P'.split(' ');
  let lx = w - pad;
  ctx.textAlign = 'right';
  for (let i = letters.length - 1; i >= 0; i--) {
    ctx.fillText(letters[i], lx, y + 24);
    lx -= ctx.measureText(letters[i]).width + 2;
  }
  ctx.textAlign = 'left';
}

// Score ring drawing
function drawScoreRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  score: number, strokeW: number,
) {
  // Background circle
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = strokeW;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Score arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (score / 100) * Math.PI * 2;
  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, GOLD);
  grad.addColorStop(0.5, GOLD_BRIGHT);
  grad.addColorStop(1, GOLD);
  ctx.strokeStyle = grad;
  ctx.lineWidth = strokeW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Score number
  ctx.fillStyle = GOLD;
  ctx.font = `bold 36px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(score), cx, cy - 4);

  ctx.fillStyle = GRAY_500;
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText('/ 100', cx, cy + 18);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ==================== Element Colors ====================

const ELEMENT_COLORS: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#eab308', Metal: '#f59e0b', Water: '#3b82f6',
  木: '#22c55e', 火: '#ef4444', 土: '#eab308', 金: '#f59e0b', 水: '#3b82f6',
};

const COLOR_CN: Record<string, string> = {
  Green: '綠', Emerald: '翠綠', Teal: '青', Red: '紅', Purple: '紫', Orange: '橙',
  Yellow: '黃', Brown: '棕', Beige: '米', White: '白', Gold: '金', Silver: '銀',
  Black: '黑', Blue: '藍', Navy: '藏藍',
};

const COLOR_HEX: Record<string, string> = {
  Green: '#22c55e', Emerald: '#10b981', Teal: '#14b8a6', Red: '#ef4444',
  Purple: '#a855f7', Orange: '#f97316', Yellow: '#eab308', Brown: '#92400e',
  Beige: '#d4a574', White: '#f1f5f9', Gold: '#c8a96e', Silver: '#94a3b8',
  Black: '#1e293b', Blue: '#3b82f6', Navy: '#1e3a5f',
};

// ==================== Daily Fortune Card ====================

export interface DailyCardData {
  date: string;        // e.g. "2026年4月2日 星期四"
  ganZhi: string;      // e.g. "甲子"
  element: string;     // e.g. "木"
  nayin: string;       // e.g. "海中金"
  overall: number;
  career: number;
  relationships: number;
  health: number;
  wealth: number;
  luckyColors: string[];
  luckyDirections: string[];
  tenGod: string;
  favorability: string;
  userName?: string;
}

export async function generateDailyCard(data: DailyCardData): Promise<HTMLCanvasElement> {
  await waitForFonts();
  const W = 720;
  const H = 1080;
  const PAD = 48;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, VOID);
  bgGrad.addColorStop(0.5, VOID_LIGHT);
  bgGrad.addColorStop(1, VOID);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative elements
  drawDotPattern(ctx, W, H);
  drawDecorativeCircles(ctx, W - 60, 80, 120);

  // Brand header
  let y = 56;
  ctx.fillStyle = GOLD_DIM;
  ctx.font = '500 13px Inter, sans-serif';
  ctx.fillText('DAIMON · 每日運勢', PAD, y);

  // Date
  y += 36;
  ctx.fillStyle = GRAY_400;
  ctx.font = '14px Inter, "Noto Sans SC", sans-serif';
  ctx.fillText(data.date, PAD, y);

  // User name
  if (data.userName) {
    y += 24;
    ctx.fillStyle = GRAY_500;
    ctx.font = '13px Inter, "Noto Sans SC", sans-serif';
    ctx.fillText(`${data.userName} 的今日運勢`, PAD, y);
  }

  // Big GanZhi character
  y += 60;
  ctx.fillStyle = GOLD;
  ctx.font = `bold 72px "Noto Serif SC", serif`;
  ctx.fillText(data.ganZhi, PAD, y);

  // Element + Nayin
  y += 30;
  ctx.fillStyle = GRAY_500;
  ctx.font = '14px "Noto Serif SC", serif';
  ctx.fillText(`${data.element} 日 · ${data.nayin}`, PAD, y);

  // Ten God badge
  y += 32;
  const badgeText = `${data.tenGod}${data.favorability === 'favorable' ? ' — 吉' : data.favorability === 'unfavorable' ? ' — 凶' : ''}`;
  const badgeW = ctx.measureText(badgeText).width + 24;
  roundRect(ctx, PAD, y - 16, badgeW, 28, 14);
  ctx.fillStyle = data.favorability === 'favorable' ? `${GOLD}1a` : data.favorability === 'unfavorable' ? '#ef44441a' : '#6b72801a';
  ctx.fill();
  ctx.strokeStyle = data.favorability === 'favorable' ? `${GOLD}33` : data.favorability === 'unfavorable' ? '#ef444433' : '#6b728033';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = data.favorability === 'favorable' ? GOLD : data.favorability === 'unfavorable' ? '#ef4444' : GRAY_400;
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.fillText(badgeText, PAD + 12, y + 1);

  // Score Ring — centered
  y += 64;
  drawScoreRing(ctx, W / 2, y + 60, 56, data.overall, 6);

  // Score bars
  y += 146;
  const bars = [
    { label: '事業', score: data.career, emoji: '💼' },
    { label: '感情', score: data.relationships, emoji: '💖' },
    { label: '健康', score: data.health, emoji: '🌿' },
    { label: '財運', score: data.wealth, emoji: '💰' },
  ];

  for (const bar of bars) {
    y += 40;
    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = GRAY_400;
    ctx.fillText(`${bar.label}`, PAD + 32, y);

    // Bar background
    const barX = PAD + 100;
    const barW = W - PAD * 2 - 140;
    roundRect(ctx, barX, y - 8, barW, 12, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();

    // Bar fill
    const fillW = (bar.score / 100) * barW;
    if (fillW > 0) {
      roundRect(ctx, barX, y - 8, fillW, 12, 6);
      const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      if (bar.score >= 75) {
        barGrad.addColorStop(0, GOLD_DIM);
        barGrad.addColorStop(1, GOLD);
      } else if (bar.score >= 50) {
        barGrad.addColorStop(0, '#4b5563');
        barGrad.addColorStop(1, '#9ca3af');
      } else {
        barGrad.addColorStop(0, '#991b1b');
        barGrad.addColorStop(1, '#ef4444');
      }
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    // Score number
    ctx.fillStyle = `${GOLD}cc`;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(bar.score), W - PAD, y);
    ctx.textAlign = 'left';
  }

  // Lucky section
  y += 56;
  drawGoldDivider(ctx, y, W, PAD);
  y += 30;
  ctx.fillStyle = GOLD;
  ctx.font = '500 14px "Noto Sans SC", sans-serif';
  ctx.fillText('開運指南', PAD, y);

  // Lucky colors
  y += 36;
  ctx.fillStyle = GRAY_500;
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.fillText('幸運色', PAD, y);
  let cx = PAD + 56;
  for (const color of data.luckyColors) {
    ctx.beginPath();
    ctx.arc(cx, y - 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_HEX[color] || '#888';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const cn = COLOR_CN[color] || color;
    ctx.fillStyle = GRAY_400;
    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.fillText(cn, cx + 14, y);
    cx += ctx.measureText(cn).width + 34;
  }

  // Lucky directions
  y += 36;
  ctx.fillStyle = GRAY_500;
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.fillText('方位', PAD, y);
  ctx.fillStyle = GRAY_400;
  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.fillText(data.luckyDirections.join(' · '), PAD + 56, y);

  // Comparison copy — social hook
  y += 52;
  ctx.fillStyle = GOLD;
  ctx.font = '500 16px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`我今天 ${data.overall} 分，你呢？`, W / 2, y);
  ctx.textAlign = 'left';

  // Footer
  y = H - 48;
  drawBrandFooter(ctx, y - 20, W, PAD);

  return canvas;
}

// ==================== Match Compatibility Card ====================

export interface MatchCardData {
  nameA: string;
  nameB: string;
  overallScore: number;
  stemA: string;
  stemB: string;
  elementA: string;
  elementB: string;
  elementRelation: string;
  emotional: number;
  intellectual: number;
  physical: number;
  spiritual: number;
  practical: number;
  strengths: string[];
  inviteCode?: string;
}

export async function generateMatchCard(data: MatchCardData): Promise<HTMLCanvasElement> {
  await waitForFonts();
  const W = 720;
  const H = 960;
  const PAD = 48;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, VOID);
  bgGrad.addColorStop(0.5, VOID_LIGHT);
  bgGrad.addColorStop(1, VOID);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  drawDotPattern(ctx, W, H);
  drawDecorativeCircles(ctx, W - 60, 80, 100);

  // Header
  let y = 56;
  ctx.fillStyle = GOLD_DIM;
  ctx.font = '500 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAIMON · 命運配對', W / 2, y);

  // Names
  y += 50;
  ctx.fillStyle = '#fff';
  ctx.font = '600 22px "Noto Sans SC", Inter, sans-serif';
  ctx.fillText(`${data.nameA}  ×  ${data.nameB}`, W / 2, y);

  // Day Master face-off
  y += 70;
  const stemSize = 64;
  // Person A stem
  ctx.fillStyle = ELEMENT_COLORS[data.elementA] || GOLD;
  ctx.font = `bold ${stemSize}px "Noto Serif SC", serif`;
  ctx.fillText(data.stemA, W / 2 - 100, y);

  // VS / relation
  ctx.fillStyle = `${GOLD}66`;
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('×', W / 2, y - 10);
  ctx.fillStyle = GRAY_500;
  ctx.font = '11px "Noto Sans SC", sans-serif';
  ctx.fillText(data.elementRelation, W / 2, y + 12);

  // Person B stem
  ctx.fillStyle = ELEMENT_COLORS[data.elementB] || GOLD;
  ctx.font = `bold ${stemSize}px "Noto Serif SC", serif`;
  ctx.fillText(data.stemB, W / 2 + 100, y);

  // Element labels
  y += 20;
  ctx.fillStyle = GRAY_500;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText(data.elementA, W / 2 - 100, y);
  ctx.fillText(data.elementB, W / 2 + 100, y);

  // Score ring
  y += 60;
  drawScoreRing(ctx, W / 2, y + 50, 50, data.overallScore, 5);

  // Category bars
  y += 130;
  ctx.textAlign = 'left';
  const cats = [
    { label: '情感', score: data.emotional },
    { label: '智識', score: data.intellectual },
    { label: '感應', score: data.physical },
    { label: '靈性', score: data.spiritual },
    { label: '務實', score: data.practical },
  ];

  for (const cat of cats) {
    y += 34;
    ctx.fillStyle = GRAY_500;
    ctx.font = '13px "Noto Sans SC", sans-serif';
    ctx.fillText(cat.label, PAD, y);

    const barX = PAD + 60;
    const barW = W - PAD * 2 - 100;
    roundRect(ctx, barX, y - 6, barW, 10, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fill();

    const fillW = (cat.score / 100) * barW;
    if (fillW > 0) {
      roundRect(ctx, barX, y - 6, fillW, 10, 5);
      const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      barGrad.addColorStop(0, GOLD);
      barGrad.addColorStop(1, GOLD_BRIGHT);
      ctx.fillStyle = barGrad;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = GRAY_600;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(cat.score), W - PAD, y);
    ctx.textAlign = 'left';
  }

  // Strengths (top 2)
  if (data.strengths.length > 0) {
    y += 40;
    drawGoldDivider(ctx, y, W, PAD);
    y += 28;
    ctx.fillStyle = GOLD;
    ctx.font = '500 13px "Noto Sans SC", sans-serif';
    ctx.fillText('契合優勢', PAD, y);

    for (const s of data.strengths.slice(0, 2)) {
      y += 28;
      ctx.fillStyle = '#22c55e88';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('+', PAD, y);
      ctx.fillStyle = GRAY_400;
      ctx.font = '12px "Noto Sans SC", sans-serif';
      // Truncate long strings
      const maxW = W - PAD * 2 - 20;
      let text = s;
      while (ctx.measureText(text).width > maxW && text.length > 10) {
        text = text.slice(0, -1);
      }
      if (text !== s) text += '…';
      ctx.fillText(text, PAD + 20, y);
    }
  }

  // Invite CTA
  if (data.inviteCode) {
    y += 48;
    // CTA box
    roundRect(ctx, PAD, y - 4, W - PAD * 2, 48, 12);
    ctx.fillStyle = `${GOLD}12`;
    ctx.fill();
    ctx.strokeStyle = `${GOLD}33`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = GOLD;
    ctx.font = '500 14px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`我們的契合度 ${data.overallScore} 分，你和TA呢？`, W / 2, y + 26);
    ctx.textAlign = 'left';
  }

  // Footer
  const footerY = H - 48;
  drawBrandFooter(ctx, footerY - 20, W, PAD);

  return canvas;
}

// ==================== Download / Share Helper ====================

// Ensure fonts are loaded before canvas rendering
async function waitForFonts(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 2000)), // 2s timeout
      ]);
    } catch {
      // Proceed with available fonts
    }
  }
}

export async function shareOrDownloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<void> {
  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to generate image'));
    }, 'image/png', 1.0);
  });

  const file = new File([blob], fileName, { type: 'image/png' });

  // Try native share with file
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Daimon 命運解讀',
      });
      return;
    } catch {
      // User cancelled or error — fall through to download
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
