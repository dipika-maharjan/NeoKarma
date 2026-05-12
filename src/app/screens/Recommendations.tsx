import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import cookstoveImg from '../../assets/recommendations/cookstove.png';
import compostImg from '../../assets/recommendations/compost.png';
import walkingImg from '../../assets/recommendations/walking.png';
import solarLanternImg from '../../assets/recommendations/solar-lantern.png';
import ledReplacementImg from '../../assets/recommendations/led-replacement.png';
import rooftopSolarImg from '../../assets/recommendations/rooftop-solar.png';
import busRouteImg from '../../assets/recommendations/bus-route.png';
import energyAuditImg from '../../assets/recommendations/energy-audit.png';

import { ensureMvpAnalysis, fallbackRecommendationsByArchetype } from '../utils/mvpPlanner';
import { getCurrentSchoolProfile, upsertCurrentSchoolData } from '../utils/schoolSession';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

type RecommendationCard = {
  title: string;
  image: string;
  alt: string;
  co2: string;
  cost: string;
  difficulty: Difficulty;
  accent: string;
  reason: string;
  action: string;
};

const recommendations: RecommendationCard[] = [
  {
    title: 'Install Improved Cookstove',
    image: cookstoveImg,
    alt: 'Improved cookstove',
    co2: '175 kg CO₂ / month',
    cost: 'NPR 15,000',
    difficulty: 'Easy',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reason: 'Best for remote schools where cooking fuel is a major emissions source.',
    action: 'Replace smoky wood stoves with a cleaner, more efficient option.',
  },
  {
    title: 'Start Composting Pit',
    image: compostImg,
    alt: 'Composting pit',
    co2: '90 kg CO₂ / month',
    cost: 'NPR 3,000',
    difficulty: 'Easy',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reason: 'Turns food waste into compost and fits remote schools with waste buildup.',
    action: 'Set up a simple compost pit near the kitchen or garden.',
  },
  {
    title: 'Organize Walking Groups',
    image: walkingImg,
    alt: 'Walking groups',
    co2: '120 kg CO₂ / month',
    cost: 'Free',
    difficulty: 'Easy',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reason: 'Cuts travel emissions and works well in schools where students live nearby.',
    action: 'Group students by route and encourage safe shared walking.',
  },
  {
    title: 'Solar Lantern Pilot',
    image: solarLanternImg,
    alt: 'Solar lantern',
    co2: '210 kg CO₂ / month',
    cost: 'NPR 8,000',
    difficulty: 'Medium',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    reason: 'Useful where lanterns or backup lighting increase energy use after dark.',
    action: 'Pilot solar lighting for evening study and hostel support.',
  },
  {
    title: 'LED Replacement Drive',
    image: ledReplacementImg,
    alt: 'LED replacement',
    co2: '140 kg CO₂ / month',
    cost: 'NPR 6,500',
    difficulty: 'Medium',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    reason: 'Helps reduce electricity use without changing daily routines much.',
    action: 'Swap older bulbs with efficient LEDs room by room.',
  },
  {
    title: 'Rooftop Solar Readiness',
    image: rooftopSolarImg,
    alt: 'Rooftop solar',
    co2: '480 kg CO₂ / month',
    cost: 'NPR 75,000',
    difficulty: 'Hard',
    accent: 'bg-red-50 text-red-700 border-red-200',
    reason: 'Best long-term option for urban schools with higher electricity demand.',
    action: 'Assess roof space, daytime usage, and funding options first.',
  },
  {
    title: 'Bus Route Optimization',
    image: busRouteImg,
    alt: 'Bus route optimization',
    co2: '260 kg CO₂ / month',
    cost: 'NPR 10,000',
    difficulty: 'Medium',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    reason: 'Strong fit for urban schools where transport emissions are high.',
    action: 'Cluster pickup points so buses run fewer, fuller routes.',
  },
  {
    title: 'Energy Audit Walkthrough',
    image: energyAuditImg,
    alt: 'Energy audit',
    co2: '330 kg CO₂ / month',
    cost: 'NPR 12,000',
    difficulty: 'Hard',
    accent: 'bg-red-50 text-red-700 border-red-200',
    reason: 'Works as a diagnostic step before making larger efficiency investments.',
    action: 'Audit energy losses room-by-room and schedule fixes.',
  },
];

const filteredCards: Record<'all' | 'easy' | 'medium' | 'hard', RecommendationCard[]> = {
  all: recommendations,
  easy: recommendations.filter((item) => item.difficulty === 'Easy'),
  medium: recommendations.filter((item) => item.difficulty === 'Medium'),
  hard: recommendations.filter((item) => item.difficulty === 'Hard'),
};

function byDifficulty(cards: RecommendationCard[], filter: 'all' | 'easy' | 'medium' | 'hard') {
  if (filter === 'all') return cards;
  const difficulty = filter === 'easy' ? 'Easy' : filter === 'medium' ? 'Medium' : 'Hard';
  return cards.filter((card) => card.difficulty === difficulty);
}

function cardAccent(difficulty: Difficulty) {
  if (difficulty === 'Easy') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (difficulty === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function imageForRecommendation(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('cookstove') || normalized.includes('cooking')) return cookstoveImg;
  if (normalized.includes('compost')) return compostImg;
  if (normalized.includes('walk')) return walkingImg;
  if (normalized.includes('solar lantern') || normalized.includes('lantern')) return solarLanternImg;
  if (normalized.includes('led')) return ledReplacementImg;
  if (normalized.includes('rooftop solar') || normalized.includes('solar readiness') || normalized.includes('solar')) return rooftopSolarImg;
  if (normalized.includes('bus route') || normalized.includes('route optimization') || normalized.includes('bus')) return busRouteImg;
  if (normalized.includes('audit')) return energyAuditImg;
  return cookstoveImg;
}

// selection toggle
function toggleArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function Recommendations() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [cards, setCards] = useState<RecommendationCard[]>(filteredCards.all);
  const [basePicked, setBasePicked] = useState<RecommendationCard[]>(filteredCards.all);
  const [moreActions, setMoreActions] = useState<RecommendationCard[]>([]);
  const [profileArchetype, setProfileArchetype] = useState<string | null>(null);
  const [biggestLabel, setBiggestLabel] = useState<string | null>(null);
  const [totalCO2, setTotalCO2] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('selectedRecommendations');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Array<{ title: string }>;
      return parsed.map((p) => p.title);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Load archetype and biggestSource from localStorage if available, else compute
    let archetype = undefined;
    try {
      const rawSchool = localStorage.getItem('schoolData');
      if (rawSchool) {
        const parsed = JSON.parse(rawSchool);
        archetype = parsed?.archetype;
      }
    } catch {
      // ignore
    }

    if (!archetype) {
      const profile = getCurrentSchoolProfile();
      archetype = profile?.archetype;
    }

    let biggestSource: string | undefined;
    try {
      const rawEm = localStorage.getItem('emissionData');
      if (rawEm) {
        const parsed = JSON.parse(rawEm);
        biggestSource = parsed?.biggestSource;
      }
    } catch {
      // ignore
    }

    if (!biggestSource) {
      const profile = getCurrentSchoolProfile();
      const analysis = ensureMvpAnalysis(profile);
      biggestSource = analysis.emissions.biggestSource;
    }

    const a = String(archetype || '').toLowerCase();
    const b = String(biggestSource || '').toLowerCase();

    function pickByMapping(arche: string, source: string): RecommendationCard[] {
      // mapping rules per product spec
      if (arche.includes('remote') && source === 'cooking') {
        return recommendations.filter((r) =>
          ['Install Improved Cookstove', 'Solar Lantern Pilot', 'Organize Walking Groups'].includes(r.title)
        );
      }
      if (arche.includes('remote') && source === 'waste') {
        return recommendations.filter((r) =>
          ['Start Composting Pit', 'Organize Walking Groups', 'Solar Lantern Pilot'].includes(r.title)
        );
      }
      if (arche.includes('urban') && source === 'energy') {
        return recommendations.filter((r) =>
          ['Rooftop Solar Readiness', 'LED Replacement Drive', 'Bus Route Optimization'].includes(r.title)
        );
      }
      if (arche.includes('urban') && source === 'transport') {
        return recommendations.filter((r) =>
          ['Bus Route Optimization', 'Organize Walking Groups', 'Rooftop Solar Readiness'].includes(r.title)
        );
      }
      if (arche.includes('semi') || arche.includes('semi-urban') || arche.includes('semiurban')) {
        return recommendations.filter((r) =>
          ['LED Replacement Drive', 'Start Composting Pit', 'Organize Walking Groups'].includes(r.title)
        );
      }

      // fallback: pick top 3 by presumed impact
      return recommendations.slice(0, 3);
    }

    const picked = pickByMapping(a, b);
    const primary = picked.length ? picked : filteredCards.all.slice(0, 3);
    setBasePicked(primary);

    const archeKey: 'remote' | 'semiUrban' | 'urban' = a.includes('remote') ? 'remote' : a.includes('semi') ? 'semiUrban' : 'urban';
    const fallbackSet = fallbackRecommendationsByArchetype[archeKey] || [];
    const fallbackCards: RecommendationCard[] = fallbackSet.map((f) => ({
      title: f.title_en,
      image: imageForRecommendation(f.title_en),
      alt: f.title_en,
      co2: `${f.co2_saved_kg} kg CO₂ / month`,
      cost: f.cost_npr,
      difficulty: f.difficulty,
      accent: cardAccent(f.difficulty),
      reason: f.reason_en,
      action: f.reason_en,
    }));

    setMoreActions(fallbackCards.filter((card) => !primary.some((pickedCard) => pickedCard.title === card.title)));

    // set header values
    try {
      const profile = getCurrentSchoolProfile();
      const analysis = ensureMvpAnalysis(profile);
      setProfileArchetype(profile?.archetype || archetype || null);
      setBiggestLabel(analysis.emissions.biggestSourceLabel || biggestSource || null);
      setTotalCO2(analysis.emissions.totalCO2 || null);
    } catch {
      setProfileArchetype(archetype || null);
      setBiggestLabel(biggestSource || null);
      setTotalCO2(null);
    }
  }, [filter]);

  // derive displayed cards from basePicked + filter
  useEffect(() => {
    if (!showMore) {
      setCards(byDifficulty(basePicked, filter));
      return;
    }

    // View More adds a second section; keep primary cards unchanged in the main list.
    setCards(byDifficulty(basePicked, filter));
  }, [basePicked, filter, showMore]);

  useEffect(() => {
    // persist selected recommendations as array of objects
    try {
      const payload = selected.map((title) => {
        const item = recommendations.find((r) => r.title === title);
        return item
          ? { title: item.title, co2: item.co2, cost: item.cost, difficulty: item.difficulty }
          : { title };
      });
      localStorage.setItem('selectedRecommendations', JSON.stringify(payload));
      try {
        upsertCurrentSchoolData({ selectedRecommendations: payload });
      } catch {}
    } catch {
      // ignore
    }
  }, [selected]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
            7
          </div>
          <h1 className="text-2xl font-bold text-foreground">Recommendation Screen</h1>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">Recommended Actions for Your School</p>
              <p className="mt-1 text-sm text-muted-foreground">Archetype: <span className="font-semibold text-foreground">{profileArchetype ?? 'Unknown'}</span></p>
            </div>
            <div className="text-sm text-right text-muted-foreground">
              <p>Ranked by <span className="font-semibold text-foreground">{biggestLabel ?? 'Energy'}</span></p>
              <p><span className="font-semibold text-foreground">{totalCO2 ? `${totalCO2} kg CO₂` : '—'}</span> / month</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ['all', 'All'],
            ['easy', 'Easy'],
            ['medium', 'Medium'],
            ['hard', 'Hard'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === value
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isSelected = selected.includes(card.title);
            const isExpanded = expanded.includes(card.title);
            return (
              <div
                key={card.title}
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isSelected ? 'ring-2 ring-emerald-200' : ''}`}
              >
                <div className="flex h-44 items-center justify-center border-b border-slate-100 bg-white p-8">
                  <img src={card.image} alt={card.alt} className="h-28 w-28 object-contain" />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      Saves <span className="font-semibold text-slate-800">{card.co2}</span>
                    </p>
                    <p>
                      Cost: <span className="font-semibold text-slate-800">{card.cost}</span>
                    </p>
                    <div className="inline-flex">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${card.accent}`}>
                        {card.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setSelected((s) => toggleArray(s, card.title))}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${isSelected ? 'bg-emerald-900 hover:bg-emerald-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}
                    >
                      {isSelected ? 'Added to plan' : 'Add to plan'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => (prev.includes(card.title) ? prev.filter((t) => t !== card.title) : [...prev, card.title]));
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white"
                    >
                      {isExpanded ? 'Hide Details' : 'See Details'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 text-left text-sm text-slate-700">
                      <p className="font-semibold">Why this fits your school</p>
                      <p className="mt-1">{card.reason}</p>
                      <p className="mt-3 font-semibold">What it does</p>
                      <p className="mt-1">{card.action}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // load full archetype fallback recommendations
              try {
                setShowMore((prev) => !prev);
              } catch {
                setShowMore((prev) => !prev);
              }
            }}
            className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
          >
            {showMore ? 'Hide More Actions' : 'View More Actions'}
          </button>
        </div>

        {showMore && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">More actions to explore</h2>
              <p className="text-sm text-slate-500">These are additional options; your main recommendations stay above.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {byDifficulty(moreActions, filter).map((card) => {
                const isSelected = selected.includes(card.title);
                const isExpanded = expanded.includes(card.title);
                return (
                  <div key={card.title} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isSelected ? 'ring-2 ring-emerald-200' : ''}`}>
                    <div className="flex h-44 items-center justify-center border-b border-slate-100 bg-white p-8">
                      <img src={card.image} alt={card.alt} className="h-28 w-28 object-contain" />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>Saves <span className="font-semibold text-slate-800">{card.co2}</span></p>
                        <p>Cost: <span className="font-semibold text-slate-800">{card.cost}</span></p>
                        <div className="inline-flex">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${card.accent}`}>{card.difficulty}</span>
                        </div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={() => setSelected((s) => toggleArray(s, card.title))}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${isSelected ? 'bg-emerald-900 hover:bg-emerald-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}
                        >
                          {isSelected ? 'Added to plan' : 'Add to plan'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) => (prev.includes(card.title) ? prev.filter((t) => t !== card.title) : [...prev, card.title]));
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white"
                        >
                          {isExpanded ? 'Hide Details' : 'See Details'}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 text-left text-sm text-slate-700">
                          <p className="font-semibold">Why this fits your school</p>
                          <p className="mt-1">{card.reason}</p>
                          <p className="mt-3 font-semibold">What it does</p>
                          <p className="mt-1">{card.action}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-emerald-50/40 p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-slate-700">Selected plan is tailored for your school profile and ranked by the biggest emission source.</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
                Ready to review
              </span>
              <div className="text-sm text-slate-700">
                <div>Selected: <span className="font-semibold">{selected.length}</span></div>
                <div className="mt-1">
                  <button onClick={() => { setSelected([]); }} className="text-xs text-emerald-700 underline">Clear selection</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
