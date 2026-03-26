/**
 * Daimon Precision Proof — Verification data generator
 *
 * Generates step-by-step calculation audit trail and LLM failure point comparisons.
 * This is the TRUST BUILDER that justifies Daimon over free ChatGPT/DeepSeek.
 */

import { BaziResult } from './calculator';
import { BRANCH_HIDDEN_STEMS } from './constants';

export interface VerificationData {
  calculationSteps: {
    step: string;
    label: string;
    input: string;
    output: string;
    explanation: string;
  }[];

  llmFailPoints: {
    category: string;
    whatLLMsGetWrong: string;
    correctMethod: string;
    ourResult: string;
    typicalLLMError: string;
    icon: string;
  }[];

  engineInfo: {
    engine: string;
    version: string;
    method: string;
    features: string[];
  };
}

/**
 * Determine which solar term (节气) governs the given month branch.
 */
function getMonthSolarTerm(monthBranch: string): string {
  const solarTermMap: Record<string, string> = {
    '寅': '立春 (Start of Spring, ~Feb 4)',
    '卯': '惊蛰 (Awakening of Insects, ~Mar 6)',
    '辰': '清明 (Clear and Bright, ~Apr 5)',
    '巳': '立夏 (Start of Summer, ~May 6)',
    '午': '芒种 (Grain in Ear, ~Jun 6)',
    '未': '小暑 (Minor Heat, ~Jul 7)',
    '申': '立秋 (Start of Autumn, ~Aug 7)',
    '酉': '白露 (White Dew, ~Sep 8)',
    '戌': '寒露 (Cold Dew, ~Oct 8)',
    '亥': '立冬 (Start of Winter, ~Nov 7)',
    '子': '大雪 (Major Snow, ~Dec 7)',
    '丑': '小寒 (Minor Cold, ~Jan 6)',
  };
  return solarTermMap[monthBranch] || 'Unknown';
}

/**
 * Get a human-readable month name for a BaZi month branch.
 */
function getMonthName(monthBranch: string): string {
  const monthMap: Record<string, string> = {
    '寅': '1st month (寅月)', '卯': '2nd month (卯月)', '辰': '3rd month (辰月)',
    '巳': '4th month (巳月)', '午': '5th month (午月)', '未': '6th month (未月)',
    '申': '7th month (申月)', '酉': '8th month (酉月)', '戌': '9th month (戌月)',
    '亥': '10th month (亥月)', '子': '11th month (子月)', '丑': '12th month (丑月)',
  };
  return monthMap[monthBranch] || monthBranch;
}

export function generateVerification(
  bazi: BaziResult,
  year: number,
  month: number,
  day: number,
  hour: number | null,
): VerificationData {
  const hourStr = hour !== null ? `${String(hour).padStart(2, '0')}:00` : 'Unknown';
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const fullInputStr = hour !== null ? `${dateStr} ${hourStr}` : dateStr;

  // --- Calculation Steps ---
  const calculationSteps = [
    {
      step: '1',
      label: 'Solar Date Input',
      input: fullInputStr,
      output: `${dateStr}${hour !== null ? ' ' + hourStr : ''}`,
      explanation: 'The Gregorian (solar) date is the starting point. BaZi calculation requires converting this to the Chinese astronomical calendar system, which tracks the Sun\'s actual position along the ecliptic.',
    },
    {
      step: '2',
      label: 'Lunar Calendar Conversion',
      input: dateStr,
      output: `${bazi.year.stem}${bazi.year.branch}年 ${bazi.birthInfo.lunarCn}`,
      explanation: 'We use astronomical ephemeris data (not simplified calendar tables) to convert the solar date to the Chinese lunisolar calendar. This accounts for leap months, intercalary adjustments, and the precise solar-lunar cycle alignment.',
    },
    {
      step: '3',
      label: 'Year Pillar (立春 Boundary)',
      input: `Year: ${year}`,
      output: `${bazi.year.stem}${bazi.year.branch} (${bazi.year.stemElementEn} ${bazi.year.stemPolarity} · ${bazi.year.animalCn}${bazi.year.animal})`,
      explanation: `The BaZi year does NOT start on January 1, nor on Lunar New Year. It starts at 立春 (Lichun, Start of Spring), typically February 3-5. Anyone born between January 1 and 立春 belongs to the PREVIOUS year's pillar. This is the #1 error made by AI chatbots.`,
    },
    {
      step: '4',
      label: 'Month Pillar (节气 Boundary)',
      input: `Calendar month: ${month}`,
      output: `${bazi.month.stem}${bazi.month.branch} (${getMonthName(bazi.month.branch)})`,
      explanation: `BaZi months change at solar terms (节气), not on the 1st of each calendar month. This month is governed by ${getMonthSolarTerm(bazi.month.branch)}. A birth on May 3 vs May 8 could produce entirely different month pillars. The month stem is derived from the Year Stem using the 五虎遁 (Five Tigers) formula.`,
    },
    {
      step: '5',
      label: 'Day Pillar (甲子 Cycle)',
      input: dateStr,
      output: `${bazi.day.stem}${bazi.day.branch} (${bazi.day.nayin} · ${bazi.day.nayinEn})`,
      explanation: 'The day pillar follows the 60 甲子 (Jiazi) cycle — a continuous count that has run unbroken for thousands of years. There is no formula to "calculate" it from the date alone; it requires an authoritative ephemeris table. This is why LLMs frequently produce wrong day pillars.',
    },
    {
      step: '6',
      label: 'Hour Pillar (时辰 Mapping)',
      input: hour !== null ? `Birth hour: ${hourStr}` : 'Birth hour: Not provided',
      output: `${bazi.hour.stem}${bazi.hour.branch}`,
      explanation: hour !== null
        ? `Chinese hours (时辰) are 2-hour blocks. ${hourStr} falls in the ${bazi.hour.branch}时 period. We use sect=1 convention (子时换日): births at 23:00-00:59 (子时) use the NEXT day's stem for hour calculation. The hour stem is derived from the Day Stem using the 五鼠遁 (Five Rats) formula.`
        : 'Hour was not provided. A default hour pillar is used. For maximum accuracy, providing the birth hour is recommended.',
    },
  ];

  // --- LLM Failure Points ---
  const yearPillarStr = `${bazi.year.stem}${bazi.year.branch}`;
  const monthPillarStr = `${bazi.month.stem}${bazi.month.branch}`;
  const dayPillarStr = `${bazi.day.stem}${bazi.day.branch}`;
  const hourPillarStr = `${bazi.hour.stem}${bazi.hour.branch}`;

  // Determine if this person's birth is in the danger zone for year pillar errors
  const isJanFeb = month === 1 || month === 2;
  const yearErrorNote = isJanFeb
    ? `Your birth in ${month === 1 ? 'January' : 'February'} is in the HIGH RISK zone. Most LLMs would assign you the wrong year pillar.`
    : `Your birth in month ${month} is after 立春, so the year pillar happens to match the calendar year. But ask an LLM about someone born Jan 15 — it will likely get it wrong.`;

  // Determine if month boundary is close to a solar term
  const monthErrorNote = `Your month pillar is ${monthPillarStr} (${getMonthName(bazi.month.branch)}), determined by the solar term ${getMonthSolarTerm(bazi.month.branch)}. LLMs often assign the month based on the calendar month number, which can differ by days or even weeks.`;

  const llmFailPoints = [
    {
      category: 'Year Pillar Boundary',
      whatLLMsGetWrong: 'Use January 1 or Lunar New Year as the year boundary. Anyone born Jan 1 - ~Feb 4 gets assigned the wrong year.',
      correctMethod: 'BaZi year starts at 立春 (Lichun), the exact astronomical moment when the Sun reaches 315 degrees celestial longitude (~Feb 3-5).',
      ourResult: `${yearPillarStr} — ${yearErrorNote}`,
      typicalLLMError: isJanFeb
        ? `Would likely output the adjacent year's Gan-Zhi instead of ${yearPillarStr}`
        : `Happens to be correct for your date, but fails for Jan-Feb births`,
      icon: '🗓️',
    },
    {
      category: 'Month Pillar Boundary',
      whatLLMsGetWrong: 'Map calendar month numbers directly to BaZi months. "May = 巳月" regardless of the actual date within May.',
      correctMethod: 'Each BaZi month starts at a specific solar term (节气). May could be 辰月 (before 立夏 ~May 5-7) or 巳月 (after 立夏).',
      ourResult: monthErrorNote,
      typicalLLMError: `Often assigns month purely by calendar month number, ignoring that the boundary shifts by 1-3 days each year`,
      icon: '📅',
    },
    {
      category: '子时 Day Boundary',
      whatLLMsGetWrong: 'Treat midnight (00:00) as the day boundary for BaZi. Births at 23:00-23:59 get the wrong day-hour combination.',
      correctMethod: '子时 (Zi hour, 23:00-00:59) bridges two calendar days. With sect=1 convention, 23:00 already counts as the next day\'s 子时, changing both day and hour pillars.',
      ourResult: hour !== null && hour === 23
        ? `Your birth at 23:xx is in 子时 — we correctly advanced the day pillar. An LLM would likely keep the previous day's pillar.`
        : `Your hour pillar: ${hourPillarStr}. ${hour !== null && hour >= 23 ? 'Late-night birth — 子时换日 rule applied.' : 'Not in the 子时 danger zone, but the rule is critical for ~8% of births.'}`,
      typicalLLMError: 'Keeps the calendar date\'s day pillar even for 23:00-23:59 births, producing cascading errors in day stem, hour stem, and all Ten God calculations',
      icon: '🌙',
    },
    {
      category: 'Hidden Stems (藏干)',
      whatLLMsGetWrong: 'Hallucinate hidden stems based on element associations. Often output wrong stems or wrong ordering (main qi vs secondary qi).',
      correctMethod: 'Hidden stems are a fixed lookup table with exactly 12 entries (one per Earthly Branch). The order matters: first = main qi (本气), then middle qi (中气), then residual qi (余气).',
      ourResult: `Day branch ${bazi.day.branch}: [${(BRANCH_HIDDEN_STEMS[bazi.day.branch] || []).join(', ')}] — This is a fixed lookup, not a calculation. There are no alternatives.`,
      typicalLLMError: 'May output wrong stems, wrong order, or invent hidden stems that don\'t exist for that branch',
      icon: '🔍',
    },
    {
      category: 'Ten God Calculation',
      whatLLMsGetWrong: 'Confuse element relationships with polarity. Mix up 正官 (Direct Officer) with 七杀 (Seven Killings), or 正财 with 偏财.',
      correctMethod: 'Ten Gods depend on BOTH the element relationship AND the yin/yang polarity match between the Day Master and each stem. Same polarity = "indirect" variant, opposite = "direct" variant.',
      ourResult: `Day Master ${bazi.day.stem} → Year stem ${bazi.year.stem} = ${bazi.year.tenGod} (${bazi.year.tenGodEn}), Month stem ${bazi.month.stem} = ${bazi.month.tenGod} (${bazi.month.tenGodEn})`,
      typicalLLMError: 'Gets the element relationship right but flips the polarity, producing the wrong variant (e.g., 正官 instead of 七杀)',
      icon: '⚖️',
    },
    {
      category: '纳音 (Nayin) Lookup',
      whatLLMsGetWrong: 'Guess nayin from the stem/branch elements. "甲子 = Wood + Water = ?" — this logic is completely wrong.',
      correctMethod: 'Nayin is a fixed 60-entry lookup table (one per Gan-Zhi pair in the 甲子 cycle). It CANNOT be derived from individual stem/branch elements. It follows its own ancient pattern.',
      ourResult: `${dayPillarStr} → ${bazi.day.nayin} (${bazi.day.nayinEn}). Note: 甲子 = 海中金 (Gold in the Sea), NOT Wood or Water.`,
      typicalLLMError: 'Attempts to derive nayin from element logic, producing nonsensical results like "Wood-Water Metal" or simply hallucinating a name',
      icon: '🎵',
    },
  ];

  // --- Engine Info ---
  const engineInfo = {
    engine: 'lunar-javascript',
    version: '1.6.12',
    method: 'Astronomical Ephemeris Calculation',
    features: [
      '节气-based month boundaries',
      '子时换日 (sect=1)',
      'Complete 神煞 analysis',
      '60甲子 nayin lookup',
      '大运/流年 calculation',
      'Branch interaction analysis (冲合害)',
      '格局 chart pattern identification',
      '空亡 void branch detection',
    ],
  };

  return { calculationSteps, llmFailPoints, engineInfo };
}
