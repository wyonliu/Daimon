/**
 * Daimon BaZi Engine — ShenSha (神煞 Special Stars) & GeJu (格局 Chart Patterns)
 *
 * Implements classical BaZi special star lookups and chart pattern identification
 * based on Day Master, Year Branch, Month Branch, and pillar relationships.
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants';

// ==================== Types ====================

export interface ShenSha {
  name: string;       // Chinese name
  nameEn: string;     // English name
  pinyin: string;     // Pinyin
  description: string; // What it means for the person's life
  pillar?: string;    // Which pillar(s) it appears in
  type: 'auspicious' | 'inauspicious' | 'neutral';
}

export interface KongWang {
  branches: string[];    // The two empty branches
  affectedPillars: string[]; // Which pillars are affected (e.g. 'Year', 'Month')
}

export interface ChartPattern {
  name: string;       // Chinese name
  nameEn: string;     // English name
  description: string; // What this pattern means for the person
  quality: 'noble' | 'wealth' | 'authority' | 'intelligence' | 'resource' | 'special';
}

// ==================== Constants ====================

const PILLAR_NAMES = ['Year', 'Month', 'Day', 'Hour'];

/**
 * 天乙贵人 lookup: Day Stem -> matching branches
 * 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→卯巳, 辛→午寅
 */
const TIANYI_GUIREN: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['午', '寅'],
};

/**
 * 文昌 lookup: Day Stem -> branch
 */
const WENCHANG: Record<string, string> = {
  '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
  '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
};

/**
 * 驿马 lookup: Year Branch group -> target branch
 * 申子辰→寅, 寅午戌→申, 巳酉丑→亥, 亥卯未→巳
 */
const YIMA: Record<string, string> = {
  '申': '寅', '子': '寅', '辰': '寅',
  '寅': '申', '午': '申', '戌': '申',
  '巳': '亥', '酉': '亥', '丑': '亥',
  '亥': '巳', '卯': '巳', '未': '巳',
};

/**
 * 桃花 lookup: Year Branch group -> target branch
 * 申子辰→酉, 寅午戌→卯, 巳酉丑→午, 亥卯未→子
 */
const TAOHUA: Record<string, string> = {
  '申': '酉', '子': '酉', '辰': '酉',
  '寅': '卯', '午': '卯', '戌': '卯',
  '巳': '午', '酉': '午', '丑': '午',
  '亥': '子', '卯': '子', '未': '子',
};

/**
 * 华盖 lookup: Year Branch group -> target branch
 * 申子辰→辰, 寅午戌→戌, 巳酉丑→丑, 亥卯未→未
 */
const HUAGAI: Record<string, string> = {
  '申': '辰', '子': '辰', '辰': '辰',
  '寅': '戌', '午': '戌', '戌': '戌',
  '巳': '丑', '酉': '丑', '丑': '丑',
  '亥': '未', '卯': '未', '未': '未',
};

/**
 * 羊刃 lookup: Day Stem -> branch
 * 甲→卯, 丙戊→午, 庚→酉, 壬→子
 * (Only Yang stems have Yang Blade)
 */
const YANGREN: Record<string, string> = {
  '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子',
};

/**
 * 将星 lookup: Year Branch group -> target branch
 * 申子辰→子, 寅午戌→午, 巳酉丑→酉, 亥卯未→卯
 */
const JIANGXING: Record<string, string> = {
  '申': '子', '子': '子', '辰': '子',
  '寅': '午', '午': '午', '戌': '午',
  '巳': '酉', '酉': '酉', '丑': '酉',
  '亥': '卯', '卯': '卯', '未': '卯',
};

/**
 * 天德贵人 lookup: Month Branch -> value (stem or branch)
 * The result is checked against all stems and branches in the chart.
 */
const TIANDE: Record<string, string> = {
  '子': '巳', '丑': '庚', '寅': '丁', '卯': '申',
  '辰': '壬', '巳': '辛', '午': '亥', '未': '甲',
  '申': '癸', '酉': '寅', '戌': '丙', '亥': '乙',
};

/**
 * 月德贵人 lookup: Month Branch -> stem value
 * The result is checked against all stems in the chart.
 */
const YUEDE: Record<string, string> = {
  '子': '壬', '丑': '庚', '寅': '丙', '卯': '甲',
  '辰': '壬', '巳': '庚', '午': '丙', '未': '甲',
  '申': '壬', '酉': '庚', '戌': '丙', '亥': '甲',
};

/**
 * 空亡 (Void/Empty) — Six Jia Groups (六旬)
 * Each group of 10 in the 60 Jiazi cycle leaves 2 branches uncovered.
 */
const KONGWANG_TABLE: { startStemIdx: number; startBranchIdx: number; empty: [string, string] }[] = [
  { startStemIdx: 0, startBranchIdx: 0, empty: ['戌', '亥'] },  // 甲子旬
  { startStemIdx: 0, startBranchIdx: 10, empty: ['申', '酉'] }, // 甲戌旬
  { startStemIdx: 0, startBranchIdx: 8, empty: ['午', '未'] },  // 甲申旬
  { startStemIdx: 0, startBranchIdx: 6, empty: ['辰', '巳'] },  // 甲午旬
  { startStemIdx: 0, startBranchIdx: 4, empty: ['寅', '卯'] },  // 甲辰旬
  { startStemIdx: 0, startBranchIdx: 2, empty: ['子', '丑'] },  // 甲寅旬
];

// ==================== Helper Functions ====================

function stemIndex(stem: string): number {
  return (HEAVENLY_STEMS as readonly string[]).indexOf(stem);
}

function branchIndex(branch: string): number {
  return (EARTHLY_BRANCHES as readonly string[]).indexOf(branch);
}

/**
 * Find which pillars contain the given branch.
 */
function findPillarsWithBranch(
  target: string,
  branches: string[],
): string[] {
  const result: string[] = [];
  for (let i = 0; i < branches.length; i++) {
    if (branches[i] === target) {
      result.push(PILLAR_NAMES[i]);
    }
  }
  return result;
}

/**
 * Determine the 旬 (xun / decade group) of a given day pillar in the 60 Jiazi cycle
 * and return the two empty branches.
 */
function getKongWangBranches(dayStem: string, dayBranch: string): [string, string] {
  const si = stemIndex(dayStem);
  const bi = branchIndex(dayBranch);

  // Position in the 60 Jiazi cycle: the stem and branch indices must satisfy
  // (stemIdx - branchIdx) mod 12 to determine the group offset.
  // Within a group of 10, the stem offset from 甲 (0) tells us how far into the group we are.
  // The starting branch of the group is: (branchIdx - stemIdx + 12) % 12
  const startBranch = ((bi - si) % 12 + 12) % 12;

  // Match against the known groups
  for (const group of KONGWANG_TABLE) {
    if (group.startBranchIdx === startBranch) {
      return group.empty;
    }
  }

  // Fallback (should never reach here with valid input)
  return ['戌', '亥'];
}

// ==================== Main Analysis Functions ====================

/**
 * Analyze all ShenSha (神煞 Special Stars) present in a BaZi chart.
 *
 * @param dayStem - Day pillar Heavenly Stem (日干)
 * @param yearBranch - Year pillar Earthly Branch
 * @param monthBranch - Month pillar Earthly Branch
 * @param dayBranch - Day pillar Earthly Branch
 * @param hourBranch - Hour pillar Earthly Branch
 * @param allStems - All four Heavenly Stems [year, month, day, hour]
 * @param allBranches - All four Earthly Branches [year, month, day, hour]
 */
export function analyzeShenSha(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
  allStems: string[],
  allBranches: string[],
): ShenSha[] {
  const stars: ShenSha[] = [];
  const branches = [yearBranch, monthBranch, dayBranch, hourBranch];

  // 1. 天乙贵人 (Heavenly Noble)
  const tianyiTargets = TIANYI_GUIREN[dayStem] || [];
  const tianyiPillars: string[] = [];
  for (const target of tianyiTargets) {
    tianyiPillars.push(...findPillarsWithBranch(target, branches));
  }
  if (tianyiPillars.length > 0) {
    stars.push({
      name: '天乙贵人',
      nameEn: 'Heavenly Noble',
      pinyin: 'Tiān Yi Gui Ren',
      description:
        'The most auspicious star in BaZi. Attracts help from benefactors and authority figures throughout life. When difficulties arise, noble people appear to offer guidance and rescue. Indicates natural charisma, social grace, and the ability to turn crises into opportunities. Career and relationships benefit from timely support.',
      pillar: [...new Set(tianyiPillars)].join(', '),
      type: 'auspicious',
    });
  }

  // 2. 文昌 (Literary Star)
  const wenchangTarget = WENCHANG[dayStem];
  if (wenchangTarget) {
    const pillars = findPillarsWithBranch(wenchangTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '文昌',
        nameEn: 'Literary Star',
        pinyin: 'Wen Chang',
        description:
          'Bestows exceptional intellectual ability and academic fortune. The person excels in study, writing, examination, and any pursuit requiring mental acuity. Indicates talent in literature, communication, and scholarly achievement. Favorable for careers in education, publishing, law, and the arts.',
        pillar: pillars.join(', '),
        type: 'auspicious',
      });
    }
  }

  // 3. 驿马 (Travel / Movement Star) — based on Year Branch
  const yimaTarget = YIMA[yearBranch];
  if (yimaTarget) {
    const pillars = findPillarsWithBranch(yimaTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '驿马',
        nameEn: 'Travel Star',
        pinyin: 'Yi Ma',
        description:
          'Signifies a life of movement, travel, and change. The person is restless by nature, drawn to explore new places and ideas. Favorable for careers involving international business, transportation, diplomacy, or any role requiring mobility. May indicate relocation, frequent travel, or living abroad.',
        pillar: pillars.join(', '),
        type: 'neutral',
      });
    }
  }

  // 4. 桃花 (Peach Blossom / Romance Star) — based on Year Branch
  const taohuaTarget = TAOHUA[yearBranch];
  if (taohuaTarget) {
    const pillars = findPillarsWithBranch(taohuaTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '桃花',
        nameEn: 'Peach Blossom',
        pinyin: 'Tao Hua',
        description:
          'The star of romance, attractiveness, and social magnetism. Grants personal charm and the ability to captivate others. In the Year or Month pillar, it brings popularity and social success. In the Day pillar, it indicates a deeply romantic partner. In the Hour pillar, it can suggest romantic adventures later in life. When well-aspected, it enhances artistic talent and public appeal.',
        pillar: pillars.join(', '),
        type: 'neutral',
      });
    }
  }

  // 5. 华盖 (Canopy / Spiritual Star) — based on Year Branch
  const huagaiTarget = HUAGAI[yearBranch];
  if (huagaiTarget) {
    const pillars = findPillarsWithBranch(huagaiTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '华盖',
        nameEn: 'Canopy Star',
        pinyin: 'Hua Gai',
        description:
          'The star of spiritual depth, solitude, and inner wisdom. Indicates a person drawn to philosophy, religion, metaphysics, or artistic contemplation. Grants a brilliant but somewhat isolated mind. The person may prefer solitary pursuits and finds fulfillment in creative or spiritual work rather than social acclaim. Highly favorable for researchers, artists, monks, and independent thinkers.',
        pillar: pillars.join(', '),
        type: 'neutral',
      });
    }
  }

  // 6. 羊刃 (Blade of the Sheep / Aggressive Energy) — based on Day Stem
  const yangrenTarget = YANGREN[dayStem];
  if (yangrenTarget) {
    const pillars = findPillarsWithBranch(yangrenTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '羊刃',
        nameEn: 'Blade Star',
        pinyin: 'Yang Ren',
        description:
          'A double-edged star of extreme energy. Grants the person fierce determination, courage, and the will to overcome any obstacle. In favorable configurations, it produces leaders, warriors, and entrepreneurs of extraordinary drive. However, it also brings risk of accidents, conflict, and impulsive decisions. The person must learn to channel this intense energy constructively to avoid self-destructive tendencies.',
        pillar: pillars.join(', '),
        type: 'inauspicious',
      });
    }
  }

  // 7. 将星 (General's Star) — based on Year Branch
  const jiangxingTarget = JIANGXING[yearBranch];
  if (jiangxingTarget) {
    const pillars = findPillarsWithBranch(jiangxingTarget, branches);
    if (pillars.length > 0) {
      stars.push({
        name: '将星',
        nameEn: "General's Star",
        pinyin: 'Jiang Xing',
        description:
          'The star of leadership, authority, and commanding presence. Indicates a person with natural executive ability who inspires loyalty and respect. Favorable for military, government, corporate leadership, and any role requiring strategic command. The person carries an air of authority and is often entrusted with important responsibilities from a young age.',
        pillar: pillars.join(', '),
        type: 'auspicious',
      });
    }
  }

  // 8. 天德贵人 (Heavenly Virtue) — based on Month Branch
  const tiandeTarget = TIANDE[monthBranch];
  if (tiandeTarget) {
    // Check if the target value appears as any stem or branch in the chart
    const found = allStems.includes(tiandeTarget) || allBranches.includes(tiandeTarget);
    if (found) {
      stars.push({
        name: '天德贵人',
        nameEn: 'Heavenly Virtue',
        pinyin: 'Tian De Gui Ren',
        description:
          'A powerful protective star that shields against calamity and misfortune. The person is blessed with innate moral integrity and receives cosmic protection during dangerous times. Accidents are averted, legal troubles dissolve, and crises resolve favorably. Indicates a kind and virtuous character that naturally attracts good fortune and the respect of others.',
        type: 'auspicious',
      });
    }
  }

  // 9. 月德贵人 (Monthly Virtue) — based on Month Branch
  const yuedeTarget = YUEDE[monthBranch];
  if (yuedeTarget) {
    const found = allStems.includes(yuedeTarget);
    if (found) {
      stars.push({
        name: '月德贵人',
        nameEn: 'Monthly Virtue',
        pinyin: 'Yue De Gui Ren',
        description:
          'A benevolent star that brings consistent good fortune and protection from harm. Similar to Heavenly Virtue but focused on monthly cycles of luck. The person possesses an inherent kindness that is recognized and rewarded by fate. Softens the impact of inauspicious stars and enhances the power of auspicious ones. Especially beneficial for health and safety.',
        type: 'auspicious',
      });
    }
  }

  return stars;
}

/**
 * Analyze 空亡 (Kong Wang / Void) for the chart based on the Day Pillar's
 * position in the 60 Jiazi cycle.
 *
 * @param dayStem - Day pillar Heavenly Stem
 * @param dayBranch - Day pillar Earthly Branch
 * @param yearBranch - Year pillar Earthly Branch
 * @param monthBranch - Month pillar Earthly Branch
 * @param hourBranch - Hour pillar Earthly Branch
 */
export function analyzeKongWang(
  dayStem: string,
  dayBranch: string,
  yearBranch: string,
  monthBranch: string,
  hourBranch: string,
): KongWang {
  const emptyBranches = getKongWangBranches(dayStem, dayBranch);

  const pillarBranches = [
    { branch: yearBranch, name: 'Year' },
    { branch: monthBranch, name: 'Month' },
    // Day branch is part of the lookup key, not checked against itself
    { branch: hourBranch, name: 'Hour' },
  ];

  const affectedPillars: string[] = [];
  for (const p of pillarBranches) {
    if (emptyBranches.includes(p.branch)) {
      affectedPillars.push(p.name);
    }
  }

  return {
    branches: [...emptyBranches],
    affectedPillars,
  };
}

/**
 * Analyze the chart pattern (格局) based on the Month pillar's Ten God relationship
 * to the Day Master.
 *
 * Classical BaZi determines the chart pattern primarily from the month branch's
 * dominant hidden stem and its Ten God relationship to the Day Master. If no
 * standard pattern is found from hidden stems, the month stem's Ten God is used.
 *
 * @param monthTenGod - Month pillar's primary Ten God (from hidden stem's main qi)
 * @param monthStemTenGod - Month stem's Ten God
 * @param dayStem - Day Master stem
 * @param monthBranch - Month Earthly Branch
 */
export function analyzeChartPattern(
  monthTenGod: string,
  monthStemTenGod: string,
  dayStem: string,
  monthBranch: string,
): ChartPattern {
  // Check for special patterns first: 建禄格 and 羊刃格

  // 建禄格: Month branch contains Day Master's Companion (比肩)
  if (monthTenGod === '比肩') {
    return {
      name: '建禄格',
      nameEn: 'Self-Establishment Pattern',
      description:
        'The month branch holds the Day Master\'s own vital energy. This pattern indicates a self-reliant individual who builds success through personal effort rather than inheritance or external support. The person has strong willpower, a clear sense of identity, and the resilience to recover from setbacks. Best suited for entrepreneurship and independent careers. Must guard against excessive self-reliance that leads to isolation.',
      quality: 'special',
    };
  }

  // 羊刃格: Month branch is the Blade position for the Day Master
  const yangrenBranch = YANGREN[dayStem];
  if (yangrenBranch && monthBranch === yangrenBranch) {
    return {
      name: '羊刃格',
      nameEn: 'Blade Pattern',
      description:
        'The month branch sits at the Day Master\'s peak of power. This is a pattern of intense, sometimes overwhelming personal energy. When properly controlled by Seven Killings or Direct Officer, it produces formidable leaders, military commanders, and decisive executives. Without control, the excess energy can manifest as recklessness, conflict, or self-harm. The key to this pattern is finding a worthy outlet for extraordinary drive.',
      quality: 'authority',
    };
  }

  // Standard patterns based on the month hidden stem's Ten God
  // If month hidden stem is 比肩 or 劫财, fall through to month stem
  const tenGod = (monthTenGod === '劫财') ? monthStemTenGod : monthTenGod;

  const patterns: Record<string, ChartPattern> = {
    '正官': {
      name: '正官格',
      nameEn: 'Direct Officer Pattern',
      description:
        'The pattern of discipline, integrity, and structured achievement. The person thrives within established systems and earns advancement through competence and proper conduct. Natural affinity for government, law, corporate management, and any career with clear hierarchies. Values reputation, keeps promises, and commands respect through moral authority. The most traditionally valued pattern for stable, long-term success.',
      quality: 'authority',
    },
    '七杀': {
      name: '七杀格',
      nameEn: 'Seven Killings Pattern',
      description:
        'The pattern of power, pressure, and transformation. The person faces intense external challenges that forge extraordinary capability. When the Seven Killings is properly tamed (by Eating God or Direct Resource), it produces visionary leaders, revolutionary thinkers, and those who reshape their world. The person has sharp instincts, strategic brilliance, and an iron will. Without proper balance, the pressure can become destructive.',
      quality: 'authority',
    },
    '正财': {
      name: '正财格',
      nameEn: 'Direct Wealth Pattern',
      description:
        'The pattern of steady accumulation and practical achievement. The person builds wealth through diligence, careful management, and reliable methods. Naturally skilled at business, finance, and any endeavor requiring consistency and attention to detail. Values stability and security, handles money wisely, and plans for the long term. May lack flash but builds enduring prosperity.',
      quality: 'wealth',
    },
    '偏财': {
      name: '偏财格',
      nameEn: 'Indirect Wealth Pattern',
      description:
        'The pattern of dynamic wealth and social opportunity. The person attracts money through networking, deal-making, and seizing opportunities others miss. Naturally generous, socially adept, and comfortable managing large-scale ventures. Wealth comes from multiple sources rather than a single steady income. Excels in trading, sales, entertainment, and any field where relationships drive revenue.',
      quality: 'wealth',
    },
    '正印': {
      name: '正印格',
      nameEn: 'Direct Resource Pattern',
      description:
        'The pattern of wisdom, nurturing support, and intellectual refinement. The person benefits from strong mentors, a supportive family, and educational opportunities. Natural talent for teaching, counseling, research, and scholarly pursuits. Possesses deep compassion, patience, and a love of learning. Reputation grows through knowledge and kindness rather than ambition. Often protected by benefactors throughout life.',
      quality: 'resource',
    },
    '偏印': {
      name: '偏印格',
      nameEn: 'Indirect Resource Pattern',
      description:
        'The pattern of unconventional wisdom and independent thought. The person possesses rare intellectual abilities and sees the world from unique angles. Drawn to esoteric knowledge, metaphysics, alternative medicine, technology, and fields that reward original thinking. Can be brilliant but socially isolated. Must guard against overthinking and detachment from practical reality. At its best, produces genuine innovators and visionaries.',
      quality: 'resource',
    },
    '食神': {
      name: '食神格',
      nameEn: 'Eating God Pattern',
      description:
        'The pattern of natural talent, creativity, and life enjoyment. The person is blessed with effortless skill expression and an optimistic temperament. Excels in the arts, culinary arts, entertainment, teaching, and any field where creative output is valued. Possesses a generous spirit and the ability to make others happy. Life tends toward comfort and abundance. Must guard against complacency and over-indulgence.',
      quality: 'intelligence',
    },
    '伤官': {
      name: '伤官格',
      nameEn: 'Hurting Officer Pattern',
      description:
        'The pattern of brilliant intelligence, sharp wit, and rebellious innovation. The person challenges conventions, questions authority, and pushes boundaries in every domain. Extraordinarily articulate and perceptive, with a talent for exposing truth. Excels in law, debate, investigative journalism, technology, and disruptive entrepreneurship. The sharpest mind in the room, but must learn diplomacy to avoid unnecessary conflict.',
      quality: 'intelligence',
    },
  };

  if (patterns[tenGod]) {
    return patterns[tenGod];
  }

  // Fallback: if the hidden stem TenGod didn't match, try the month stem's TenGod
  if (patterns[monthStemTenGod]) {
    return patterns[monthStemTenGod];
  }

  // Ultimate fallback for edge cases (e.g., 比肩/劫财 in both hidden and stem)
  return {
    name: '建禄格',
    nameEn: 'Self-Establishment Pattern',
    description:
      'The month pillar reflects the Day Master\'s own energy. This pattern indicates a self-made individual who relies on personal effort and talent. Success comes through initiative and perseverance rather than external support. The person must actively seek outlets for their energy through career, relationships, and purposeful action.',
    quality: 'special',
  };
}
