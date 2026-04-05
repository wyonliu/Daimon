import type { Metadata } from 'next';
import Link from 'next/link';

// ==================== Heavenly Stems & Earthly Branches ====================

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  // Format: YYYY-MM-DD
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = parseInt(y);
  const month = parseInt(m);
  const day = parseInt(d);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function getDayGanZhi(year: number, month: number, day: number): { stem: string; branch: string } {
  // Simplified day pillar calculation using Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const stemIdx = (jdn + 9) % 10;
  const branchIdx = (jdn + 1) % 12;

  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx] };
}

// ==================== Static Generation ====================

export function generateStaticParams() {
  // Generate pages for the next 30 days and past 7 days
  const params = [];
  const now = new Date();
  for (let offset = -7; offset <= 30; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    params.push({ date: dateStr });
  }
  return params;
}

export function generateMetadata({ params }: { params: { date: string } }): Metadata {
  const parsed = parseDate(params.date);
  if (!parsed) return { title: 'Daimon — 每日運勢' };

  const { year, month, day } = parsed;
  const { stem, branch } = getDayGanZhi(year, month, day);
  const element = ELEMENTS[STEMS.indexOf(stem)];
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];

  return {
    title: `${year}年${month}月${day}日運勢 — ${stem}${branch}日 | Daimon 每日命理`,
    description: `${year}年${month}月${day}日(星期${weekday})運勢解讀。${stem}${branch}日，${element}日，查看今日事業、感情、財運、健康運勢。`,
    keywords: `${year}年${month}月${day}日運勢, ${stem}${branch}, 每日運勢, 八字日運, 今日運勢, 命理`,
    openGraph: {
      title: `${month}/${day} ${stem}${branch}日運勢 | Daimon`,
      description: `${year}年${month}月${day}日 ${stem}${branch}日運勢分析，查看事業、感情、健康運勢指數。`,
    },
  };
}

// ==================== Page Component ====================

export default function FortuneDatePage({ params }: { params: { date: string } }) {
  const parsed = parseDate(params.date);

  if (!parsed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-200 mb-4">日期格式無效</h1>
          <p className="text-sm text-gray-500 mb-6">請使用 YYYY-MM-DD 格式</p>
          <Link href="/daily" className="text-gold-500 hover:underline">查看今日運勢</Link>
        </div>
      </main>
    );
  }

  const { year, month, day } = parsed;
  const { stem, branch } = getDayGanZhi(year, month, day);
  const element = ELEMENTS[STEMS.indexOf(stem)];
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const ganZhi = `${stem}${branch}`;

  const ELEMENT_COLORS: Record<string, string> = { 木: 'text-green-400', 火: 'text-red-400', 土: 'text-yellow-500', 金: 'text-amber-400', 水: 'text-blue-500' };

  // Generate related dates for navigation
  const relatedDates: { label: string; date: string }[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue;
    const d = new Date(year, month - 1, day + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    relatedDates.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      date: dateStr,
    });
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gold-500/[0.03] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs text-gold-500/60 tracking-[0.2em] uppercase mb-4">DAIMON · 每日運勢</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient-gold mb-3">
            {ganZhi}日
          </h1>
          <p className="text-gray-400 mb-1">
            {year}年{month}月{day}日 · 星期{weekday}
          </p>
          <p className="text-sm text-gray-500">
            <span className={ELEMENT_COLORS[element]}>{element}</span>日 · 天干{stem} · 地支{branch}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Day explanation */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">{ganZhi}日解析</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              {stem}屬{element}，為天干第{STEMS.indexOf(stem) + 1}位。{branch}為地支，
              {stem}{branch}組合形成今日獨特的五行能量場。
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              不同日主在{ganZhi}日會有不同的運勢表現。輸入您的出生日期，
              即可獲得個性化的{ganZhi}日運勢解讀，包含事業、感情、財運、健康四大維度。
            </p>
          </div>

          {/* Five elements interaction */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">五行能量</h2>
            <div className="grid grid-cols-5 gap-2">
              {['木', '火', '土', '金', '水'].map(el => (
                <div
                  key={el}
                  className={`text-center py-3 rounded-xl border transition-all ${
                    el === element
                      ? 'bg-gold-500/10 border-gold-500/30'
                      : 'bg-void-lighter border-gray-800'
                  }`}
                >
                  <span className={`text-2xl block mb-1 ${ELEMENT_COLORS[el]}`}>{el}</span>
                  <span className={`text-xs ${el === element ? 'text-gold-500' : 'text-gray-600'}`}>
                    {el === element ? '主導' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold text-lg press-effect btn-shimmer"
            >
              查看個性化運勢
            </Link>
            <p className="text-xs text-gray-600">輸入生辰即可獲得專屬運勢解讀</p>
          </div>

          {/* Related dates */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">相鄰日期運勢</h2>
            <div className="flex flex-wrap gap-2">
              {relatedDates.map(rd => (
                <Link
                  key={rd.date}
                  href={`/fortune/${rd.date}`}
                  className="px-4 py-2 rounded-lg bg-void-lighter border border-gray-800 text-sm text-gray-400 hover:border-gold-500/30 hover:text-gold-500 transition-all"
                >
                  {rd.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${year}年${month}月${day}日 ${ganZhi}日運勢`,
            description: `${ganZhi}日每日運勢分析，${element}日五行能量解讀。`,
            datePublished: params.date,
            author: { '@type': 'Organization', name: 'Daimon' },
          }),
        }}
      />
    </main>
  );
}
