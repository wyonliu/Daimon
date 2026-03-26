/**
 * Daimon Daily Destiny Engine — 每日运势
 *
 * Calculates today's exact 流日 (daily stem+branch) using lunar-javascript,
 * then cross-references with the user's natal chart to produce a personalized
 * daily reading. This is precision BaZi — not generic horoscopes.
 */

// @ts-expect-error - lunar-javascript doesn't have type declarations
import { Solar } from 'lunar-javascript';

import { BaziResult } from './calculator';
import {
  FIVE_ELEMENTS, ELEMENTS_EN,
  STEM_ELEMENT, STEM_POLARITY, BRANCH_ELEMENT,
  HEAVENLY_STEMS, EARTHLY_BRANCHES,
  NAYIN, NAYIN_EN,
} from './constants';

// ==================== Types ====================

export interface DailyDestiny {
  date: string; // YYYY-MM-DD
  liuRi: {
    stem: string;
    branch: string;
    ganZhi: string;
    element: string;
    elementEn: string;
    nayin: string;
    nayinEn: string;
  };
  liuYue: {
    stem: string;
    branch: string;
    ganZhi: string;
  };
  liuNian: {
    stem: string;
    branch: string;
    ganZhi: string;
  };

  dayMasterRelation: {
    tenGod: string;
    tenGodEn: string;
    favorability: 'favorable' | 'unfavorable' | 'neutral';
    description: string;
  };

  branchInteractions: {
    type: string;
    withPillar: string;
    branches: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];

  scores: {
    overall: number;
    career: number;
    relationships: number;
    health: number;
    wealth: number;
  };

  luckyColors: string[];
  luckyDirections: string[];
  avoidActivities: string[];
  luckyActivities: string[];
}

// ==================== Ten God Calculation ====================

/**
 * Calculate the Ten God relationship between two Heavenly Stems.
 * Uses the standard Five Element production/control cycle + yin/yang polarity.
 *
 * @param dayMaster - The natal chart's Day Master stem
 * @param otherStem - The stem to compare against (e.g. today's stem)
 * @returns Chinese Ten God name
 */
function calculateTenGod(dayMaster: string, otherStem: string): string {
  const dmElement = STEM_ELEMENT[dayMaster];
  const otherElement = STEM_ELEMENT[otherStem];
  const dmPolarity = STEM_POLARITY[dayMaster];
  const otherPolarity = STEM_POLARITY[otherStem];
  const samePolarity = dmPolarity === otherPolarity;

  // Same element
  if (dmElement === otherElement) {
    return samePolarity ? '比肩' : '劫财';
  }

  // I produce (我生): element that day master produces
  const iProduceElement = (dmElement + 1) % 5;
  if (otherElement === iProduceElement) {
    return samePolarity ? '食神' : '伤官';
  }

  // I control (我克): element that day master controls
  const iControlElement = (dmElement + 2) % 5;
  if (otherElement === iControlElement) {
    return samePolarity ? '偏财' : '正财';
  }

  // Controls me (克我): element that controls day master
  const controlsMeElement = ((dmElement - 2) + 5) % 5;
  if (otherElement === controlsMeElement) {
    return samePolarity ? '七杀' : '正官';
  }

  // Produces me (生我): element that produces day master
  const producesMeElement = ((dmElement - 1) + 5) % 5;
  if (otherElement === producesMeElement) {
    return samePolarity ? '偏印' : '正印';
  }

  return '比肩'; // fallback
}

function getTenGodEn(cnName: string): string {
  const cnToEn: Record<string, string> = {
    '比肩': 'Companion', '劫财': 'Rob Wealth', '食神': 'Eating God', '伤官': 'Hurting Officer',
    '偏财': 'Indirect Wealth', '正财': 'Direct Wealth', '七杀': 'Seven Killings', '正官': 'Direct Officer',
    '偏印': 'Indirect Resource', '正印': 'Direct Resource',
  };
  return cnToEn[cnName] || cnName;
}

// ==================== Branch Interaction Checks ====================

const BRANCH_CLASHES: Record<string, string> = {
  '子午': '子午冲', '午子': '子午冲',
  '丑未': '丑未冲', '未丑': '丑未冲',
  '寅申': '寅申冲', '申寅': '寅申冲',
  '卯酉': '卯酉冲', '酉卯': '卯酉冲',
  '辰戌': '辰戌冲', '戌辰': '辰戌冲',
  '巳亥': '巳亥冲', '亥巳': '巳亥冲',
};

const BRANCH_COMBOS: Record<string, string> = {
  '子丑': '子丑合', '丑子': '子丑合',
  '寅亥': '寅亥合', '亥寅': '寅亥合',
  '卯戌': '卯戌合', '戌卯': '卯戌合',
  '辰酉': '辰酉合', '酉辰': '辰酉合',
  '巳申': '巳申合', '申巳': '巳申合',
  '午未': '午未合', '未午': '午未合',
};

const BRANCH_HARMS: Record<string, string> = {
  '子未': '子未害', '未子': '子未害',
  '丑午': '丑午害', '午丑': '丑午害',
  '寅巳': '寅巳害', '巳寅': '寅巳害',
  '卯辰': '卯辰害', '辰卯': '卯辰害',
  '申亥': '申亥害', '亥申': '申亥害',
  '酉戌': '酉戌害', '戌酉': '酉戌害',
};

// 桃花 (Peach Blossom) branches by year branch
const TAOHUA: Record<string, string> = {
  '申': '酉', '子': '酉', '辰': '酉',
  '寅': '卯', '午': '卯', '戌': '卯',
  '巳': '午', '酉': '午', '丑': '午',
  '亥': '子', '卯': '子', '未': '子',
};

function findDailyBranchInteractions(
  todayBranch: string,
  natalChart: BaziResult,
): DailyDestiny['branchInteractions'] {
  const interactions: DailyDestiny['branchInteractions'] = [];
  const pillars = [
    { branch: natalChart.year.branch, label: 'Year' },
    { branch: natalChart.month.branch, label: 'Month' },
    { branch: natalChart.day.branch, label: 'Day' },
    { branch: natalChart.hour.branch, label: 'Hour' },
  ];

  for (const pillar of pillars) {
    const key = todayBranch + pillar.branch;

    if (BRANCH_CLASHES[key]) {
      interactions.push({
        type: `Clash (冲) — ${BRANCH_CLASHES[key]}`,
        withPillar: pillar.label,
        branches: `${todayBranch}–${pillar.branch}`,
        impact: 'negative',
      });
    }
    if (BRANCH_COMBOS[key]) {
      interactions.push({
        type: `Combination (合) — ${BRANCH_COMBOS[key]}`,
        withPillar: pillar.label,
        branches: `${todayBranch}–${pillar.branch}`,
        impact: 'positive',
      });
    }
    if (BRANCH_HARMS[key]) {
      interactions.push({
        type: `Harm (害) — ${BRANCH_HARMS[key]}`,
        withPillar: pillar.label,
        branches: `${todayBranch}–${pillar.branch}`,
        impact: 'negative',
      });
    }
  }

  return interactions;
}

// ==================== Scoring ====================

function calculateScores(
  tenGod: string,
  favorability: 'favorable' | 'unfavorable' | 'neutral',
  branchInteractions: DailyDestiny['branchInteractions'],
  todayBranch: string,
  natalChart: BaziResult,
): DailyDestiny['scores'] {
  // Base score from Ten God favorability
  let baseScore = favorability === 'favorable' ? 78 : favorability === 'unfavorable' ? 42 : 60;

  // Modify by branch interactions
  const clashCount = branchInteractions.filter(i => i.impact === 'negative').length;
  const comboCount = branchInteractions.filter(i => i.impact === 'positive').length;
  baseScore += comboCount * 8 - clashCount * 10;

  // Career: favorable if 正官/偏财/食神
  let career = baseScore;
  if (['正官', '偏财', '食神'].includes(tenGod)) career += 15;
  if (['七杀', '伤官'].includes(tenGod)) career -= 8;

  // Relationships: favorable if 正财/正官/桃花
  let relationships = baseScore;
  if (['正财', '正官'].includes(tenGod)) relationships += 12;
  if (['比肩', '劫财'].includes(tenGod)) relationships -= 5;
  // Check if today's branch is a 桃花 for the natal year branch
  const taohuaBranch = TAOHUA[natalChart.year.branch];
  if (taohuaBranch && todayBranch === taohuaBranch) relationships += 15;

  // Health: unfavorable if 流日 clashes with day branch
  let health = baseScore + 5;
  const dayClash = branchInteractions.find(
    i => i.withPillar === 'Day' && i.impact === 'negative'
  );
  if (dayClash) health -= 18;
  if (['正印', '食神'].includes(tenGod)) health += 8;

  // Wealth: favorable if 正财/偏财
  let wealth = baseScore;
  if (['正财', '偏财'].includes(tenGod)) wealth += 18;
  if (['劫财', '比肩'].includes(tenGod)) wealth -= 10;

  // Clamp all scores between 15 and 98
  const clamp = (v: number) => Math.max(15, Math.min(98, Math.round(v)));

  const overall = clamp(Math.round((baseScore + career + relationships + health + wealth) / 5));
  return {
    overall,
    career: clamp(career),
    relationships: clamp(relationships),
    health: clamp(health),
    wealth: clamp(wealth),
  };
}

// ==================== Lucky Attributes ====================

const ELEMENT_COLORS: Record<string, string[]> = {
  Wood: ['Green', 'Emerald', 'Teal'],
  Fire: ['Red', 'Purple', 'Orange'],
  Earth: ['Yellow', 'Brown', 'Beige'],
  Metal: ['White', 'Gold', 'Silver'],
  Water: ['Black', 'Blue', 'Navy'],
};

const ELEMENT_DIRECTIONS: Record<string, string[]> = {
  Wood: ['East', 'Southeast'],
  Fire: ['South'],
  Earth: ['Center', 'Northeast', 'Southwest'],
  Metal: ['West', 'Northwest'],
  Water: ['North'],
};

const LUCKY_ACTIVITIES: Record<string, string[]> = {
  '比肩': ['Networking', 'Team sports', 'Collaboration'],
  '劫财': ['Competitive activities', 'Negotiation', 'Bold decisions'],
  '食神': ['Creative work', 'Cooking', 'Teaching', 'Art'],
  '伤官': ['Innovation', 'Writing', 'Public speaking'],
  '偏财': ['Investing', 'Social events', 'New ventures'],
  '正财': ['Financial planning', 'Saving', 'Steady work'],
  '七杀': ['Strategic planning', 'Physical training', 'Leadership tasks'],
  '正官': ['Career advancement', 'Formal meetings', 'Recognition events'],
  '偏印': ['Study', 'Meditation', 'Research', 'Spiritual practice'],
  '正印': ['Learning', 'Mentoring', 'Family time', 'Self-care'],
};

const AVOID_ACTIVITIES: Record<string, string[]> = {
  '比肩': ['Going it alone', 'Ignoring allies'],
  '劫财': ['Lending money', 'Risky gambles', 'Overcommitting'],
  '食神': ['Overindulgence', 'Procrastination'],
  '伤官': ['Arguing with authority', 'Reckless words'],
  '偏财': ['Overspending', 'Impulsive purchases'],
  '正财': ['Taking shortcuts', 'Speculative risk'],
  '七杀': ['Unnecessary confrontation', 'Overexertion'],
  '正官': ['Breaking rules', 'Informal approaches'],
  '偏印': ['Social overload', 'Ignoring intuition'],
  '正印': ['Rushing decisions', 'Neglecting rest'],
};

// ==================== Main Calculator ====================

export function calculateDailyDestiny(
  natalChart: BaziResult,
  targetDate?: Date,
): DailyDestiny {
  const date = targetDate || new Date();
  const solar = Solar.fromYmd(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  // Today's stems and branches (流日/流月/流年)
  const dayGan = ec.getDayGan();
  const dayZhi = ec.getDayZhi();
  const monthGan = ec.getMonthGan();
  const monthZhi = ec.getMonthZhi();
  const yearGan = ec.getYearGan();
  const yearZhi = ec.getYearZhi();

  const dayGanZhi = `${dayGan}${dayZhi}`;
  const dayElement = STEM_ELEMENT[dayGan];

  // Ten God: today's stem vs. natal day master
  const dmStem = natalChart.dayMaster.stem;
  const tenGod = calculateTenGod(dmStem, dayGan);
  const tenGodEn = getTenGodEn(tenGod);

  // Determine favorability from the natal chart's favorable/unfavorable elements
  const todayElementEn = ELEMENTS_EN[dayElement];
  let favorability: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
  if (natalChart.favorableElements.includes(todayElementEn)) {
    favorability = 'favorable';
  } else if (natalChart.unfavorableElements.includes(todayElementEn)) {
    favorability = 'unfavorable';
  }

  // Ten God description
  const tenGodDescriptions: Record<string, Record<string, string>> = {
    favorable: {
      '比肩': 'A day of strong self-energy and peer support. Your confidence is amplified.',
      '劫财': 'Bold energy arrives. Competitive edge is sharp — channel it wisely.',
      '食神': 'Creative flow peaks. Express yourself freely — inspiration is abundant.',
      '伤官': 'Brilliant insights spark. Innovation and sharp communication are favored.',
      '偏财': 'Windfall energy. Social connections open doors to unexpected gain.',
      '正财': 'Steady accumulation day. Practical efforts yield tangible results.',
      '七杀': 'Powerful drive activates. Transform pressure into decisive action.',
      '正官': 'Authority and recognition energy. Career moves are well-supported.',
      '偏印': 'Deep wisdom surfaces. Spiritual and intellectual pursuits flourish.',
      '正印': 'Nurturing support surrounds you. Learning and self-care are blessed.',
    },
    unfavorable: {
      '比肩': 'Self-energy is drained by competition. Conserve rather than contend.',
      '劫财': 'Watch for resource drain. Avoid lending money or overcommitting.',
      '食神': 'Creative energy scatters. Resist overindulgence and stay focused.',
      '伤官': 'Sharp tongue risk. Words may wound — practice restraint in speech.',
      '偏财': 'Financial caution needed. Resist impulse spending and risky ventures.',
      '正财': 'Slow returns today. Patience over force in money matters.',
      '七杀': 'Heavy pressure looms. Protect your boundaries and avoid confrontation.',
      '正官': 'Authority friction. Stay compliant and avoid shortcuts.',
      '偏印': 'Overthinking tendency. Ground yourself in practical action.',
      '正印': 'Support feels distant. Self-reliance is your best strategy today.',
    },
    neutral: {
      '比肩': 'Balanced self-energy. A stable day for routine and reflection.',
      '劫财': 'Moderate competitive energy. Choose battles wisely.',
      '食神': 'Gentle creative current. Good for light artistic or culinary pursuits.',
      '伤官': 'Mental sharpness present but not overwhelming. Write, plan, analyze.',
      '偏财': 'Social energy flows. Good for networking but not major financial moves.',
      '正财': 'Practical energy. Handle everyday financial matters with care.',
      '七杀': 'Manageable pressure. Use it as motivation, not stress.',
      '正官': 'Career energy is neutral. Maintain discipline and steady progress.',
      '偏印': 'Intuition is quiet but present. Good for study and contemplation.',
      '正印': 'Gentle supportive energy. Good for learning and connection.',
    },
  };

  const description = tenGodDescriptions[favorability]?.[tenGod] ||
    `Today's ${tenGodEn} energy interacts with your Day Master.`;

  // Branch interactions between today's branch and natal chart
  const branchInteractions = findDailyBranchInteractions(dayZhi, natalChart);

  // Scores
  const scores = calculateScores(tenGod, favorability, branchInteractions, dayZhi, natalChart);

  // Lucky colors: based on favorable elements from natal chart
  const favorableElementsEn = natalChart.favorableElements.length > 0
    ? natalChart.favorableElements
    : [todayElementEn];
  const luckyColors = favorableElementsEn.flatMap(el => ELEMENT_COLORS[el] || []).slice(0, 3);

  // Lucky directions
  const luckyDirections = favorableElementsEn.flatMap(el => ELEMENT_DIRECTIONS[el] || []).slice(0, 3);

  // Lucky / Avoid activities
  const luckyActivities = LUCKY_ACTIVITIES[tenGod] || ['Stay centered and mindful'];
  const avoidActivities = AVOID_ACTIVITIES[tenGod] || ['Impulsive decisions'];

  // Nayin
  const dayNayin = NAYIN[dayGanZhi] || '';
  const dayNayinEn = NAYIN_EN[dayNayin] || '';

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return {
    date: dateStr,
    liuRi: {
      stem: dayGan,
      branch: dayZhi,
      ganZhi: dayGanZhi,
      element: FIVE_ELEMENTS[dayElement],
      elementEn: todayElementEn,
      nayin: dayNayin,
      nayinEn: dayNayinEn,
    },
    liuYue: {
      stem: monthGan,
      branch: monthZhi,
      ganZhi: `${monthGan}${monthZhi}`,
    },
    liuNian: {
      stem: yearGan,
      branch: yearZhi,
      ganZhi: `${yearGan}${yearZhi}`,
    },
    dayMasterRelation: {
      tenGod,
      tenGodEn,
      favorability,
      description,
    },
    branchInteractions,
    scores,
    luckyColors,
    luckyDirections,
    avoidActivities,
    luckyActivities,
  };
}

// ==================== Text Export ====================

export function dailyDestinyToText(daily: DailyDestiny, natalChart: BaziResult): string {
  const lines: string[] = [];
  lines.push(`=== Daily Destiny (每日运势) — ${daily.date} ===`);
  lines.push('');
  lines.push(`流日 (Day): ${daily.liuRi.ganZhi} — ${daily.liuRi.elementEn} — ${daily.liuRi.nayin} (${daily.liuRi.nayinEn})`);
  lines.push(`流月 (Month): ${daily.liuYue.ganZhi}`);
  lines.push(`流年 (Year): ${daily.liuNian.ganZhi}`);
  lines.push('');
  lines.push(`Your Day Master: ${natalChart.dayMaster.stem} (${natalChart.dayMaster.elementEn} ${natalChart.dayMaster.polarity})`);
  lines.push(`Today's Ten God relation: ${daily.dayMasterRelation.tenGod} (${daily.dayMasterRelation.tenGodEn}) — ${daily.dayMasterRelation.favorability}`);
  lines.push(`  ${daily.dayMasterRelation.description}`);
  lines.push('');
  lines.push('Scores:');
  lines.push(`  Overall: ${daily.scores.overall}/100`);
  lines.push(`  Career: ${daily.scores.career}/100`);
  lines.push(`  Relationships: ${daily.scores.relationships}/100`);
  lines.push(`  Health: ${daily.scores.health}/100`);
  lines.push(`  Wealth: ${daily.scores.wealth}/100`);

  if (daily.branchInteractions.length > 0) {
    lines.push('');
    lines.push('Branch Interactions with natal chart:');
    for (const bi of daily.branchInteractions) {
      lines.push(`  ${bi.type} — ${bi.branches} [with ${bi.withPillar} pillar] — ${bi.impact}`);
    }
  }

  lines.push('');
  lines.push(`Lucky Colors: ${daily.luckyColors.join(', ')}`);
  lines.push(`Lucky Directions: ${daily.luckyDirections.join(', ')}`);
  lines.push(`Lucky Activities: ${daily.luckyActivities.join(', ')}`);
  lines.push(`Avoid: ${daily.avoidActivities.join(', ')}`);

  lines.push('');
  lines.push(`Favorable elements: ${natalChart.favorableElements.join(', ')}`);
  if (natalChart.unfavorableElements.length > 0) {
    lines.push(`Challenging elements: ${natalChart.unfavorableElements.join(', ')}`);
  }

  return lines.join('\n');
}
