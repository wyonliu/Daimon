import type { Metadata } from 'next';
import Link from 'next/link';

// ==================== Zodiac Data ====================

const ZODIAC_DATA: Record<string, {
  name: string;
  nameEn: string;
  element: string;
  dates: string;
  traits: string[];
  baziElement: string;
  description: string;
}> = {
  aries:       { name: '白羊座', nameEn: 'Aries',       element: '火', dates: '3月21日 - 4月19日', traits: ['勇敢', '自信', '衝動', '領導力'], baziElement: '火', description: '白羊座屬火相星座，在八字命理中對應丙火或丁火日主。火性人格積極主動、充滿行動力，與白羊座的開拓精神完美呼應。' },
  taurus:      { name: '金牛座', nameEn: 'Taurus',      element: '土', dates: '4月20日 - 5月20日', traits: ['穩重', '務實', '耐心', '享受'], baziElement: '土', description: '金牛座屬土相星座，在八字中對應戊土或己土日主。土性人格踏實穩健、重視物質安全，與金牛座的務實特質高度一致。' },
  gemini:      { name: '雙子座', nameEn: 'Gemini',      element: '風', dates: '5月21日 - 6月20日', traits: ['機智', '善變', '好奇', '社交'], baziElement: '木', description: '雙子座屬風相星座，在八字中對應甲木或乙木日主。木性人格靈活多變、生長不止，與雙子座的好奇與多面性相互輝映。' },
  cancer:      { name: '巨蟹座', nameEn: 'Cancer',      element: '水', dates: '6月21日 - 7月22日', traits: ['感性', '顧家', '直覺', '保護'], baziElement: '水', description: '巨蟹座屬水相星座，在八字中對應壬水或癸水日主。水性人格感性細膩、包容流動，與巨蟹座的情感深度完美契合。' },
  leo:         { name: '獅子座', nameEn: 'Leo',         element: '火', dates: '7月23日 - 8月22日', traits: ['自信', '慷慨', '戲劇性', '王者'], baziElement: '火', description: '獅子座屬火相星座，在八字中對應丙火日主。丙火如同太陽，光芒萬丈、慷慨大方，與獅子座的王者氣質渾然天成。' },
  virgo:       { name: '處女座', nameEn: 'Virgo',       element: '土', dates: '8月23日 - 9月22日', traits: ['細緻', '分析', '完美主義', '服務'], baziElement: '土', description: '處女座屬土相星座，在八字中對應己土日主。己土細緻入微、滋養萬物，與處女座的分析力和服務精神相得益彰。' },
  libra:       { name: '天秤座', nameEn: 'Libra',       element: '風', dates: '9月23日 - 10月22日', traits: ['和諧', '公正', '優雅', '猶豫'], baziElement: '金', description: '天秤座屬風相星座，在八字中對應庚金或辛金日主。金性人格追求秩序與美感，與天秤座的平衡和諧特質高度吻合。' },
  scorpio:     { name: '天蠍座', nameEn: 'Scorpio',     element: '水', dates: '10月23日 - 11月21日', traits: ['深沉', '洞察', '執著', '神秘'], baziElement: '水', description: '天蠍座屬水相星座，在八字中對應壬水日主。壬水如大海深不可測、力量磅礴，與天蠍座的深邃神秘完美對應。' },
  sagittarius: { name: '射手座', nameEn: 'Sagittarius', element: '火', dates: '11月22日 - 12月21日', traits: ['自由', '樂觀', '冒險', '哲學'], baziElement: '火', description: '射手座屬火相星座，在八字中對應丁火日主。丁火如燭光照亮前路、追尋真理，與射手座的探索精神一脈相承。' },
  capricorn:   { name: '摩羯座', nameEn: 'Capricorn',   element: '土', dates: '12月22日 - 1月19日', traits: ['紀律', '野心', '耐心', '務實'], baziElement: '土', description: '摩羯座屬土相星座，在八字中對應戊土日主。戊土如高山巍峨、堅韌不拔，與摩羯座的毅力和野心完全一致。' },
  aquarius:    { name: '水瓶座', nameEn: 'Aquarius',    element: '風', dates: '1月20日 - 2月18日', traits: ['創新', '獨立', '人道', '叛逆'], baziElement: '金', description: '水瓶座屬風相星座，在八字中對應辛金日主。辛金如寶石般獨特閃耀、不隨波逐流，與水瓶座的創新獨立精神呼應。' },
  pisces:      { name: '雙魚座', nameEn: 'Pisces',      element: '水', dates: '2月19日 - 3月20日', traits: ['夢幻', '同理心', '直覺', '藝術'], baziElement: '水', description: '雙魚座屬水相星座，在八字中對應癸水日主。癸水如雨露滋潤萬物、感性細膩，與雙魚座的夢幻直覺完美融合。' },
};

const ALL_SIGNS = Object.keys(ZODIAC_DATA);

// ==================== Static Generation ====================

export function generateStaticParams() {
  return ALL_SIGNS.map((sign) => ({ sign }));
}

export function generateMetadata({ params }: { params: { sign: string } }): Metadata {
  const data = ZODIAC_DATA[params.sign];
  if (!data) return { title: 'Daimon — 星座命理' };

  return {
    title: `${data.name}命理解讀 — 八字 × 占星 | Daimon`,
    description: `${data.name}(${data.nameEn})的八字命理對照分析。${data.dates}出生，${data.element}相星座，對應八字${data.baziElement}行。深度性格、事業、感情解讀。`,
    keywords: `${data.name}, ${data.nameEn}, 八字, 命理, 星座, ${data.element}相, ${data.baziElement}行, 運勢, 性格分析`,
    openGraph: {
      title: `${data.name} × 八字命理 | Daimon`,
      description: data.description.slice(0, 120),
    },
  };
}

// ==================== Page Component ====================

export default function ZodiacPage({ params }: { params: { sign: string } }) {
  const data = ZODIAC_DATA[params.sign];

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-200 mb-4">星座未找到</h1>
          <Link href="/" className="text-gold-500 hover:underline">返回首頁</Link>
        </div>
      </main>
    );
  }

  const ELEMENT_COLORS: Record<string, string> = { 火: 'text-red-400', 土: 'text-yellow-500', 風: 'text-blue-300', 水: 'text-blue-500' };
  const BAZI_COLORS: Record<string, string> = { 火: 'text-red-400', 土: 'text-yellow-500', 金: 'text-amber-400', 水: 'text-blue-500', 木: 'text-green-400' };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gold-500/[0.03] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs text-gold-500/60 tracking-[0.2em] uppercase mb-4">DAIMON · 星座命理</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient-gold mb-3">
            {data.name}
          </h1>
          <p className="text-gray-400 mb-1">{data.nameEn} · {data.dates}</p>
          <p className="text-sm text-gray-500">
            <span className={ELEMENT_COLORS[data.element]}>{data.element}</span>相星座 ·
            對應八字<span className={BAZI_COLORS[data.baziElement]}>{data.baziElement}</span>行
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Description */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">八字 × 占星 對照解讀</h2>
            <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
          </div>

          {/* Traits */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">核心性格特質</h2>
            <div className="flex flex-wrap gap-2">
              {data.traits.map(trait => (
                <span key={trait} className="px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500/80 text-sm">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Cross-links */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gold-500 mb-3">配對契合度</h2>
            <p className="text-sm text-gray-500 mb-4">查看{data.name}與其他星座的命理契合分析</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ALL_SIGNS.filter(s => s !== params.sign).map(s => {
                const other = ZODIAC_DATA[s];
                return (
                  <Link
                    key={s}
                    href={`/zodiac/${s}`}
                    className="py-2 px-3 rounded-lg bg-void-lighter border border-gray-800 text-center text-sm text-gray-400 hover:border-gold-500/30 hover:text-gold-500 transition-all"
                  >
                    {other.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Link
              href="/#reading"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-void font-semibold text-lg press-effect btn-shimmer"
            >
              輸入生辰，開始解讀
            </Link>
            <p className="text-xs text-gray-600">免費查看基礎命盤 · 精準八字四柱分析</p>
          </div>
        </div>
      </section>

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${data.name}命理解讀 — 八字與占星對照分析`,
            description: data.description,
            author: { '@type': 'Organization', name: 'Daimon' },
            publisher: { '@type': 'Organization', name: 'Daimon' },
          }),
        }}
      />
    </main>
  );
}
