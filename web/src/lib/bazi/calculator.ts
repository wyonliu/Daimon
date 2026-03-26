/**
 * Daimon BaZi Engine — Powered by lunar-javascript for astronomical precision
 * Provides Four Pillars, Ten Gods, Five Elements, DaYun (Luck Pillars), LiuNian (Annual Fortune)
 */

// @ts-expect-error - lunar-javascript doesn't have type declarations
import { Solar } from 'lunar-javascript';

import {
  FIVE_ELEMENTS, ELEMENTS_EN, ELEMENTS_COLOR, ELEMENTS_EMOJI,
  STEM_ELEMENT, STEM_POLARITY, BRANCH_ELEMENT, BRANCH_HIDDEN_STEMS,
  HEAVENLY_STEMS, EARTHLY_BRANCHES,
  STEMS_PINYIN, BRANCHES_PINYIN, STEMS_EN,
  BRANCHES_ANIMAL, BRANCHES_ANIMAL_CN,
  TEN_GODS_EN, TEN_GODS_MEANING,
  NAYIN_EN,
} from './constants';

import {
  analyzeShenSha, analyzeKongWang, analyzeChartPattern,
  ShenSha, KongWang, ChartPattern,
} from './shensha';

// ==================== Types ====================

export interface Pillar {
  stem: string;
  branch: string;
  stemPinyin: string;
  branchPinyin: string;
  stemElement: string;
  stemElementEn: string;
  branchElement: string;
  branchElementEn: string;
  stemPolarity: 'yang' | 'yin';
  animal: string;
  animalCn: string;
  nayin: string;
  nayinEn: string;
  hiddenStems: string[];
  tenGod: string;
  tenGodEn: string;
  tenGodMeaning: string;
  tenGodZhi: string[];   // Ten Gods for hidden stems in branch
}

export interface ElementCount {
  element: string;
  elementEn: string;
  color: string;
  emoji: string;
  count: number;
  percentage: number;
}

export interface DaYunPillar {
  ganZhi: string;
  stem: string;
  branch: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  element: string;
  elementEn: string;
  isCurrent: boolean;
}

export interface LiuNianInfo {
  year: number;
  ganZhi: string;
  age: number;
  isCurrent: boolean;
}

export interface BaziResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: {
    stem: string;
    element: string;
    elementEn: string;
    polarity: 'yang' | 'yin';
    description: string;
  };
  fiveElements: ElementCount[];
  dayMasterStrength: 'strong' | 'weak' | 'balanced';
  strengthAnalysis: string;
  favorableElements: string[];
  unfavorableElements: string[];
  daYun: DaYunPillar[];
  currentDaYun: DaYunPillar | null;
  liuNian: LiuNianInfo[];
  birthInfo: {
    solar: string;
    lunar: string;
    lunarCn: string;
    animal: string;
    animalCn: string;
  };
  branchInteractions: BranchInteraction[];
  shenSha: ShenSha[];
  kongWang: KongWang;
  chartPattern: ChartPattern;
}

export interface BranchInteraction {
  type: 'clash' | 'combination' | 'harm' | 'punishment';
  typeCn: string;
  branches: string[];
  pillars: string[];
  description: string;
}

// ==================== Day Master Descriptions ====================

const DAY_MASTER_DESC: Record<string, string> = {
  '甲': 'Yang Wood (甲木) — The towering tree. A natural leader with unwavering principles. Growth-oriented, resilient, standing tall through any storm. Direct, honest, and ambitious. Needs space to grow and resists being controlled.',
  '乙': 'Yin Wood (乙木) — The vine and flower. Flexible, adaptive, graceful under pressure. Finds a way around obstacles rather than through them. Socially intelligent, charming, and surprisingly resilient. Thrives through connection.',
  '丙': 'Yang Fire (丙火) — The blazing sun. Warm, radiant, impossible to ignore. Illuminates everything with passion and generosity. A natural performer and inspirer. Can burn too bright — needs to learn restraint without dimming the light.',
  '丁': 'Yin Fire (丁火) — The candle flame. Focused, insightful, deeply perceptive. Sees what others miss. Holds steady in darkness. Spiritual and introspective, with a quiet intensity that draws people in.',
  '戊': 'Yang Earth (戊土) — The mountain. Stable, dependable, immovable in convictions. The foundation others build upon. Trustworthy and patient, but can be stubborn. Commands respect through sheer presence.',
  '己': 'Yin Earth (己土) — The fertile soil. Nurturing, adaptable, endlessly productive. Transforms everything into something that grows. Empathetic and grounded, with hidden depths of wisdom.',
  '庚': 'Yang Metal (庚金) — The sword and axe. Decisive, principled, fierce in convictions. Cuts through confusion to find truth. Values justice and loyalty above all. Strong but can wound without meaning to.',
  '辛': 'Yin Metal (辛金) — The jewel and fine blade. Refined, precise, quietly brilliant. An uncompromising standard for beauty and truth. Sensitive beneath the polished exterior. Easily wounded but never shows it.',
  '壬': 'Yang Water (壬水) — The ocean and great river. Vast, powerful, deeply philosophical. Contains multitudes and flows around any barrier. Visionary and unconventional, with a mind that never stops moving.',
  '癸': 'Yin Water (癸水) — The rain, dew, and mist. Intuitive, gentle, persistently nurturing. Nourishes growth wherever it falls. Deeply empathic and spiritually attuned. Quiet power that shapes landscapes over time.',
};

// ==================== Branch Interactions ====================

const BRANCH_CLASHES: Record<string, string> = {
  '子午': '子午冲', '午子': '子午冲',
  '丑未': '丑未冲', '未丑': '丑未冲',
  '寅申': '寅申冲', '申寅': '寅申冲',
  '卯酉': '卯酉冲', '酉卯': '卯酉冲',
  '辰戌': '辰戌冲', '戌辰': '辰戌冲',
  '巳亥': '巳亥冲', '亥巳': '巳亥冲',
};

const BRANCH_COMBOS: Record<string, string> = {
  '子丑': '子丑合化土', '丑子': '子丑合化土',
  '寅亥': '寅亥合化木', '亥寅': '寅亥合化木',
  '卯戌': '卯戌合化火', '戌卯': '卯戌合化火',
  '辰酉': '辰酉合化金', '酉辰': '辰酉合化金',
  '巳申': '巳申合化水', '申巳': '巳申合化水',
  '午未': '午未合化土', '未午': '午未合化土',
};

const BRANCH_HARMS: Record<string, string> = {
  '子未': '子未害', '未子': '子未害',
  '丑午': '丑午害', '午丑': '丑午害',
  '寅巳': '寅巳害', '巳寅': '寅巳害',
  '卯辰': '卯辰害', '辰卯': '卯辰害',
  '申亥': '申亥害', '亥申': '申亥害',
  '酉戌': '酉戌害', '戌酉': '酉戌害',
};

function findBranchInteractions(pillars: { branch: string; label: string }[]): BranchInteraction[] {
  const interactions: BranchInteraction[] = [];
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const key = pillars[i].branch + pillars[j].branch;
      if (BRANCH_CLASHES[key]) {
        interactions.push({
          type: 'clash', typeCn: '冲',
          branches: [pillars[i].branch, pillars[j].branch],
          pillars: [pillars[i].label, pillars[j].label],
          description: `${BRANCH_CLASHES[key]} — Tension and conflict between ${pillars[i].label} and ${pillars[j].label} pillars. A dynamic force that demands resolution.`,
        });
      }
      if (BRANCH_COMBOS[key]) {
        interactions.push({
          type: 'combination', typeCn: '合',
          branches: [pillars[i].branch, pillars[j].branch],
          pillars: [pillars[i].label, pillars[j].label],
          description: `${BRANCH_COMBOS[key]} — Harmony and attraction between ${pillars[i].label} and ${pillars[j].label} pillars. Energies merge and transform.`,
        });
      }
      if (BRANCH_HARMS[key]) {
        interactions.push({
          type: 'harm', typeCn: '害',
          branches: [pillars[i].branch, pillars[j].branch],
          pillars: [pillars[i].label, pillars[j].label],
          description: `${BRANCH_HARMS[key]} — Hidden friction between ${pillars[i].label} and ${pillars[j].label} pillars. Subtle undermining energy.`,
        });
      }
    }
  }
  return interactions;
}

// ==================== Helper Functions ====================

function getStemIdx(stem: string): number { return (HEAVENLY_STEMS as readonly string[]).indexOf(stem); }
function getBranchIdx(branch: string): number { return (EARTHLY_BRANCHES as readonly string[]).indexOf(branch); }

function getTenGodEn(cnName: string): string {
  const cnToEn: Record<string, string> = {
    '比肩': 'Companion', '劫财': 'Rob Wealth', '食神': 'Eating God', '伤官': 'Hurting Officer',
    '偏财': 'Indirect Wealth', '正财': 'Direct Wealth', '七杀': 'Seven Killings', '正官': 'Direct Officer',
    '偏印': 'Indirect Resource', '正印': 'Direct Resource',
  };
  return cnToEn[cnName] || cnName;
}

function buildPillar(
  stem: string, branch: string, nayin: string,
  tenGodGan: string, tenGodZhi: string[],
  hiddenStems: string[]
): Pillar {
  const si = getStemIdx(stem);
  const bi = getBranchIdx(branch);
  return {
    stem, branch,
    stemPinyin: STEMS_PINYIN[si] || '',
    branchPinyin: BRANCHES_PINYIN[bi] || '',
    stemElement: FIVE_ELEMENTS[STEM_ELEMENT[stem]] || '',
    stemElementEn: ELEMENTS_EN[STEM_ELEMENT[stem]] || '',
    branchElement: FIVE_ELEMENTS[BRANCH_ELEMENT[branch]] || '',
    branchElementEn: ELEMENTS_EN[BRANCH_ELEMENT[branch]] || '',
    stemPolarity: STEM_POLARITY[stem] || 'yang',
    animal: BRANCHES_ANIMAL[bi] || '',
    animalCn: BRANCHES_ANIMAL_CN[bi] || '',
    nayin,
    nayinEn: NAYIN_EN[nayin] || '',
    hiddenStems,
    tenGod: tenGodGan,
    tenGodEn: getTenGodEn(tenGodGan),
    tenGodMeaning: TEN_GODS_MEANING[tenGodGan] || '',
    tenGodZhi: tenGodZhi.map(t => getTenGodEn(t)),
  };
}

// Five Elements counting
function calculateElements(pillars: Pillar[]): ElementCount[] {
  const counts = [0, 0, 0, 0, 0];
  for (const p of pillars) {
    counts[STEM_ELEMENT[p.stem]] += 2;
    counts[BRANCH_ELEMENT[p.branch]] += 1.5;
    for (let i = 0; i < p.hiddenStems.length; i++) {
      counts[STEM_ELEMENT[p.hiddenStems[i]]] += (i === 0 ? 1 : 0.5);
    }
  }
  const total = counts.reduce((a, b) => a + b, 0);
  return counts.map((count, i) => ({
    element: FIVE_ELEMENTS[i],
    elementEn: ELEMENTS_EN[i],
    color: ELEMENTS_COLOR[i],
    emoji: ELEMENTS_EMOJI[i],
    count: Math.round(count * 10) / 10,
    percentage: Math.round((count / total) * 100),
  }));
}

function analyzeDayMasterStrength(dayElement: number, elements: ElementCount[]) {
  const selfPct = elements[dayElement].percentage;
  const producerPct = elements[((dayElement - 1) + 5) % 5].percentage;
  const support = selfPct + producerPct;

  let strength: 'strong' | 'weak' | 'balanced';
  let analysis: string;
  let favorable: string[];
  let unfavorable: string[];
  const el = ELEMENTS_EN[dayElement];

  if (support >= 50) {
    strength = 'strong';
    const drain = ELEMENTS_EN[(dayElement + 1) % 5];
    const control = ELEMENTS_EN[(dayElement + 2) % 5];
    favorable = [drain, control];
    unfavorable = [el, ELEMENTS_EN[((dayElement - 1) + 5) % 5]];
    analysis = `Your Day Master ${el} is strong (${support}% support from ${el} and ${ELEMENTS_EN[((dayElement - 1) + 5) % 5]}). A strong chart benefits from expression (${drain}) and discipline (${control}).`;
  } else if (support <= 30) {
    strength = 'weak';
    favorable = [el, ELEMENTS_EN[((dayElement - 1) + 5) % 5]];
    unfavorable = [ELEMENTS_EN[(dayElement + 1) % 5], ELEMENTS_EN[(dayElement + 2) % 5]];
    analysis = `Your Day Master ${el} is weak (${support}% support). Needs strengthening through ${el} and ${ELEMENTS_EN[((dayElement - 1) + 5) % 5]} energy.`;
  } else {
    strength = 'balanced';
    favorable = [el];
    unfavorable = [];
    analysis = `Your Day Master ${el} is balanced (${support}% support). A versatile chart — you adapt well to different circumstances.`;
  }
  return { strength, analysis, favorable, unfavorable };
}

// ==================== Main Calculator ====================

export function calculateBazi(
  year: number, month: number, day: number,
  hour: number = 12, gender: 'male' | 'female' = 'male'
): BaziResult {
  // Use lunar-javascript for precision calculation
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  // Use sect=1: 子时换日 (mainstream convention — 23:00 starts next day's pillar)
  // This ensures day stem and hour stem are internally consistent
  ec.setSect(1);

  // Extract four pillars from library
  const yearStem = ec.getYearGan();
  const yearBranch = ec.getYearZhi();
  const monthStem = ec.getMonthGan();
  const monthBranch = ec.getMonthZhi();
  const dayStem = ec.getDayGan();
  const dayBranch = ec.getDayZhi();
  const hourStem = ec.getTimeGan();
  const hourBranch = ec.getTimeZhi();

  // Build pillar objects
  const yearPillar = buildPillar(
    yearStem, yearBranch, ec.getYearNaYin(),
    ec.getYearShiShenGan(), ec.getYearShiShenZhi(),
    ec.getYearHideGan()
  );
  const monthPillar = buildPillar(
    monthStem, monthBranch, ec.getMonthNaYin(),
    ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(),
    ec.getMonthHideGan()
  );
  const dayPillar = buildPillar(
    dayStem, dayBranch, ec.getDayNaYin(),
    '日主', ec.getDayShiShenZhi(),
    ec.getDayHideGan()
  );
  dayPillar.tenGodEn = 'Day Master';
  dayPillar.tenGodMeaning = 'The core of your destiny — who you fundamentally are';

  const hourPillar = buildPillar(
    hourStem, hourBranch, ec.getTimeNaYin(),
    ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(),
    ec.getTimeHideGan()
  );

  // Five Elements
  const fiveElements = calculateElements([yearPillar, monthPillar, dayPillar, hourPillar]);
  const dayElementIdx = STEM_ELEMENT[dayStem];
  const { strength, analysis, favorable, unfavorable } = analyzeDayMasterStrength(dayElementIdx, fiveElements);

  // 大运 (Luck Pillars)
  const genderNum = gender === 'male' ? 1 : 0;
  const yun = ec.getYun(genderNum);
  const rawDaYun = yun.getDaYun();
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - year;

  const daYun: DaYunPillar[] = rawDaYun.slice(0, 9).map((d: any) => {
    const gz = d.getGanZhi();
    const stem = gz ? gz[0] : '';
    const branch = gz && gz.length > 1 ? gz[1] : '';
    const startAge = d.getStartAge();
    const endAge = d.getEndAge();
    return {
      ganZhi: gz || '',
      stem, branch,
      startAge, endAge,
      startYear: d.getStartYear(),
      endYear: d.getEndYear(),
      element: stem ? (FIVE_ELEMENTS[STEM_ELEMENT[stem]] || '') : '',
      elementEn: stem ? (ELEMENTS_EN[STEM_ELEMENT[stem]] || '') : '',
      isCurrent: currentAge >= startAge && currentAge <= endAge,
    };
  });

  const currentDaYun = daYun.find(d => d.isCurrent) || null;

  // 流年 (Annual Fortune) - current decade
  let liuNian: LiuNianInfo[] = [];
  if (currentDaYun) {
    const cdIdx = rawDaYun.findIndex((d: any) => d.getStartAge() === currentDaYun.startAge);
    if (cdIdx >= 0) {
      const rawLN = rawDaYun[cdIdx].getLiuNian();
      liuNian = rawLN.map((ln: any) => ({
        year: ln.getYear(),
        ganZhi: ln.getGanZhi(),
        age: ln.getAge(),
        isCurrent: ln.getYear() === currentYear,
      }));
    }
  }

  // Branch interactions (冲合害)
  const pillarsForInteraction = [
    { branch: yearBranch, label: 'Year' },
    { branch: monthBranch, label: 'Month' },
    { branch: dayBranch, label: 'Day' },
    { branch: hourBranch, label: 'Hour' },
  ];
  const branchInteractions = findBranchInteractions(pillarsForInteraction);

  // ShenSha, KongWang, ChartPattern
  const allStems = [yearStem, monthStem, dayStem, hourStem];
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const shenSha = analyzeShenSha(dayStem, yearBranch, monthBranch, dayBranch, hourBranch, allStems, allBranches);
  const kongWang = analyzeKongWang(dayStem, dayBranch, yearBranch, monthBranch, hourBranch);

  // Chart Pattern: use month hidden stem's primary ten god and month stem's ten god
  const monthHiddenTenGods = ec.getMonthShiShenZhi();
  const monthPrimaryTenGod = monthHiddenTenGods.length > 0 ? monthHiddenTenGods[0] : '';
  const monthStemTenGod = ec.getMonthShiShenGan();
  const chartPattern = analyzeChartPattern(monthPrimaryTenGod, monthStemTenGod, dayStem, monthBranch);

  // Lunar info
  const lunarStr = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster: {
      stem: dayStem,
      element: FIVE_ELEMENTS[dayElementIdx],
      elementEn: ELEMENTS_EN[dayElementIdx],
      polarity: STEM_POLARITY[dayStem],
      description: DAY_MASTER_DESC[dayStem] || '',
    },
    fiveElements,
    dayMasterStrength: strength,
    strengthAnalysis: analysis,
    favorableElements: favorable,
    unfavorableElements: unfavorable,
    daYun,
    currentDaYun,
    liuNian,
    birthInfo: {
      solar: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      lunar: lunarStr,
      lunarCn: lunarStr,
      animal: yearPillar.animal,
      animalCn: yearPillar.animalCn,
    },
    branchInteractions,
    shenSha,
    kongWang,
    chartPattern,
  };
}

// ==================== Text Export ====================

export function baziToText(result: BaziResult): string {
  const lines: string[] = [];
  lines.push(`=== BaZi Four Pillars of Destiny (八字命盘) ===`);
  lines.push(`Solar: ${result.birthInfo.solar} | Lunar: ${result.birthInfo.lunarCn}`);
  lines.push('');

  const fmt = (label: string, p: Pillar) =>
    `  ${label}: ${p.stem}${p.branch} (${p.stemPinyin} ${p.branchPinyin}) — ${p.stemElementEn} ${p.stemPolarity} — ${p.nayin} (${p.nayinEn}) — ${p.tenGod} (${p.tenGodEn})`;

  lines.push('Four Pillars (四柱):');
  lines.push(fmt('Year  (年柱)', result.year) + ` — ${result.year.animalCn} ${result.year.animal} Year`);
  lines.push(fmt('Month (月柱)', result.month));
  lines.push(fmt('Day   (日柱)', result.day));
  lines.push(fmt('Hour  (时柱)', result.hour));

  lines.push('');
  lines.push(`Day Master (日主): ${result.dayMaster.stem} — ${result.dayMaster.elementEn} ${result.dayMaster.polarity}`);
  lines.push(`  ${result.dayMaster.description}`);

  lines.push('');
  lines.push('Hidden Stems (藏干):');
  lines.push(`  Year: ${result.year.hiddenStems.join(', ')} → ${result.year.tenGodZhi.join(', ')}`);
  lines.push(`  Month: ${result.month.hiddenStems.join(', ')} → ${result.month.tenGodZhi.join(', ')}`);
  lines.push(`  Day: ${result.day.hiddenStems.join(', ')} → ${result.day.tenGodZhi.join(', ')}`);
  lines.push(`  Hour: ${result.hour.hiddenStems.join(', ')} → ${result.hour.tenGodZhi.join(', ')}`);

  lines.push('');
  lines.push('Five Elements (五行):');
  for (const e of result.fiveElements) {
    lines.push(`  ${e.emoji} ${e.elementEn} (${e.element}): ${e.percentage}%`);
  }

  lines.push('');
  lines.push(`Day Master Strength: ${result.dayMasterStrength}`);
  lines.push(`  ${result.strengthAnalysis}`);
  lines.push(`  Favorable (喜用): ${result.favorableElements.join(', ')}`);
  if (result.unfavorableElements.length > 0) {
    lines.push(`  Challenging (忌): ${result.unfavorableElements.join(', ')}`);
  }

  if (result.branchInteractions.length > 0) {
    lines.push('');
    lines.push('Branch Interactions (地支关系):');
    for (const bi of result.branchInteractions) {
      lines.push(`  ${bi.typeCn} (${bi.type}): ${bi.branches.join('–')} [${bi.pillars.join('–')}] — ${bi.description}`);
    }
  }

  if (result.daYun.length > 0) {
    lines.push('');
    lines.push('Luck Pillars (大运):');
    for (const d of result.daYun) {
      if (!d.ganZhi) continue;
      const mark = d.isCurrent ? ' ← CURRENT' : '';
      lines.push(`  ${d.ganZhi} (${d.elementEn}) age ${d.startAge}-${d.endAge} (${d.startYear}-${d.endYear})${mark}`);
    }
  }

  if (result.liuNian.length > 0) {
    lines.push('');
    lines.push('Annual Fortune (流年) for current luck period:');
    for (const ln of result.liuNian) {
      const mark = ln.isCurrent ? ' ← THIS YEAR' : '';
      lines.push(`  ${ln.year} ${ln.ganZhi} (age ${ln.age})${mark}`);
    }
  }

  // Chart Pattern
  lines.push('');
  lines.push(`Chart Pattern (格局): ${result.chartPattern.name} (${result.chartPattern.nameEn})`);
  lines.push(`  ${result.chartPattern.description}`);

  // ShenSha
  if (result.shenSha.length > 0) {
    lines.push('');
    lines.push('Special Stars (神煞):');
    for (const s of result.shenSha) {
      const pillarInfo = s.pillar ? ` [${s.pillar}]` : '';
      lines.push(`  ${s.name} (${s.nameEn} / ${s.pinyin})${pillarInfo} — ${s.type}`);
      lines.push(`    ${s.description}`);
    }
  }

  // KongWang
  lines.push('');
  lines.push(`Void Branches (空亡): ${result.kongWang.branches.join(', ')}`);
  if (result.kongWang.affectedPillars.length > 0) {
    lines.push(`  Affected pillars: ${result.kongWang.affectedPillars.join(', ')}`);
  } else {
    lines.push('  No pillars affected by void.');
  }

  return lines.join('\n');
}
