import type { SchoolProfile } from './schoolSession';
import { getCurrentMonthStudentEmissionsBySchool } from './studentDataStorage';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 'energy' | 'cooking' | 'transport' | 'waste';

export interface MonthlyDataInput {
  electricityBill: string;
  dieselLiters: string;
  cookingFuelAmount: string;
  wasteBags: string;
}

export interface EmissionSummary {
  electricityCO2: number;
  dieselCO2: number;
  cookingCO2: number;
  wasteCO2: number;
  studentCO2: number;
  totalCO2: number;
  electricityPercent: number;
  dieselPercent: number;
  cookingPercent: number;
  wastePercent: number;
  studentPercent: number;
  biggestSource: Category;
  biggestSourceLabel: string;
  electricityKwh: number;
}

export interface RecommendationItem {
  id: number;
  title_en: string;
  title_np: string;
  co2_saved_kg: number;
  cost_npr: string;
  difficulty: Difficulty;
  impact: 'Low' | 'Medium' | 'High' | 'Very High';
  category: Category;
  reason_en: string;
  reason_np: string;
}

export interface ActionWeek {
  week: number;
  task_en: string;
  task_np: string;
  category: Category;
}

export interface ActionMonth {
  title_en: string;
  title_np: string;
  weeks: ActionWeek[];
}

export interface ActionPlanBundle {
  month1: ActionMonth;
  month2: ActionMonth;
  month3: ActionMonth;
}

export interface MvpAnalysisBundle {
  profile: SchoolProfile | null;
  monthlyData: MonthlyDataInput | null;
  emissions: EmissionSummary;
  recommendations: RecommendationItem[];
  actionPlan: ActionPlanBundle;
  generatedAt: string;
}

const ANALYSIS_STORAGE_KEY = 'haritPathshala:mvpAnalysis';
const MONTHLY_DATA_STORAGE_KEY = 'haritPathshala:monthlyData';
const SCHOOL_PROFILE_STORAGE_KEY = 'currentSchoolProfile';

const NEA_TARIFF_PER_KWH = 10.5;
const ELECTRICITY_FACTOR = 0.442;
const DIESEL_FACTOR = 2.68;
const WOOD_FACTOR = 1.5;
const LPG_FACTOR = 3.15;
const KEROSENE_FACTOR = 2.52;

const baseRecommendations: Record<'remote' | 'semiUrban' | 'urban', RecommendationItem[]> = {
  remote: [
    {
      id: 1,
      title_en: 'Improved biomass cookstove',
      title_np: 'सुधारिएको बायोमास चुलो',
      co2_saved_kg: 175,
      cost_npr: '8,000-15,000',
      difficulty: 'Easy',
      impact: 'High',
      category: 'cooking',
      reason_en: 'Wood use is usually the biggest source in remote schools, so an efficient stove gives the fastest reduction.',
      reason_np: 'दुर्गम विद्यालयमा दाउरा प्रायः सबैभन्दा ठूलो स्रोत हुन्छ, त्यसैले सुधारिएको चुलोले छिटो बचत दिन्छ।',
    },
    {
      id: 2,
      title_en: 'Solar lanterns for evening study',
      title_np: 'साँझको पढाइका लागि सौर्य बत्ती',
      co2_saved_kg: 45,
      cost_npr: '20,000-30,000',
      difficulty: 'Easy',
      impact: 'Medium',
      category: 'energy',
      reason_en: 'Solar lanterns replace kerosene or poor-quality lighting where grid power is unreliable.',
      reason_np: 'ग्रिड नहुँदा वा कमजोर हुँदा सौर्य बत्तीले मट्टीतेल वा कमजोर प्रकाशलाई प्रतिस्थापन गर्छ।',
    },
    {
      id: 3,
      title_en: 'Walking group initiative',
      title_np: 'हिँड्ने समूह अभियान',
      co2_saved_kg: 30,
      cost_npr: 'Free',
      difficulty: 'Easy',
      impact: 'Medium',
      category: 'transport',
      reason_en: 'Students already walking can organise into safe groups and strengthen the low-carbon habit.',
      reason_np: 'पहिलेदेखि हिँडिरहेका विद्यार्थीहरूलाई सुरक्षित समूहमा संगठित गर्दा कम-कार्बन बानी अझ बलियो हुन्छ।',
    },
  ],
  semiUrban: [
    {
      id: 1,
      title_en: 'LED light replacement',
      title_np: 'एलईडी बत्ती प्रयोग',
      co2_saved_kg: 92,
      cost_npr: '18,000-35,000',
      difficulty: 'Easy',
      impact: 'High',
      category: 'energy',
      reason_en: 'Semi-urban schools can reduce electricity quickly by swapping old bulbs for LEDs.',
      reason_np: 'अर्ध-सहरी विद्यालयले पुराना बल्बलाई एलईडीमा बदल्दा छिटो विद्युत् बचत गर्न सक्छन्।',
    },
    {
      id: 2,
      title_en: 'Composting pit for canteen waste',
      title_np: 'क्यान्टिन फोहोरका लागि कम्पोस्ट खाल्डो',
      co2_saved_kg: 90,
      cost_npr: '5,000-10,000',
      difficulty: 'Easy',
      impact: 'Medium',
      category: 'waste',
      reason_en: 'Mixed waste from canteens becomes useful compost instead of methane-heavy landfill waste.',
      reason_np: 'क्यान्टिनको मिश्रित फोहोर मिथेन बनाउने ल्यान्डफिलमा जानुभन्दा कम्पोस्ट बन्न सक्छ।',
    },
    {
      id: 3,
      title_en: 'Walking and bicycle safety campaign',
      title_np: 'हिँडाइ र साइकल सुरक्षा अभियान',
      co2_saved_kg: 55,
      cost_npr: 'Free-3,000',
      difficulty: 'Easy',
      impact: 'Medium',
      category: 'transport',
      reason_en: 'Route signboards and safe walking groups make low-emission travel easier to keep using.',
      reason_np: 'मार्ग संकेत र सुरक्षित हिँडाइ समूहले कम-उत्सर्जन यात्रा निरन्तर गर्न सजिलो बनाउँछ।',
    },
  ],
  urban: [
    {
      id: 1,
      title_en: 'Rooftop solar readiness plan',
      title_np: 'छतमा सौर्य तयारी योजना',
      co2_saved_kg: 240,
      cost_npr: 'Funding available',
      difficulty: 'Hard',
      impact: 'Very High',
      category: 'energy',
      reason_en: 'Urban schools often have the roof and load profile needed for solar, so this can cut the biggest emission source.',
      reason_np: 'सहरी विद्यालयसँग प्रायः सौर्यका लागि छत र उपयुक्त लोड हुन्छ, त्यसैले यसले सबैभन्दा ठूलो स्रोत घटाउन सक्छ।',
    },
    {
      id: 2,
      title_en: 'Bus route optimization',
      title_np: 'बस मार्ग सुधार',
      co2_saved_kg: 140,
      cost_npr: 'Free',
      difficulty: 'Medium',
      impact: 'High',
      category: 'transport',
      reason_en: 'Route clustering and stop consolidation reduce diesel use without major spending.',
      reason_np: 'मार्ग समूहीकरण र स्टप कम गर्दा ठूलो खर्च बिना नै डिजेल खपत घट्छ।',
    },
    {
      id: 3,
      title_en: 'Classroom energy switch-off policy',
      title_np: 'कक्षा ऊर्जा बन्द नीति',
      co2_saved_kg: 70,
      cost_npr: 'Free',
      difficulty: 'Easy',
      impact: 'Medium',
      category: 'energy',
      reason_en: 'A daily switch-off policy reduces waste from lights, fans and devices left on unnecessarily.',
      reason_np: 'दैनिक बन्द नीति लागू गर्दा अनावश्यक बत्ती, पंखा र उपकरणको खपत घट्छ।',
    },
  ],
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readStorage<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeArchetype(archetype?: string | null): 'remote' | 'semiUrban' | 'urban' {
  const value = (archetype || '').toLowerCase();
  if (value.includes('remote') || value.includes('दुर्गम')) return 'remote';
  if (value.includes('semi') || value.includes('अर्ध')) return 'semiUrban';
  return 'urban';
}

function normalizeFuelFactor(cookingFuel?: string | null): number {
  const value = (cookingFuel || '').toLowerCase();
  if (value.includes('wood') || value.includes('दाउरा') || value.includes('biomass')) return WOOD_FACTOR;
  if (value.includes('lpg') || value.includes('एलपीजी')) return LPG_FACTOR;
  if (value.includes('kerosene') || value.includes('मट्टी')) return KEROSENE_FACTOR;
  return 0;
}

function parseWasteBags(value?: string | null): number {
  const text = (value || '').toLowerCase();
  if (text.includes('20+')) return 25;
  if (text.includes('10-20')) return 15;
  if (text.includes('5-10')) return 7;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function moneyToKwh(bill: number): number {
  if (!bill || bill <= 0) return 0;
  return bill / NEA_TARIFF_PER_KWH;
}

function categoryLabel(category: Category): string {
  switch (category) {
    case 'energy':
      return 'Electricity';
    case 'cooking':
      return 'Cooking';
    case 'transport':
      return 'Transport';
    case 'waste':
      return 'Waste';
  }
}

function pickTopRecommendations(archetype: 'remote' | 'semiUrban' | 'urban', biggestSource: Category): RecommendationItem[] {
  const sourceMap: Record<Category, RecommendationItem[]> = {
    energy: baseRecommendations[archetype],
    cooking: baseRecommendations[archetype],
    transport: baseRecommendations[archetype],
    waste: baseRecommendations[archetype],
  };

  const sourceFirst = sourceMap[biggestSource]
    .filter((item) => item.category === biggestSource)
    .sort((a, b) => b.co2_saved_kg - a.co2_saved_kg);

  const fallback = baseRecommendations[archetype].sort((a, b) => b.co2_saved_kg - a.co2_saved_kg);
  const results = [...sourceFirst, ...fallback].filter(
    (item, index, self) => self.findIndex((candidate) => candidate.id === item.id) === index
  );

  return results.slice(0, 3).map((item, index) => ({ ...item, id: index + 1 }));
}

function recommendationCategoryFromSource(source: Category): Category {
  return source;
}

function createTasksForCategory(category: Category): ActionWeek[] {
  const taskLibrary: Record<Category, Array<{ en: string; np: string }>> = {
    energy: [
      { en: 'Audit all lights, fans and devices in the school', np: 'विद्यालयका सबै बत्ती, पंखा र उपकरणको लेखाजोखा गर्नुहोस्' },
      { en: 'Switch off unused classroom equipment after every period', np: 'हरेक पिरियडपछि प्रयोग नभएका उपकरण बन्द गर्नुहोस्' },
      { en: 'Compare this month\'s bill with last month\'s bill', np: 'यो महिनाको बिललाई अघिल्लो महिनासँग तुलना गर्नुहोस्' },
      { en: 'Document the energy action with photos and a short note', np: 'फोटो र छोटो टिप्पणीसहित ऊर्जा कार्यको प्रमाण राख्नुहोस्' },
    ],
    cooking: [
      { en: 'Measure the school\'s current fuel usage', np: 'विद्यालयको हालको इन्धन खपत नाप्नुहोस्' },
      { en: 'Discuss stove or kitchen improvements with staff', np: 'कर्मचारीसँग चुलो वा भान्सा सुधारबारे छलफल गर्नुहोस्' },
      { en: 'Pilot the improved cooking method for one week', np: 'एक हप्तासम्म सुधारिएको पकाउने तरिका प्रयोग गर्नुहोस्' },
      { en: 'Track fuel savings and cook efficiency', np: 'इन्धन बचत र पकाउने दक्षता मापन गर्नुहोस्' },
    ],
    transport: [
      { en: 'Map how students currently travel to school', np: 'विद्यार्थीहरू विद्यालय कसरी आउँछन् भन्ने नक्सा बनाउनुहोस्' },
      { en: 'Group students by shared walking or bus routes', np: 'साझा हिँडाइ वा बस मार्गअनुसार विद्यार्थी समूह बनाउनुहोस्' },
      { en: 'Trial the new route or walking group for one week', np: 'नयाँ मार्ग वा हिँडाइ समूह एक हप्तासम्म चलाउनुहोस्' },
      { en: 'Collect feedback and measure participation', np: 'प्रतिक्रिया संकलन गरेर सहभागिता मापन गर्नुहोस्' },
    ],
    waste: [
      { en: 'Measure weekly waste bags and identify the main waste source', np: 'साप्ताहिक फोहोर झोला गन्नुहोस् र मुख्य स्रोत पत्ता लगाउनुहोस्' },
      { en: 'Place separate bins for organic and non-organic waste', np: 'जैविक र अजैविक फोहोरका लागि छुट्टै डस्टबिन राख्नुहोस्' },
      { en: 'Start composting or safe disposal tracking', np: 'कम्पोस्टिङ वा सुरक्षित व्यवस्थापन सुरु गर्नुहोस्' },
      { en: 'Review waste reduction with the class monitor', np: 'कक्षा प्रतिनिधिसँग फोहोर घटाउने समीक्षा गर्नुहोस्' },
    ],
  };

  const sourceTasks = taskLibrary[category];
  return sourceTasks.map((task, index) => ({ week: index + 1, task_en: task.en, task_np: task.np, category }));
}

function createActionPlan(recommendations: RecommendationItem[], biggestSource: Category): ActionPlanBundle {
  const firstCategory = recommendationCategoryFromSource(recommendations[0]?.category || biggestSource);
  const secondCategory = recommendationCategoryFromSource(recommendations[1]?.category || biggestSource);

  return {
    month1: {
      title_en: 'Awareness and Setup',
      title_np: 'जागरूकता र तयारी',
      weeks: createTasksForCategory(firstCategory),
    },
    month2: {
      title_en: 'Implementation and Tracking',
      title_np: 'कार्यान्वयन र अनुगमन',
      weeks: createTasksForCategory(secondCategory),
    },
    month3: {
      title_en: 'Verification and Re-evaluation',
      title_np: 'प्रमाणीकरण र पुनर्मूल्याङ्कन',
      weeks: [
        { week: 1, task_en: 'Re-enter updated monthly data after the action starts', task_np: 'कार्य सुरु भएपछि अद्यावधिक मासिक डेटा पुनः भर्नुहोस्', category: biggestSource },
        { week: 2, task_en: 'Upload bill photos and action proof for verification', task_np: 'प्रमाणीकरणका लागि बिल फोटो र प्रमाण अपलोड गर्नुहोस्', category: biggestSource },
        { week: 3, task_en: 'Compare before-and-after carbon numbers', task_np: 'पहिले र पछिको कार्बन संख्या तुलना गर्नुहोस्', category: biggestSource },
        { week: 4, task_en: 'Submit impact evidence and unlock the next support tier', task_np: 'प्रभाव प्रमाण पेश गरेर अर्को सहयोग तह अनलक गर्नुहोस्', category: biggestSource },
      ],
    },
  };
}

export function calculateEmissionSummary(profile: SchoolProfile | null, monthlyData: MonthlyDataInput | null): EmissionSummary {
  const electricityBill = Number(monthlyData?.electricityBill || 0);
  const dieselLiters = Number(monthlyData?.dieselLiters || 0);
  const cookingFuelAmount = Number(monthlyData?.cookingFuelAmount || 0);
  const wasteBags = parseWasteBags(monthlyData?.wasteBags || '');

  const electricityKwh = moneyToKwh(electricityBill);
  const electricityCO2 = electricityKwh * ELECTRICITY_FACTOR;
  const dieselCO2 = dieselLiters * DIESEL_FACTOR;
  const cookingFactor = normalizeFuelFactor(profile?.cookingFuel || '');
  const cookingCO2 = cookingFuelAmount * cookingFactor;
  const wasteFactor = normalizeArchetype(profile?.archetype) === 'urban' ? 0.1 : normalizeArchetype(profile?.archetype) === 'semiUrban' ? 0.5 : 2.5;
  const wasteCO2 = wasteBags * 5 * wasteFactor;

  const schoolName = profile?.schoolName || '';
  const studentCO2Raw = schoolName ? getCurrentMonthStudentEmissionsBySchool(schoolName) : 0;
  const studentCO2 = Number(studentCO2Raw.toFixed(2));
  const studentTransportCO2 = studentCO2 * 0.7;
  const studentWasteCO2 = studentCO2 * 0.3;

  const transportCO2 = studentTransportCO2;
  const adjustedWasteCO2 = wasteCO2 + studentWasteCO2;

  const totalCO2 = electricityCO2 + dieselCO2 + cookingCO2 + transportCO2 + adjustedWasteCO2;

  const percent = (value: number) => (totalCO2 > 0 ? Math.round((value / totalCO2) * 100) : 0);
  const categoryValues: Array<[Category, number]> = [
    ['energy', electricityCO2 + dieselCO2],
    ['cooking', cookingCO2],
    ['transport', transportCO2],
    ['waste', adjustedWasteCO2],
  ];

  const [biggestSource] = categoryValues.sort((a, b) => b[1] - a[1])[0] || ['energy', 0];

  return {
    electricityCO2: Math.round(electricityCO2),
    dieselCO2: Math.round(dieselCO2),
    cookingCO2: Math.round(cookingCO2),
    wasteCO2: Math.round(adjustedWasteCO2),
    studentCO2: Math.round(studentCO2),
    totalCO2: Math.round(totalCO2),
    electricityPercent: percent(electricityCO2),
    dieselPercent: percent(dieselCO2),
    cookingPercent: percent(cookingCO2),
    wastePercent: percent(adjustedWasteCO2),
    studentPercent: percent(studentCO2),
    biggestSource,
    biggestSourceLabel: categoryLabel(biggestSource),
    electricityKwh: Math.round(electricityKwh),
  };
}

export function generateRecommendations(profile: SchoolProfile | null, emissions: EmissionSummary): RecommendationItem[] {
  const archetype = normalizeArchetype(profile?.archetype);
  return pickTopRecommendations(archetype, emissions.biggestSource);
}

export function generateActionPlan(recommendations: RecommendationItem[], emissions: EmissionSummary): ActionPlanBundle {
  return createActionPlan(recommendations, emissions.biggestSource);
}

export function buildMvpAnalysis(profile: SchoolProfile | null, monthlyData: MonthlyDataInput | null): MvpAnalysisBundle {
  const emissions = calculateEmissionSummary(profile, monthlyData);
  const recommendations = generateRecommendations(profile, emissions);
  const actionPlan = generateActionPlan(recommendations, emissions);
  return {
    profile,
    monthlyData,
    emissions,
    recommendations,
    actionPlan,
    generatedAt: new Date().toISOString(),
  };
}

export function saveMonthlyData(data: MonthlyDataInput): void {
  writeStorage(MONTHLY_DATA_STORAGE_KEY, data);
}

export function getMonthlyData(): MonthlyDataInput | null {
  return readStorage<MonthlyDataInput>(MONTHLY_DATA_STORAGE_KEY);
}

export function saveMvpAnalysis(bundle: MvpAnalysisBundle): void {
  writeStorage(ANALYSIS_STORAGE_KEY, bundle);
}

export function getStoredMvpAnalysis(): MvpAnalysisBundle | null {
  return readStorage<MvpAnalysisBundle>(ANALYSIS_STORAGE_KEY);
}

export function ensureMvpAnalysis(profile: SchoolProfile | null): MvpAnalysisBundle {
  const monthlyData = getMonthlyData();
  const stored = getStoredMvpAnalysis();
  const matchingSchool = stored?.profile?.schoolName && profile?.schoolName && stored.profile.schoolName === profile.schoolName;

  if (stored && matchingSchool) return stored;

  const bundle = buildMvpAnalysis(profile, monthlyData);
  saveMvpAnalysis(bundle);
  return bundle;
}

export function resetMvpAnalysis(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
}

export { ANALYSIS_STORAGE_KEY, MONTHLY_DATA_STORAGE_KEY, SCHOOL_PROFILE_STORAGE_KEY };