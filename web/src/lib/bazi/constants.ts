// 天干 Heavenly Stems
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEMS_PINYIN = ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'] as const;
export const STEMS_EN = ['Wood+', 'Wood-', 'Fire+', 'Fire-', 'Earth+', 'Earth-', 'Metal+', 'Metal-', 'Water+', 'Water-'] as const;

// 地支 Earthly Branches
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCHES_PINYIN = ['Zǐ', 'Chǒu', 'Yín', 'Mǎo', 'Chén', 'Sì', 'Wǔ', 'Wèi', 'Shēn', 'Yǒu', 'Xū', 'Hài'] as const;
export const BRANCHES_ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
export const BRANCHES_ANIMAL_CN = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const;

// 五行 Five Elements
export const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export const ELEMENTS_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
export const ELEMENTS_COLOR = ['#22c55e', '#ef4444', '#eab308', '#f59e0b', '#3b82f6'] as const;
export const ELEMENTS_EMOJI = ['🌳', '🔥', '⛰️', '🪙', '💧'] as const;

// 天干对应五行
export const STEM_ELEMENT: Record<string, number> = {
  '甲': 0, '乙': 0,  // 木 Wood
  '丙': 1, '丁': 1,  // 火 Fire
  '戊': 2, '己': 2,  // 土 Earth
  '庚': 3, '辛': 3,  // 金 Metal
  '壬': 4, '癸': 4,  // 水 Water
};

// 天干阴阳
export const STEM_POLARITY: Record<string, 'yang' | 'yin'> = {
  '甲': 'yang', '乙': 'yin',
  '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin',
  '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin',
};

// 地支对应五行
export const BRANCH_ELEMENT: Record<string, number> = {
  '寅': 0, '卯': 0,  // 木 Wood
  '巳': 1, '午': 1,  // 火 Fire
  '辰': 2, '未': 2, '丑': 2, '戌': 2,  // 土 Earth
  '申': 3, '酉': 3,  // 金 Metal
  '亥': 4, '子': 4,  // 水 Water
};

// 地支藏干 (Hidden Stems in Branches)
export const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 十神 Ten Gods - based on relationship with Day Master
export const TEN_GODS_CN = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'] as const;
export const TEN_GODS_EN = [
  'Companion', 'Rob Wealth', 'Eating God', 'Hurting Officer',
  'Indirect Wealth', 'Direct Wealth', 'Seven Killings', 'Direct Officer',
  'Indirect Resource', 'Direct Resource'
] as const;
export const TEN_GODS_SHORT = ['比', '劫', '食', '伤', '偏财', '正财', '七杀', '正官', '偏印', '正印'] as const;

// 十神含义
export const TEN_GODS_MEANING: Record<string, string> = {
  '比肩': 'Self-identity, peers, independence, competition',
  '劫财': 'Ambition, boldness, risk-taking, rivalry',
  '食神': 'Creativity, pleasure, talent expression, nurturing',
  '伤官': 'Intelligence, rebellion, innovation, sharp wit',
  '偏财': 'Windfall wealth, socializing, generosity, opportunity',
  '正财': 'Steady income, practicality, responsibility, frugality',
  '七杀': 'Power, authority, pressure, decisive action',
  '正官': 'Discipline, career, reputation, integrity',
  '偏印': 'Unconventional wisdom, solitude, spiritual insight',
  '正印': 'Knowledge, support, kindness, traditional learning',
};

// 纳音 Nayin (60 Jiazi cycle sounds)
export const NAYIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '砂石金', '乙未': '砂石金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
};

// 纳音英文
export const NAYIN_EN: Record<string, string> = {
  '海中金': 'Gold in the Sea',
  '炉中火': 'Fire in the Furnace',
  '大林木': 'Wood of the Great Forest',
  '路旁土': 'Earth by the Roadside',
  '剑锋金': 'Metal of the Sword Edge',
  '山头火': 'Fire on the Mountain',
  '涧下水': 'Water beneath the Stream',
  '城头土': 'Earth on the City Wall',
  '白蜡金': 'White Wax Metal',
  '杨柳木': 'Willow Wood',
  '泉中水': 'Water in the Spring',
  '屋上土': 'Earth on the Rooftop',
  '霹雳火': 'Thunderbolt Fire',
  '松柏木': 'Pine and Cypress Wood',
  '长流水': 'Long-flowing Water',
  '砂石金': 'Sand and Stone Metal',
  '山下火': 'Fire at the Foot of the Mountain',
  '平地木': 'Wood on Flat Ground',
  '壁上土': 'Earth on the Wall',
  '金箔金': 'Gold Leaf Metal',
  '覆灯火': 'Lantern Fire',
  '天河水': 'Water of the Milky Way',
  '大驿土': 'Earth of the Great Post Road',
  '钗钏金': 'Hairpin Metal',
  '桑柘木': 'Mulberry Wood',
  '大溪水': 'Water of the Great Stream',
  '沙中土': 'Earth in the Sand',
  '天上火': 'Fire in the Sky',
  '石榴木': 'Pomegranate Wood',
  '大海水': 'Water of the Great Sea',
};
