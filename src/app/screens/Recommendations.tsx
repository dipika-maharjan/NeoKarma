import { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Sprout, Leaf, Users, Zap, Trash2, X } from 'lucide-react';
import cookstoveImg from '../../assets/recommendations/cookstove.png';
import compostImg from '../../assets/recommendations/compost.png';
import walkingImg from '../../assets/recommendations/walking.png';
import solarLanternImg from '../../assets/recommendations/solar-lantern.png';
import ledReplacementImg from '../../assets/recommendations/led-replacement.png';
import rooftopSolarImg from '../../assets/recommendations/rooftop-solar.png';
import busRouteImg from '../../assets/recommendations/bus-route.png';
import energyAuditImg from '../../assets/recommendations/energy-audit.png';
import { getCurrentSchoolProfile } from '../utils/schoolSession';
import { ensureMvpAnalysis, type RecommendationItem, type EmissionSummary } from '../utils/mvpPlanner';

const getRecommendationImage = (rec: RecommendationItem) => {
  const title = (rec.title_en || '').toLowerCase();
  const cat = String(rec.category || '').toLowerCase();
  if (title.includes('solar lantern') || title.includes('lantern')) {
    return { src: solarLanternImg, alt: 'solar lantern' };
  }
  if (title.includes('led') || title.includes('light replacement') || title.includes('bulb')) {
    return { src: ledReplacementImg, alt: 'LED replacement' };
  }
  if (title.includes('rooftop solar') || title.includes('solar readiness') || title.includes('roof')) {
    return { src: rooftopSolarImg, alt: 'rooftop solar' };
  }
  if (title.includes('bus route') || title.includes('route optimization') || title.includes('bus')) {
    return { src: busRouteImg, alt: 'bus route' };
  }
  if (title.includes('energy audit') || title.includes('audit')) {
    return { src: energyAuditImg, alt: 'energy audit' };
  }
  if (title.includes('cook') || title.includes('stove') || cat === 'cooking') {
    return { src: cookstoveImg, alt: 'cookstove' };
  }
  if (title.includes('compost') || title.includes('composting') || cat === 'waste') {
    return { src: compostImg, alt: 'compost' };
  }
  if (title.includes('walk') || title.includes('walking') || title.includes('bicycle') || cat === 'transport') {
    return { src: walkingImg, alt: 'walking' };
  }

  switch (rec.category) {
    case 'energy':
      return { fallback: <Zap className="h-12 w-12 text-emerald-700" /> };
    case 'cooking':
      return { fallback: <Sprout className="h-12 w-12 text-emerald-700" /> };
    case 'transport':
      return { fallback: <Users className="h-12 w-12 text-emerald-700" /> };
    case 'waste':
      return { fallback: <Trash2 className="h-12 w-12 text-emerald-700" /> };
    default:
      return { fallback: <Leaf className="h-12 w-12 text-emerald-700" /> };
  }
};

export function Recommendations() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [emissions, setEmissions] = useState<EmissionSummary | null>(null);
  const [schoolArchetype, setSchoolArchetype] = useState('');
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const profile = getCurrentSchoolProfile();
    const analysis = ensureMvpAnalysis(profile);
    setRecommendations(analysis.recommendations);
    setEmissions(analysis.emissions);
    setSchoolArchetype(profile?.archetype || 'Your School');
  }, []);

  const filteredRecommendations = recommendations.filter(
    (item) => filter === 'all' || item.difficulty.toLowerCase() === filter
  );

  const handleSeeDetails = (rec: RecommendationItem) => {
    setSelectedRec(rec);
  };

  const handleViewMoreActions = () => {
    setShowMore(true);
  };

  const difficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCost = (cost: string) => {
    if (!cost) return 'NPR -';
    const trimmed = cost.toString().trim();
    if (trimmed.toLowerCase() === 'free') return 'Free';
    // If cost already contains non-numeric range, just prefix NPR
    return `NPR ${trimmed}`;
  };

  if (!recommendations.length) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="font-medium text-foreground">Generating tailored recommendations...</p>
          <p className="mt-1 text-sm text-muted-foreground">Reading the saved school profile and carbon analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header with Circle Badge */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 font-bold text-white text-lg">
            7
          </div>
          <h1 className="text-2xl font-bold text-foreground">Recommendation Screen</h1>
        </div>

        {/* Main Title and Archetype */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-foreground">Recommended Actions for Your School</h2>
            <div className="text-sm font-semibold text-gray-700 text-right">
              <div>Archetype: <span className="capitalize">{schoolArchetype}</span></div>
              {emissions && (
                <div className="mt-1 text-sm text-gray-600">Ranked by: <span className="font-semibold text-gray-800">{emissions.biggestSourceLabel}</span> — <span className="font-semibold text-gray-800">{emissions.totalCO2} kg CO₂</span> / month</div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            ['all', 'All'],
            ['easy', 'Easy'],
            ['medium', 'Medium'],
            ['hard', 'Hard'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`rounded px-4 py-2 font-semibold transition-all ${
                filter === value
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* Icon Section */}
                  <div className="flex h-40 items-center justify-center border-b border-slate-100 bg-white p-8">
                    {(() => {
                      const asset = getRecommendationImage(rec);
                      return asset.src ? (
                        <img
                          src={asset.src}
                          alt={asset.alt}
                          className="h-28 w-28 object-contain"
                        />
                      ) : (
                        asset.fallback
                      );
                    })()}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 text-center">
                    {/* Title */}
                    <h3 className="text-base font-bold text-foreground mb-4">{rec.title_en}</h3>

                    {/* Stats */}
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-gray-600">
                        Saves <span className="font-semibold text-gray-800">{rec.co2_saved_kg} kg CO₂</span> / month
                      </p>
                      <p className="text-gray-600">
                        Cost: <span className="font-semibold text-gray-800">{formatCost(rec.cost_npr)}</span>
                      </p>
                      <div className="inline-block">
                        <span className={`rounded px-3 py-1 text-xs font-semibold border ${difficultyStyle(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* See Details Button */}
                    <button
                      onClick={() => handleSeeDetails(rec)}
                      className="w-full rounded bg-green-700 py-2 font-semibold text-white transition-all hover:bg-green-800"
                    >
                      See Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Actions Link */}
            <div className="text-center">
              <button
                onClick={handleViewMoreActions}
                className="text-green-700 font-semibold hover:text-green-800 transition-colors"
              >
                View More Actions
              </button>
            </div>
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center p-8 text-center">
            <div>
              <Leaf className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="font-semibold text-foreground text-lg">No recommendations found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try selecting a different difficulty level to see available actions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{selectedRec.title_en}</h2>
              <button
                onClick={() => setSelectedRec(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-600">{selectedRec.reason_en}</p>
              <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Saved:</span>
                  <span className="font-semibold text-green-700">{selectedRec.co2_saved_kg} kg/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-semibold text-gray-800">{formatCost(selectedRec.cost_npr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`font-semibold rounded px-2 py-1 text-xs border ${difficultyStyle(selectedRec.difficulty)}`}>
                    {selectedRec.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRec(null)}
              className="w-full rounded bg-green-700 py-2 font-semibold text-white hover:bg-green-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* View More Actions Modal */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">All Recommendations</h2>
              <button
                onClick={() => setShowMore(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedRec(rec);
                    setShowMore(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{rec.title_en}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason_en}</p>
                    </div>
                    <span className={`rounded px-2 py-1 text-xs font-semibold border whitespace-nowrap ml-2 ${difficultyStyle(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span className="font-semibold text-green-700">{rec.co2_saved_kg} kg CO₂/mo</span>
                    <span className="font-semibold text-gray-800">NPR {rec.cost_npr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
