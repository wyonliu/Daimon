// Western Zodiac Calculations

export interface ZodiacResult {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign | null;
  risingSign: ZodiacSign | null;
  element: string;
  modality: string;
  rulingPlanet: string;
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
  description: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal',
    rulingPlanet: 'Mars', dateRange: 'Mar 21 – Apr 19',
    traits: ['Bold', 'Ambitious', 'Energetic', 'Pioneer'],
    description: 'The initiator of the zodiac. Aries charges forward with courage and passion, driven by an instinct to be first and to lead.',
  },
  {
    name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed',
    rulingPlanet: 'Venus', dateRange: 'Apr 20 – May 20',
    traits: ['Grounded', 'Sensual', 'Persistent', 'Loyal'],
    description: 'The builder. Taurus creates beauty and security through patience and determination, finding wisdom in the physical world.',
  },
  {
    name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable',
    rulingPlanet: 'Mercury', dateRange: 'May 21 – Jun 20',
    traits: ['Curious', 'Versatile', 'Communicative', 'Quick-witted'],
    description: 'The messenger. Gemini weaves connections between ideas and people, forever seeking to understand and communicate.',
  },
  {
    name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal',
    rulingPlanet: 'Moon', dateRange: 'Jun 21 – Jul 22',
    traits: ['Nurturing', 'Intuitive', 'Protective', 'Empathic'],
    description: 'The guardian. Cancer creates emotional sanctuary for those they love, guided by deep intuition and fierce devotion.',
  },
  {
    name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed',
    rulingPlanet: 'Sun', dateRange: 'Jul 23 – Aug 22',
    traits: ['Charismatic', 'Creative', 'Generous', 'Regal'],
    description: 'The sovereign. Leo radiates warmth and creative power, inspiring others through authentic self-expression and courage.',
  },
  {
    name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable',
    rulingPlanet: 'Mercury', dateRange: 'Aug 23 – Sep 22',
    traits: ['Analytical', 'Precise', 'Devoted', 'Practical'],
    description: 'The alchemist. Virgo perfects and refines, finding the sacred in service and the extraordinary in detail.',
  },
  {
    name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal',
    rulingPlanet: 'Venus', dateRange: 'Sep 23 – Oct 22',
    traits: ['Harmonious', 'Diplomatic', 'Aesthetic', 'Just'],
    description: 'The peacemaker. Libra seeks beauty and balance in all things, understanding that harmony is an active creative force.',
  },
  {
    name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed',
    rulingPlanet: 'Pluto', dateRange: 'Oct 23 – Nov 21',
    traits: ['Intense', 'Transformative', 'Perceptive', 'Powerful'],
    description: 'The phoenix. Scorpio dives into the depths, transforming through crisis and emerging with profound understanding.',
  },
  {
    name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable',
    rulingPlanet: 'Jupiter', dateRange: 'Nov 22 – Dec 21',
    traits: ['Adventurous', 'Philosophical', 'Optimistic', 'Free-spirited'],
    description: 'The seeker. Sagittarius pursues truth and meaning across every horizon, fueled by boundless curiosity and faith.',
  },
  {
    name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal',
    rulingPlanet: 'Saturn', dateRange: 'Dec 22 – Jan 19',
    traits: ['Ambitious', 'Disciplined', 'Strategic', 'Masterful'],
    description: 'The architect. Capricorn builds empires through relentless discipline, understanding that true power comes from sustained effort.',
  },
  {
    name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed',
    rulingPlanet: 'Uranus', dateRange: 'Jan 20 – Feb 18',
    traits: ['Visionary', 'Independent', 'Humanitarian', 'Innovative'],
    description: 'The revolutionary. Aquarius envisions the future humanity needs and works tirelessly to bring it into being.',
  },
  {
    name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable',
    rulingPlanet: 'Neptune', dateRange: 'Feb 19 – Mar 20',
    traits: ['Mystical', 'Compassionate', 'Imaginative', 'Transcendent'],
    description: 'The dreamer. Pisces dissolves boundaries between self and other, accessing universal compassion and creative vision.',
  },
];

// Sun sign date boundaries (month, day)
const SUN_SIGN_DATES: [number, number][] = [
  [3, 21],  // Aries
  [4, 20],  // Taurus
  [5, 21],  // Gemini
  [6, 21],  // Cancer
  [7, 23],  // Leo
  [8, 23],  // Virgo
  [9, 23],  // Libra
  [10, 23], // Scorpio
  [11, 22], // Sagittarius
  [12, 22], // Capricorn
  [1, 20],  // Aquarius
  [2, 19],  // Pisces
];

export function getSunSign(month: number, day: number): ZodiacSign {
  for (let i = 0; i < SUN_SIGN_DATES.length; i++) {
    const [m, d] = SUN_SIGN_DATES[i];
    const [nextM, nextD] = SUN_SIGN_DATES[(i + 1) % 12];

    if (i === 9) { // Capricorn: Dec 22 - Jan 19
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return ZODIAC_SIGNS[9];
      }
    } else if (i === 10) { // Aquarius: Jan 20 - Feb 18
      if (month === 1 && day >= 20 || month === 2 && day <= 18) {
        return ZODIAC_SIGNS[10];
      }
    } else if (i === 11) { // Pisces: Feb 19 - Mar 20
      if (month === 2 && day >= 19 || month === 3 && day <= 20) {
        return ZODIAC_SIGNS[11];
      }
    } else {
      if (month === m && day >= d) {
        return ZODIAC_SIGNS[i];
      }
      if (month === nextM && day < nextD) {
        return ZODIAC_SIGNS[i];
      }
    }
  }

  // Fallback: determine by month
  const monthToSign = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]; // Jan=Cap area
  return ZODIAC_SIGNS[monthToSign[month - 1]];
}

// Approximate moon sign calculation
// This is simplified - a production system would use Swiss Ephemeris
export function getApproxMoonSign(year: number, month: number, day: number): ZodiacSign {
  // Simplified lunar cycle calculation
  // The Moon completes a zodiac cycle in ~27.3 days
  // Using a known reference: Jan 1, 2000, Moon was approximately in Gemini
  const refDate = new Date(2000, 0, 1);
  const birthDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((birthDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));

  // Moon moves through ~13.2 degrees per day, takes ~2.3 days per sign
  const moonCycle = 27.321661; // Sidereal month
  const daysPerSign = moonCycle / 12;

  // Gemini = index 2 on Jan 1, 2000
  const signOffset = Math.floor(daysDiff / daysPerSign) % 12;
  const moonSignIdx = (2 + signOffset) % 12;

  return ZODIAC_SIGNS[moonSignIdx >= 0 ? moonSignIdx : moonSignIdx + 12];
}

export function calculateZodiac(year: number, month: number, day: number): ZodiacResult {
  const sunSign = getSunSign(month, day);
  const moonSign = getApproxMoonSign(year, month, day);

  return {
    sunSign,
    moonSign,
    risingSign: null, // Requires exact birth time and location for proper calculation
    element: sunSign.element,
    modality: sunSign.modality,
    rulingPlanet: sunSign.rulingPlanet,
  };
}

export function zodiacToText(result: ZodiacResult): string {
  const lines: string[] = [];

  lines.push(`=== Western Astrology ===`);
  lines.push(`Sun Sign: ${result.sunSign.symbol} ${result.sunSign.name}`);
  lines.push(`  Element: ${result.sunSign.element} | Modality: ${result.sunSign.modality} | Ruler: ${result.sunSign.rulingPlanet}`);
  lines.push(`  ${result.sunSign.description}`);
  lines.push(`  Key traits: ${result.sunSign.traits.join(', ')}`);

  if (result.moonSign) {
    lines.push('');
    lines.push(`Moon Sign: ${result.moonSign.symbol} ${result.moonSign.name} (approximate)`);
    lines.push(`  Element: ${result.moonSign.element} | Modality: ${result.moonSign.modality}`);
    lines.push(`  ${result.moonSign.description}`);
    lines.push(`  Your emotional inner world resonates with ${result.moonSign.name} energy.`);
  }

  return lines.join('\n');
}

export { ZODIAC_SIGNS };
