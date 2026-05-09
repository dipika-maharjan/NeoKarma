import type { SchoolProfile } from './schoolSession';
import { callAIForRecommendations, getFallbackRecommendations, type AIRecommendationRequest } from './aiRecommendations';
import EMISSION_FACTORS from '../data/emissionFactors';

export type RecommendationDifficulty = 'Easy' | 'Medium' | 'Hard';
export type RecommendationImpact = 'Low' | 'Medium' | 'High' | 'Very High';
export type RecommendationCategory = 'energy' | 'cooking' | 'transport' | 'waste';

export interface RecommendationItem {
  id: number;
  title_en: string;
  title_np: string;
  co2_saved_kg: number;
  cost_npr: string;
  difficulty: RecommendationDifficulty;
  impact: RecommendationImpact;
  category: RecommendationCategory;
  reason_en: string;
  reason_np: string;
}

export interface EmissionSummary {
  totalCO2: number;
  electricityCO2: number;
  dieselCO2: number;
  cookingCO2: number;
  studentCO2: number;
  wasteCO2: number;
  electricityPercent: number;
  cookingPercent: number;
  wastePercent: number;
  biggestSource: RecommendationCategory;
  biggestSourceLabel: string;
}

export interface MvpAnalysisBundle {
  profile: SchoolProfile | null;
  emissions: EmissionSummary;
  recommendations: RecommendationItem[];
}

export interface MonthlyDataForm {
  electricityBill: string;
  dieselLiters: string;
  cookingFuelAmount: string;
  wasteBags: string;
}

const MONTHLY_DATA_KEY = 'haritPathshala:monthlyData';

export const fallbackRecommendationsByArchetype: Record<'remote' | 'semiUrban' | 'urban', RecommendationItem[]> = {
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
      reason_en: 'Wood burning is the primary emissions source in remote schools.',
      reason_np: 'दुर्गम विद्यालयमा दाउरा जलाउने प्रमुख स्रोत हो।',
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
      reason_en: 'Solar lanterns replace kerosene lamps in remote areas.',
      reason_np: 'दुर्गम क्षेत्रमा मट्टीतेलको बत्तीको सट्टा सौर्य बत्ती प्रयोग हुन्छ।',
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
      reason_en: 'Safe walking groups improve an already low-carbon commute.',
      reason_np: 'सुरक्षित हिँडाइ समूहले पहिले नै कम-कार्बन यात्रा सुधार गर्छ।',
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
      reason_en: 'Electricity is the main emissions driver in semi-urban schools.',
      reason_np: 'अर्ध-सहरी विद्यालयमा बिजुली मुख्य स्रोत हो।',
    },
    {
      id: 2,
      title_en: 'Composting pit for canteen waste',
      title_np: 'क्यान्टिन फोहोरका लागि कम्पोस्ट खाल्डो',
      co2_saved_kg: 90,
      cost_npr: '5,000-10,000',
      difficulty: 'Easy',
      impact: 'High',
      category: 'waste',
      reason_en: 'Food waste can be redirected into soil instead of landfill.',
      reason_np: 'खाना फोहोरलाई ल्यान्डफिलको सट्टा माटोमा रूपान्तरण गर्न सकिन्छ।',
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
      reason_en: 'Safe routes encourage more students to walk or cycle.',
      reason_np: 'सुरक्षित मार्गले हिँडाइ वा साइकल प्रयोग बढाउँछ।',
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
      reason_en: 'Urban schools have suitable roofs and load profiles for solar.',
      reason_np: 'सहरी विद्यालयका छत र लोड सौर्यका लागि उपयुक्त हुन्छ।',
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
      reason_en: 'Route clustering reduces unnecessary diesel use.',
      reason_np: 'मार्ग समूहीकरणले अनावश्यक डिजेल प्रयोग घटाउँछ।',
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
      reason_en: 'Unnecessary lighting and AC use wastes energy.',
      reason_np: 'अनावश्यक बत्ती र एसी प्रयोगले ऊर्जा बर्बाद गर्छ।',
    },
  ],
};

function getStoredMonthlyData(): MonthlyDataForm | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MONTHLY_DATA_KEY);
    return raw ? (JSON.parse(raw) as MonthlyDataForm) : null;
  } catch {
    return null;
  }
}

function normalizeArchetype(archetype?: string): 'remote' | 'semiUrban' | 'urban' {
  const value = (archetype || '').toLowerCase();
  if (value.includes('remote')) return 'remote';
  if (value.includes('semi')) return 'semiUrban';
  return 'urban';
}

function parseNumber(value: string | undefined): number {
  const numeric = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getTransportFactor(transport: string): number {
  const key = transport.toLowerCase();
  if (key.includes('walk')) return 0;
  if (key.includes('bike')) return 0;
  if (key.includes('bus')) return 0.089;
  if (key.includes('motor')) return 0.103;
  if (key.includes('car')) return 0.18065;
  return 0.05;
}

function buildEmissions(profile: SchoolProfile | null): EmissionSummary {
  const monthly = getStoredMonthlyData();
  const electricityBill = parseNumber(monthly?.electricityBill);
  const dieselLiters = parseNumber(monthly?.dieselLiters);
  const cookingFuelAmount = parseNumber(monthly?.cookingFuelAmount);
  const wasteBags = parseNumber(monthly?.wasteBags);

  const students = parseNumber(profile?.students);
  const transportFactor = getTransportFactor(profile?.transport || '');

  const electricityCO2 = Math.round(electricityBill * 0.14);
  const dieselCO2 = Math.round(dieselLiters * 2.68);
  const cookingCO2 = Math.round(cookingFuelAmount * 1.9);
  const studentCO2 = Math.round(Math.max(0, students) * transportFactor * 12);
  const wasteCO2 = Math.round(wasteBags * 0.85);

  const totalCO2 = electricityCO2 + dieselCO2 + cookingCO2 + studentCO2 + wasteCO2;
  const biggestEntry = [
    { key: 'energy' as const, label: 'Energy', value: electricityCO2 + dieselCO2 },
    { key: 'cooking' as const, label: 'Cooking', value: cookingCO2 },
    { key: 'transport' as const, label: 'Transport', value: studentCO2 },
    { key: 'waste' as const, label: 'Waste', value: wasteCO2 },
  ].sort((a, b) => b.value - a.value)[0];

  return {
    totalCO2,
    electricityCO2,
    dieselCO2,
    cookingCO2,
    studentCO2,
    wasteCO2,
    electricityPercent: totalCO2 > 0 ? Math.round(((electricityCO2 + dieselCO2) / totalCO2) * 100) : 0,
    cookingPercent: totalCO2 > 0 ? Math.round((cookingCO2 / totalCO2) * 100) : 0,
    wastePercent: totalCO2 > 0 ? Math.round((wasteCO2 / totalCO2) * 100) : 0,
    biggestSource: biggestEntry.key,
    biggestSourceLabel: biggestEntry.label,
  };
}

export function saveMonthlyData(formData: MonthlyDataForm): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(formData));
}

void EMISSION_FACTORS;

export function ensureMvpAnalysis(profile: SchoolProfile | null): MvpAnalysisBundle {
  const emissions = buildEmissions(profile);
  const archetype = normalizeArchetype(profile?.archetype);
  return {
    profile,
    emissions,
    recommendations: getFallbackRecommendations(archetype),
  };
}

export async function fetchRecommendationsWithAI(
  profile: SchoolProfile | null,
  emissions: EmissionSummary
): Promise<RecommendationItem[]> {
  const archetype = normalizeArchetype(profile?.archetype);
  const request: AIRecommendationRequest = {
    schoolProfile: profile,
    emissions,
    archetype,
  };

  const response = await callAIForRecommendations(request);
  return response?.recommendations || getFallbackRecommendations(archetype);
}