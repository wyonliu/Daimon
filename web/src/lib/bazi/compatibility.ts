/**
 * Daimon BaZi Compatibility Engine — Destiny Match (合盘/缘分配对)
 *
 * Precise mathematical compatibility analysis across two BaZi charts:
 * - Day Master element relationships & Ten God dynamics
 * - Cross-chart branch interactions (冲合刑害)
 * - Five Element complementarity scoring
 * - Multi-category relationship scoring
 */

import { BaziResult } from './calculator';
import {
  STEM_ELEMENT, STEM_POLARITY, BRANCH_ELEMENT,
  HEAVENLY_STEMS, ELEMENTS_EN, FIVE_ELEMENTS,
} from './constants';

// ==================== Types ====================

export interface CompatibilityResult {
  overallScore: number; // 0-100

  dayMasterRelation: {
    stemA: string;
    stemB: string;
    elementA: string;
    elementB: string;
    elementRelation: string; // e.g. 'Wood produces Fire'
    tenGodAtoB: string; // What B is to A (e.g. "Direct Wealth")
    tenGodBtoA: string; // What A is to B
    score: number;
    description: string;
  };

  branchInteractions: CrossBranchInteraction[];

  elementBalance: {
    score: number;
    aStrong: string[];
    aWeak: string[];
    bStrong: string[];
    bWeak: string[];
    complementary: string[];
    description: string;
  };

  categoryScores: {
    emotional: number;
    intellectual: number;
    physical: number;
    spiritual: number;
    practical: number;
  };

  strengths: string[];
  challenges: string[];
}

export interface CrossBranchInteraction {
  type: 'clash' | 'combination' | 'harm' | 'punishment';
  typeCn: string;
  branchA: string;
  pillarA: string;
  branchB: string;
  pillarB: string;
  description: string;
  impact: 'positive' | 'negative';
}

// ==================== Constants ====================

const PILLAR_LABELS = ['Year', 'Month', 'Day', 'Hour'] as const;

// Five Element cycle: Wood(0) -> Fire(1) -> Earth(2) -> Metal(3) -> Water(4) -> Wood(0)
// Production cycle: element produces (element + 1) % 5
// Control cycle: element controls (element + 2) % 5

const ELEMENT_RELATION_NAMES: Record<string, string> = {
  'same': 'share the same element',
  'produce': 'produces',
  'control': 'controls',
  'produced_by': 'is nourished by',
  'controlled_by': 'is challenged by',
};

// Cross-chart branch interaction lookups (bidirectional)
const SIX_CLASHES: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

const SIX_COMBINATIONS: [string, string][] = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

const SIX_HARMS: [string, string][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

// Three Punishments: stored as sets of branches that punish each other
const THREE_PUNISHMENTS: [string, string][] = [
  // 寅巳申 (mutual)
  ['寅', '巳'], ['巳', '申'], ['寅', '申'],
  // 丑戌未 (mutual)
  ['丑', '戌'], ['戌', '未'], ['丑', '未'],
  // 子卯 (rude punishment)
  ['子', '卯'],
];

// Ten God names in English
const TEN_GOD_NAMES: Record<number, string> = {
  0: 'Companion',        // 比肩
  1: 'Rob Wealth',       // 劫财
  2: 'Eating God',       // 食神
  3: 'Hurting Officer',  // 伤官
  4: 'Indirect Wealth',  // 偏财
  5: 'Direct Wealth',    // 正财
  6: 'Seven Killings',   // 七杀
  7: 'Direct Officer',   // 正官
  8: 'Indirect Resource', // 偏印
  9: 'Direct Resource',  // 正印
};

const TEN_GOD_NAMES_CN: Record<number, string> = {
  0: '比肩', 1: '劫财', 2: '食神', 3: '伤官',
  4: '偏财', 5: '正财', 6: '七杀', 7: '正官',
  8: '偏印', 9: '正印',
};

// ==================== Helper Functions ====================

function getStemIndex(stem: string): number {
  return (HEAVENLY_STEMS as readonly string[]).indexOf(stem);
}

function isSamePolarity(stemA: string, stemB: string): boolean {
  return STEM_POLARITY[stemA] === STEM_POLARITY[stemB];
}

/**
 * Get the element relationship between two elements.
 * Returns: 'same' | 'produce' | 'control' | 'produced_by' | 'controlled_by'
 */
function getElementRelation(elemA: number, elemB: number): string {
  if (elemA === elemB) return 'same';
  if ((elemA + 1) % 5 === elemB) return 'produce';      // A produces B
  if ((elemA + 2) % 5 === elemB) return 'control';       // A controls B
  if ((elemB + 1) % 5 === elemA) return 'produced_by';   // B produces A
  if ((elemB + 2) % 5 === elemA) return 'controlled_by'; // B controls A
  return 'same'; // Should not reach
}

/**
 * Calculate the Ten God relationship from stem A's perspective looking at stem B.
 * "What is B to A?"
 *
 * Logic:
 * - Same element, same polarity -> 比肩 (0)
 * - Same element, diff polarity -> 劫财 (1)
 * - A produces B, same polarity -> 食神 (2)
 * - A produces B, diff polarity -> 伤官 (3)
 * - A controls B, same polarity -> 偏财 (4)
 * - A controls B, diff polarity -> 正财 (5)
 * - B controls A, same polarity -> 七杀 (6)
 * - B controls A, diff polarity -> 正官 (7)
 * - B produces A, same polarity -> 偏印 (8)
 * - B produces A, diff polarity -> 正印 (9)
 */
function getTenGodIndex(stemA: string, stemB: string): number {
  const elemA = STEM_ELEMENT[stemA];
  const elemB = STEM_ELEMENT[stemB];
  const samePol = isSamePolarity(stemA, stemB);
  const rel = getElementRelation(elemA, elemB);

  switch (rel) {
    case 'same':
      return samePol ? 0 : 1;
    case 'produce':
      return samePol ? 2 : 3;
    case 'control':
      return samePol ? 4 : 5;
    case 'controlled_by':
      return samePol ? 6 : 7;
    case 'produced_by':
      return samePol ? 8 : 9;
    default:
      return 0;
  }
}

export function getTenGodBetween(stemA: string, stemB: string): { en: string; cn: string; index: number } {
  const idx = getTenGodIndex(stemA, stemB);
  return { en: TEN_GOD_NAMES[idx], cn: TEN_GOD_NAMES_CN[idx], index: idx };
}

function matchesPair(a: string, b: string, pair: [string, string]): boolean {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

// ==================== Cross-Chart Branch Interactions ====================

function findCrossBranchInteractions(baziA: BaziResult, baziB: BaziResult): CrossBranchInteraction[] {
  const interactions: CrossBranchInteraction[] = [];
  const pillarsA = [baziA.year, baziA.month, baziA.day, baziA.hour];
  const pillarsB = [baziB.year, baziB.month, baziB.day, baziB.hour];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const brA = pillarsA[i].branch;
      const brB = pillarsB[j].branch;
      const pA = PILLAR_LABELS[i];
      const pB = PILLAR_LABELS[j];

      // Six Clashes
      for (const pair of SIX_CLASHES) {
        if (matchesPair(brA, brB, pair)) {
          interactions.push({
            type: 'clash', typeCn: '冲',
            branchA: brA, pillarA: pA,
            branchB: brB, pillarB: pB,
            description: `${brA}${brB}冲 — ${pA} (A) clashes ${pB} (B). Tension and dynamic friction between these life areas.`,
            impact: 'negative',
          });
        }
      }

      // Six Combinations
      for (const pair of SIX_COMBINATIONS) {
        if (matchesPair(brA, brB, pair)) {
          interactions.push({
            type: 'combination', typeCn: '合',
            branchA: brA, pillarA: pA,
            branchB: brB, pillarB: pB,
            description: `${brA}${brB}合 — ${pA} (A) bonds with ${pB} (B). Natural harmony and mutual attraction between these life areas.`,
            impact: 'positive',
          });
        }
      }

      // Six Harms
      for (const pair of SIX_HARMS) {
        if (matchesPair(brA, brB, pair)) {
          interactions.push({
            type: 'harm', typeCn: '害',
            branchA: brA, pillarA: pA,
            branchB: brB, pillarB: pB,
            description: `${brA}${brB}害 — ${pA} (A) and ${pB} (B) create hidden friction. Subtle undermining energy.`,
            impact: 'negative',
          });
        }
      }

      // Three Punishments
      for (const pair of THREE_PUNISHMENTS) {
        if (matchesPair(brA, brB, pair)) {
          interactions.push({
            type: 'punishment', typeCn: '刑',
            branchA: brA, pillarA: pA,
            branchB: brB, pillarB: pB,
            description: `${brA}${brB}刑 — ${pA} (A) and ${pB} (B) form a punishment relationship. Tests and karmic lessons.`,
            impact: 'negative',
          });
        }
      }
    }
  }

  return interactions;
}

// ==================== Element Balance Analysis ====================

function analyzeElementBalance(baziA: BaziResult, baziB: BaziResult): CompatibilityResult['elementBalance'] {
  const THRESHOLD_STRONG = 25;
  const THRESHOLD_WEAK = 12;

  const aStrong: string[] = [];
  const aWeak: string[] = [];
  const bStrong: string[] = [];
  const bWeak: string[] = [];
  const complementary: string[] = [];

  for (let i = 0; i < 5; i++) {
    const aPct = baziA.fiveElements[i].percentage;
    const bPct = baziB.fiveElements[i].percentage;
    const elName = ELEMENTS_EN[i];

    if (aPct >= THRESHOLD_STRONG) aStrong.push(elName);
    if (aPct <= THRESHOLD_WEAK) aWeak.push(elName);
    if (bPct >= THRESHOLD_STRONG) bStrong.push(elName);
    if (bPct <= THRESHOLD_WEAK) bWeak.push(elName);

    // Complementary: one is strong where the other is weak
    if ((aPct >= THRESHOLD_STRONG && bPct <= THRESHOLD_WEAK) ||
        (bPct >= THRESHOLD_STRONG && aPct <= THRESHOLD_WEAK)) {
      complementary.push(elName);
    }
  }

  // Score: more complementary elements = higher score
  // Also reward balanced combined element distribution
  let score = 50;
  score += complementary.length * 10; // up to +50

  // Penalize if both are weak in same element (shared deficit)
  let sharedDeficit = 0;
  for (let i = 0; i < 5; i++) {
    if (baziA.fiveElements[i].percentage <= THRESHOLD_WEAK &&
        baziB.fiveElements[i].percentage <= THRESHOLD_WEAK) {
      sharedDeficit++;
    }
  }
  score -= sharedDeficit * 8;

  // Reward if combined elements are well-distributed
  let combinedVariance = 0;
  for (let i = 0; i < 5; i++) {
    const combined = (baziA.fiveElements[i].percentage + baziB.fiveElements[i].percentage) / 2;
    combinedVariance += Math.abs(combined - 20); // 20% is perfect balance
  }
  score -= Math.floor(combinedVariance / 5);

  score = Math.max(20, Math.min(95, score));

  let description: string;
  if (complementary.length >= 3) {
    description = `Exceptional elemental complementarity. You fill each other's gaps in ${complementary.join(', ')} — a rare and powerful balance.`;
  } else if (complementary.length >= 1) {
    description = `Good elemental synergy. You complement each other in ${complementary.join(', ')}, creating balance neither has alone.`;
  } else if (sharedDeficit >= 2) {
    description = `Similar elemental gaps. You share weaknesses in certain elements, which means you may amplify each other's challenges rather than balancing them.`;
  } else {
    description = `Your elemental distributions are similar. You understand each other's energy well, though external balance may need to come from environment and timing.`;
  }

  return { score, aStrong, aWeak, bStrong, bWeak, complementary, description };
}

// ==================== Day Master Relationship ====================

function analyzeDayMasterRelation(baziA: BaziResult, baziB: BaziResult): CompatibilityResult['dayMasterRelation'] {
  const stemA = baziA.dayMaster.stem;
  const stemB = baziB.dayMaster.stem;
  const elemA = STEM_ELEMENT[stemA];
  const elemB = STEM_ELEMENT[stemB];
  const rel = getElementRelation(elemA, elemB);

  const tenGodAtoB = getTenGodBetween(stemA, stemB); // What B is to A
  const tenGodBtoA = getTenGodBetween(stemB, stemA); // What A is to B

  const elementRelation = rel === 'same'
    ? `Both ${ELEMENTS_EN[elemA]} — ${ELEMENT_RELATION_NAMES[rel]}`
    : `${ELEMENTS_EN[elemA]} ${ELEMENT_RELATION_NAMES[rel]} ${ELEMENTS_EN[elemB]}`;

  // Score the Day Master relationship
  let score = 50;
  let description = '';

  // Highly favorable: Direct Wealth / Direct Officer (正财/正官) — classical match
  const favTenGods = [5, 7]; // Direct Wealth, Direct Officer
  const goodTenGods = [9, 2, 0]; // Direct Resource, Eating God, Companion
  const challengeTenGods = [6, 3]; // Seven Killings, Hurting Officer

  if (favTenGods.includes(tenGodAtoB.index) || favTenGods.includes(tenGodBtoA.index)) {
    score = 85 + Math.floor(Math.random() * 10); // 85-94
    description = `A classically auspicious match. The ${tenGodAtoB.cn} (${tenGodAtoB.en}) connection between your Day Masters creates natural attraction and complementary roles. This is the relationship dynamic traditional BaZi considers ideal for partnership.`;
  } else if (goodTenGods.includes(tenGodAtoB.index) && goodTenGods.includes(tenGodBtoA.index)) {
    score = 70 + Math.floor(Math.random() * 10); // 70-79
    description = `A harmonious connection. Your Day Masters relate through ${tenGodAtoB.cn} (${tenGodAtoB.en}) and ${tenGodBtoA.cn} (${tenGodBtoA.en}), suggesting mutual support and understanding.`;
  } else if (challengeTenGods.includes(tenGodAtoB.index) || challengeTenGods.includes(tenGodBtoA.index)) {
    score = 40 + Math.floor(Math.random() * 15); // 40-54
    description = `An intense dynamic. The ${tenGodAtoB.cn} (${tenGodAtoB.en}) and ${tenGodBtoA.cn} (${tenGodBtoA.en}) connection brings powerful energy that can be transformative or abrasive — depending on how you channel it.`;
  } else if (rel === 'same') {
    score = 55 + Math.floor(Math.random() * 10); // 55-64
    const samePol = isSamePolarity(stemA, stemB);
    description = samePol
      ? `You share the same element and polarity — a 比肩 (Companion) bond. You understand each other deeply, but may compete for the same space. Growth comes from learning to collaborate rather than mirror.`
      : `Same element but opposite polarity — a 劫财 (Rob Wealth) bond. You see the world similarly but approach it differently. This creates both kinship and subtle rivalry.`;
  } else if (rel === 'produce') {
    score = 65 + Math.floor(Math.random() * 10); // 65-74
    description = `${ELEMENTS_EN[elemA]} nourishes ${ELEMENTS_EN[elemB]}. Person A naturally supports and fuels Person B's growth. This is a giving dynamic — beautiful when reciprocated through other chart connections.`;
  } else if (rel === 'produced_by') {
    score = 65 + Math.floor(Math.random() * 10);
    description = `${ELEMENTS_EN[elemB]} nourishes ${ELEMENTS_EN[elemA]}. Person B naturally supports Person A's growth. A nurturing dynamic that works well when balanced by mutual respect.`;
  } else if (rel === 'control') {
    score = 45 + Math.floor(Math.random() * 10);
    description = `${ELEMENTS_EN[elemA]} challenges ${ELEMENTS_EN[elemB]}. There's a natural power dynamic here. When healthy, this creates discipline and growth. When imbalanced, it becomes domination.`;
  } else {
    score = 45 + Math.floor(Math.random() * 10);
    description = `${ELEMENTS_EN[elemB]} challenges ${ELEMENTS_EN[elemA]}. Person B holds natural authority over Person A. This can be grounding or constricting depending on how both charts handle pressure.`;
  }

  score = Math.max(20, Math.min(95, score));

  return {
    stemA, stemB,
    elementA: ELEMENTS_EN[elemA],
    elementB: ELEMENTS_EN[elemB],
    elementRelation,
    tenGodAtoB: `${tenGodAtoB.cn} (${tenGodAtoB.en})`,
    tenGodBtoA: `${tenGodBtoA.cn} (${tenGodBtoA.en})`,
    score,
    description,
  };
}

// ==================== Category Scoring ====================

function calculateCategoryScores(
  baziA: BaziResult,
  baziB: BaziResult,
  dayMasterRelation: CompatibilityResult['dayMasterRelation'],
  branchInteractions: CrossBranchInteraction[],
  elementBalance: CompatibilityResult['elementBalance'],
): CompatibilityResult['categoryScores'] {
  const stemA = baziA.dayMaster.stem;
  const stemB = baziB.dayMaster.stem;
  const tenGodAtoB = getTenGodBetween(stemA, stemB);
  const tenGodBtoA = getTenGodBetween(stemB, stemA);

  // ---- Emotional (Day Master harmony + 正财/正官 dynamics) ----
  let emotional = dayMasterRelation.score;
  // Boost for Direct Wealth or Direct Officer
  if ([5, 7].includes(tenGodAtoB.index) || [5, 7].includes(tenGodBtoA.index)) {
    emotional += 10;
  }
  // Boost for Day Branch combinations
  const dayBranchCombo = branchInteractions.some(
    bi => bi.type === 'combination' && bi.pillarA === 'Day' && bi.pillarB === 'Day'
  );
  if (dayBranchCombo) emotional += 12;
  const dayBranchClash = branchInteractions.some(
    bi => bi.type === 'clash' && bi.pillarA === 'Day' && bi.pillarB === 'Day'
  );
  if (dayBranchClash) emotional -= 10;
  emotional = Math.max(20, Math.min(95, emotional));

  // ---- Intellectual (食神/伤官 dynamics) ----
  let intellectual = 55;
  // Check if either sees the other as Eating God or Hurting Officer
  if ([2, 3].includes(tenGodAtoB.index) || [2, 3].includes(tenGodBtoA.index)) {
    intellectual += 15;
  }
  // Shared intellectual elements (Fire = insight, Water = depth, Metal = precision)
  const intellElements = [1, 3, 4]; // Fire, Metal, Water
  for (const ei of intellElements) {
    if (baziA.fiveElements[ei].percentage >= 20 && baziB.fiveElements[ei].percentage >= 20) {
      intellectual += 5;
    }
  }
  // Month pillar combination (career/social alignment)
  const monthCombo = branchInteractions.some(
    bi => bi.type === 'combination' && bi.pillarA === 'Month' && bi.pillarB === 'Month'
  );
  if (monthCombo) intellectual += 10;
  intellectual = Math.max(20, Math.min(95, intellectual));

  // ---- Physical (branch combinations vs clashes) ----
  let physical = 55;
  const combos = branchInteractions.filter(bi => bi.type === 'combination').length;
  const clashes = branchInteractions.filter(bi => bi.type === 'clash').length;
  const harms = branchInteractions.filter(bi => bi.type === 'harm').length;
  physical += combos * 6;
  physical -= clashes * 5;
  physical -= harms * 3;
  // Year branch interaction matters for physical/instinctive attraction
  const yearCombo = branchInteractions.some(
    bi => bi.type === 'combination' && bi.pillarA === 'Year' && bi.pillarB === 'Year'
  );
  if (yearCombo) physical += 8;
  physical = Math.max(20, Math.min(95, physical));

  // ---- Spiritual (偏印/华盖 dynamics + Water/Fire balance) ----
  let spiritual = 50;
  if ([8, 9].includes(tenGodAtoB.index) || [8, 9].includes(tenGodBtoA.index)) {
    spiritual += 12;
  }
  // Both have strong Water (depth)
  if (baziA.fiveElements[4].percentage >= 20 && baziB.fiveElements[4].percentage >= 20) {
    spiritual += 8;
  }
  // Check for shared 华盖-related elements (Earth branches: 辰戌丑未)
  const spiritualBranches = ['辰', '戌', '丑', '未'];
  const aHasSp = [baziA.year.branch, baziA.month.branch, baziA.day.branch, baziA.hour.branch]
    .some(b => spiritualBranches.includes(b));
  const bHasSp = [baziB.year.branch, baziB.month.branch, baziB.day.branch, baziB.hour.branch]
    .some(b => spiritualBranches.includes(b));
  if (aHasSp && bHasSp) spiritual += 6;
  spiritual += elementBalance.complementary.length * 3;
  spiritual = Math.max(20, Math.min(95, spiritual));

  // ---- Practical (偏财/食神 balance + Earth/Metal presence) ----
  let practical = 50;
  if ([4, 2].includes(tenGodAtoB.index) || [4, 2].includes(tenGodBtoA.index)) {
    practical += 10;
  }
  // Earth and Metal presence (practical elements)
  for (const ei of [2, 3]) { // Earth, Metal
    if (baziA.fiveElements[ei].percentage >= 15 && baziB.fiveElements[ei].percentage >= 15) {
      practical += 5;
    }
  }
  // Favorable element complementarity
  const aFav = new Set(baziA.favorableElements);
  const bFav = new Set(baziB.favorableElements);
  const aStrEn = baziA.dayMaster.elementEn;
  const bStrEn = baziB.dayMaster.elementEn;
  // If one person's strong element is the other's favorable, that's practical synergy
  if (bFav.has(aStrEn)) practical += 8;
  if (aFav.has(bStrEn)) practical += 8;
  practical = Math.max(20, Math.min(95, practical));

  return { emotional, intellectual, physical, spiritual, practical };
}

// ==================== Strengths & Challenges ====================

function generateInsights(
  baziA: BaziResult,
  baziB: BaziResult,
  dayMasterRelation: CompatibilityResult['dayMasterRelation'],
  branchInteractions: CrossBranchInteraction[],
  elementBalance: CompatibilityResult['elementBalance'],
  categoryScores: CompatibilityResult['categoryScores'],
): { strengths: string[]; challenges: string[] } {
  const strengths: string[] = [];
  const challenges: string[] = [];

  const stemA = baziA.dayMaster.stem;
  const stemB = baziB.dayMaster.stem;
  const tenGodAtoB = getTenGodBetween(stemA, stemB);
  const tenGodBtoA = getTenGodBetween(stemB, stemA);

  // Day Master relationship insights
  if ([5, 7].includes(tenGodAtoB.index) || [5, 7].includes(tenGodBtoA.index)) {
    strengths.push('Classical BaZi partnership alignment — your Day Masters form a naturally attractive and complementary bond.');
  }
  if ([0, 1].includes(tenGodAtoB.index)) {
    strengths.push('Same-element Day Masters create deep mutual understanding and shared worldview.');
  }
  if ([9].includes(tenGodAtoB.index) || [9].includes(tenGodBtoA.index)) {
    strengths.push('A nurturing 正印 (Direct Resource) connection — one naturally supports and elevates the other.');
  }

  // Branch interaction insights
  const combos = branchInteractions.filter(bi => bi.type === 'combination');
  const clashes = branchInteractions.filter(bi => bi.type === 'clash');
  const harms = branchInteractions.filter(bi => bi.type === 'harm');
  const punishments = branchInteractions.filter(bi => bi.type === 'punishment');

  if (combos.length >= 3) {
    strengths.push(`Exceptional cross-chart harmony with ${combos.length} branch combinations (合) — your energies naturally merge and amplify.`);
  } else if (combos.length >= 1) {
    const comboDesc = combos.map(c => `${c.branchA}${c.branchB}合`).join(', ');
    strengths.push(`Branch combinations (${comboDesc}) create natural bonding points in your relationship.`);
  }

  if (clashes.length >= 3) {
    challenges.push(`Multiple branch clashes (${clashes.length} 冲) create significant tension. This relationship demands active conflict resolution and patience.`);
  } else if (clashes.length >= 1) {
    const clashDesc = clashes.map(c => `${c.branchA}${c.branchB}冲`).join(', ');
    challenges.push(`Branch clashes (${clashDesc}) bring dynamic tension that needs conscious navigation.`);
  }

  if (harms.length >= 2) {
    challenges.push('Multiple 害 (Harm) interactions suggest hidden resentments may build — open communication is essential.');
  }

  if (punishments.length >= 1) {
    challenges.push('刑 (Punishment) interactions indicate karmic lessons in this relationship — growth through challenge.');
  }

  // Element balance insights
  if (elementBalance.complementary.length >= 3) {
    strengths.push(`Outstanding elemental complementarity in ${elementBalance.complementary.join(', ')} — you balance each other's energy naturally.`);
  } else if (elementBalance.complementary.length >= 1) {
    strengths.push(`You complement each other in ${elementBalance.complementary.join(', ')} energy, filling gaps in each other's charts.`);
  }

  if (elementBalance.aWeak.some(e => elementBalance.bWeak.includes(e))) {
    const shared = elementBalance.aWeak.filter(e => elementBalance.bWeak.includes(e));
    challenges.push(`Both charts are weak in ${shared.join(', ')} — seek this energy from environment and timing rather than each other.`);
  }

  // Category-specific insights
  if (categoryScores.emotional >= 75) {
    strengths.push('Strong emotional resonance — you feel deeply understood by each other.');
  }
  if (categoryScores.intellectual >= 75) {
    strengths.push('Excellent intellectual compatibility — stimulating conversations and shared curiosity.');
  }
  if (categoryScores.emotional <= 40) {
    challenges.push('Emotional wavelengths may differ significantly — patience and intentional empathy are needed.');
  }
  if (categoryScores.practical <= 40) {
    challenges.push('Practical matters (finance, daily routines, life goals) may require extra alignment effort.');
  }

  // Seven Killings or Hurting Officer dynamic
  if ([6].includes(tenGodAtoB.index) || [6].includes(tenGodBtoA.index)) {
    challenges.push('七杀 (Seven Killings) dynamic creates intensity and power struggles — transformative when managed, destructive when not.');
  }
  if ([3].includes(tenGodAtoB.index) || [3].includes(tenGodBtoA.index)) {
    challenges.push('伤官 (Hurting Officer) dynamic brings sharp, incisive energy — brilliant conversations but also cutting words.');
  }

  // Ensure at least one of each
  if (strengths.length === 0) {
    strengths.push('Your charts together create a unique dynamic that defies simple categorization — the complexity itself is a source of growth.');
  }
  if (challenges.length === 0) {
    challenges.push('While harmonious on the surface, all relationships need conscious effort to maintain depth and avoid complacency.');
  }

  return { strengths: strengths.slice(0, 5), challenges: challenges.slice(0, 5) };
}

// ==================== Main Calculator ====================

export function calculateCompatibility(baziA: BaziResult, baziB: BaziResult): CompatibilityResult {
  // 1. Day Master relationship
  const dayMasterRelation = analyzeDayMasterRelation(baziA, baziB);

  // 2. Cross-chart branch interactions
  const branchInteractions = findCrossBranchInteractions(baziA, baziB);

  // 3. Element balance
  const elementBalance = analyzeElementBalance(baziA, baziB);

  // 4. Category scores
  const categoryScores = calculateCategoryScores(
    baziA, baziB, dayMasterRelation, branchInteractions, elementBalance
  );

  // 5. Overall score (weighted average)
  const overallScore = Math.round(
    dayMasterRelation.score * 0.25 +
    elementBalance.score * 0.15 +
    categoryScores.emotional * 0.25 +
    categoryScores.intellectual * 0.10 +
    categoryScores.physical * 0.10 +
    categoryScores.spiritual * 0.05 +
    categoryScores.practical * 0.10
  );

  // 6. Strengths & Challenges
  const { strengths, challenges } = generateInsights(
    baziA, baziB, dayMasterRelation, branchInteractions, elementBalance, categoryScores
  );

  return {
    overallScore: Math.max(20, Math.min(95, overallScore)),
    dayMasterRelation,
    branchInteractions,
    elementBalance,
    categoryScores,
    strengths,
    challenges,
  };
}

// ==================== Text Export ====================

export function compatibilityToText(result: CompatibilityResult, nameA: string, nameB: string): string {
  const lines: string[] = [];
  lines.push(`=== Destiny Match Compatibility Analysis (合盘分析) ===`);
  lines.push(`${nameA} × ${nameB}`);
  lines.push(`Overall Compatibility Score: ${result.overallScore}/100`);
  lines.push('');

  lines.push('Day Master Relationship (日主关系):');
  lines.push(`  ${nameA}: ${result.dayMasterRelation.stemA} (${result.dayMasterRelation.elementA})`);
  lines.push(`  ${nameB}: ${result.dayMasterRelation.stemB} (${result.dayMasterRelation.elementB})`);
  lines.push(`  Element Relation: ${result.dayMasterRelation.elementRelation}`);
  lines.push(`  ${nameB} is to ${nameA}: ${result.dayMasterRelation.tenGodAtoB}`);
  lines.push(`  ${nameA} is to ${nameB}: ${result.dayMasterRelation.tenGodBtoA}`);
  lines.push(`  Score: ${result.dayMasterRelation.score}/100`);
  lines.push(`  ${result.dayMasterRelation.description}`);
  lines.push('');

  if (result.branchInteractions.length > 0) {
    lines.push('Cross-Chart Branch Interactions (交叉地支关系):');
    for (const bi of result.branchInteractions) {
      lines.push(`  ${bi.typeCn} (${bi.type}): ${bi.branchA}[${bi.pillarA}·A] — ${bi.branchB}[${bi.pillarB}·B] (${bi.impact})`);
      lines.push(`    ${bi.description}`);
    }
    lines.push('');
  }

  lines.push('Element Balance (五行互补):');
  lines.push(`  Score: ${result.elementBalance.score}/100`);
  lines.push(`  ${nameA} strong: ${result.elementBalance.aStrong.join(', ') || 'balanced'}`);
  lines.push(`  ${nameA} weak: ${result.elementBalance.aWeak.join(', ') || 'balanced'}`);
  lines.push(`  ${nameB} strong: ${result.elementBalance.bStrong.join(', ') || 'balanced'}`);
  lines.push(`  ${nameB} weak: ${result.elementBalance.bWeak.join(', ') || 'balanced'}`);
  lines.push(`  Complementary: ${result.elementBalance.complementary.join(', ') || 'none'}`);
  lines.push(`  ${result.elementBalance.description}`);
  lines.push('');

  lines.push('Category Scores (分项得分):');
  lines.push(`  Emotional: ${result.categoryScores.emotional}/100`);
  lines.push(`  Intellectual: ${result.categoryScores.intellectual}/100`);
  lines.push(`  Physical: ${result.categoryScores.physical}/100`);
  lines.push(`  Spiritual: ${result.categoryScores.spiritual}/100`);
  lines.push(`  Practical: ${result.categoryScores.practical}/100`);
  lines.push('');

  lines.push('Strengths (优势):');
  for (const s of result.strengths) {
    lines.push(`  • ${s}`);
  }
  lines.push('');

  lines.push('Challenges (挑战):');
  for (const c of result.challenges) {
    lines.push(`  • ${c}`);
  }

  return lines.join('\n');
}
