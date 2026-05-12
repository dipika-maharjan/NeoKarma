import type { SchoolProfile } from './schoolSession';
import type { EmissionSummary, RecommendationItem } from './mvpPlanner';

export interface AIRecommendationRequest {
  schoolProfile: SchoolProfile | null;
  emissions: EmissionSummary;
  archetype: 'remote' | 'semiUrban' | 'urban';
}

export interface AIRecommendationResponse {
  recommendations: RecommendationItem[];
  actionPlan: {
    month1: { title_en: string; title_np: string; tasks: string[] };
    month2: { title_en: string; title_np: string; tasks: string[] };
    month3: { title_en: string; title_np: string; tasks: string[] };
  };
}

// Fallback recommendations by archetype (for offline/API failure scenarios)
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
      reason_en: 'Wood burning is the primary emissions source in remote schools. An improved cookstove reduces fuel consumption by 50%.',
      reason_np: 'दुर्गम विद्यालयमा दाउरा जलाउने प्रमुख स्रोत हो। सुधारिएको चुलोले इन्धन खपत ५०% कम गर्छ।',
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
      reason_en: 'Kerosene lamps are common in remote areas. Solar lanterns replace them entirely.',
      reason_np: 'दुर्गम क्षेत्रमा मट्टीतेलको बत्ती साधारण हो। सौर्य बत्तीले यसलाई सम्पूर्ण रूपमा प्रतिस्थापन गर्छ।',
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
      reason_en: 'Most students already walk to school. Organizing safe groups strengthens this habit.',
      reason_np: 'अधिकांश विद्यार्थी स्कुल हिँडेर आउँछन्। सुरक्षित समूह संगठन गर्दा यो बानी मजबूत हुन्छ।',
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
      reason_en: 'Electricity is the main emissions driver in semi-urban schools. LED conversion is immediate and high-impact.',
      reason_np: 'अर्ध-सहरी विद्यालयमा बिजुली मुख्य स्रोत हो। एलईडी रूपान्तरण तत्काल र उच्च प्रभाव दिन्छ।',
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
      reason_en: 'Food waste generates methane in landfills. Composting redirects this into soil.',
      reason_np: 'खाना फोहोर ल्यान्डफिलमा मिथेन बनाउँछ। कम्पोस्टिङ यसलाई माटोमा परिणत गर्छ।',
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
      reason_en: 'Many students use motorized transport unnecessarily. Safe walking routes encourage modal shift.',
      reason_np: 'धेरै विद्यार्थी अनावश्यक गाडी प्रयोग गर्छन्। सुरक्षित हिँडाइ मार्गले परिवहन परिवर्तन प्रोत्साहित गर्छ।',
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
      reason_en: 'Urban schools have suitable roofs and load profiles for solar. This is the highest-impact intervention.',
      reason_np: 'सहरी विद्यालयका छत र लोड सौर्यका लागि उपयुक्त हुन्छ। यो सबैभन्दा उच्च प्रभाव हस्तक्षेप हो।',
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
      reason_en: 'School buses use significant diesel. Route clustering reduces trips without major spending.',
      reason_np: 'स्कुल बस यात्रा डिजेल खपत गर्छ। मार्ग समूहीकरण ठूलो खर्च बिना यात्रा घटाउँछ।',
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
      reason_en: 'Unnecessary lighting and AC use wastes energy. A daily policy reduces waste significantly.',
      reason_np: 'अनावश्यक बत्ती र एसी खपत बर्बाद गर्छ। दैनिक नीति उल्लेखनीय रूपमा बचत गर्छ।',
    },
  ],
};

/**
 * Generate a prompt for Claude to create context-aware recommendations
 */
function generateAIPrompt(request: AIRecommendationRequest): string {
  const { schoolProfile, emissions, archetype } = request;

  const archetypeLabel = archetype === 'remote' ? 'Remote' : archetype === 'semiUrban' ? 'Semi-Urban' : 'Urban';
  const biggestCategory = emissions.biggestSourceLabel;
  const biggestPercent = 
    emissions.biggestSource === 'energy' ? emissions.electricityPercent :
    emissions.biggestSource === 'cooking' ? emissions.cookingPercent :
    emissions.biggestSource === 'transport' ? Math.round((emissions.studentCO2 * 0.7 / emissions.totalCO2) * 100) :
    emissions.wastePercent;

  return `You are a climate action advisor for schools in Nepal. Generate exactly 3 specific recommendations for this school based on their emissions profile and context.

SCHOOL CONTEXT:
- Archetype: ${archetypeLabel} (This matters for cost and feasibility)
- School: ${schoolProfile?.schoolName || 'Unknown'}
- District: ${schoolProfile?.district || 'Unknown'}
- Province: ${schoolProfile?.province || 'Unknown'}
- Students: ${schoolProfile?.students || 'Unknown'}
- Teachers: ${schoolProfile?.teachers || 'Unknown'}
- Electricity source: ${schoolProfile?.electricitySource || 'Unknown'}
- Cooking fuel: ${schoolProfile?.cookingFuel || 'Unknown'}
- Transport: ${schoolProfile?.transport || 'Unknown'}

THIS MONTH'S EMISSIONS:
- Total CO2: ${emissions.totalCO2} kg
- Biggest source: ${biggestCategory} (${biggestPercent}%)
  - Energy: ${emissions.electricityCO2} kg (${emissions.electricityPercent}%)
  - Cooking: ${emissions.cookingCO2} kg (${emissions.cookingPercent}%)
  - Transport: ${Math.round(emissions.studentCO2 * 0.7)} kg (${Math.round((emissions.studentCO2 * 0.7 / emissions.totalCO2) * 100)}%)
  - Waste: ${emissions.wasteCO2} kg (${emissions.wastePercent}%)

REQUIREMENTS FOR RECOMMENDATIONS:
1. Rank by CO2 impact (highest savings first)
2. Be context-aware:
   - For remote areas: recommend cheap, locally available solutions first
   - For semi-urban: balance cost and impact
   - For urban: can recommend higher-cost solutions with funding access
3. If biggest source is cooking and archetype is remote → first recommendation MUST be about improved cookstove
4. If biggest source is energy → first recommendation MUST be about electricity
5. If transport is significant → include a transport recommendation
6. If waste > 15% → include waste management
7. Each reason_en must be specific to THIS school's data, not generic

Return valid JSON with this structure (no markdown, just JSON):
{
  "recommendations": [
    {
      "title_en": "Action name",
      "title_np": "कार्य नाम",
      "co2_saved_kg": <number>,
      "cost_npr": "X,XXX-Y,YYY or Free or Funding available",
      "difficulty": "Easy|Medium|Hard",
      "impact": "Low|Medium|High|Very High",
      "category": "energy|cooking|transport|waste",
      "reason_en": "One sentence specific to THIS school explaining why this action fits their situation",
      "reason_np": "एक वाक्य यस विद्यालयको स्थिति समझाउँदै"
    }
  ],
  "actionPlan": {
    "month1": {
      "title_en": "Awareness and Setup",
      "title_np": "जागरूकता र तयारी",
      "tasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"]
    },
    "month2": {
      "title_en": "Implementation and Tracking",
      "title_np": "कार्यान्वयन र अनुगमन",
      "tasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"]
    },
    "month3": {
      "title_en": "Verification and Re-evaluation",
      "title_np": "प्रमाणीकरण र पुनर्मूल्याङ्कन",
      "tasks": ["Week 1 task", "Week 2 task", "Week 3 task", "Week 4 task"]
    }
  }
}`;
}

/**
 * Call Claude API to generate context-aware recommendations
 */
export async function callAIForRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse | null> {
  try {
    const prompt = generateAIPrompt(request);
    
    // Call Anthropic API (requires API key in environment)
    const apiKey = typeof globalThis !== 'undefined' ? (globalThis as { __anthropicApiKey?: string }).__anthropicApiKey : undefined;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('AI API call failed:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    // Extract JSON from response (Claude might add markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from AI response');
      return null;
    }

    const parsed: AIRecommendationResponse = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.recommendations || !parsed.actionPlan) {
      console.warn('Invalid AI response structure');
      return null;
    }

    // Ensure IDs are set
    parsed.recommendations = parsed.recommendations.map((r, idx) => ({
      ...r,
      id: idx + 1,
    }));

    return parsed;
  } catch (error) {
    console.error('Error calling AI API:', error);
    return null;
  }
}

/**
 * Get fallback recommendations for an archetype
 */
export function getFallbackRecommendations(archetype: 'remote' | 'semiUrban' | 'urban'): RecommendationItem[] {
  return fallbackRecommendationsByArchetype[archetype];
}
