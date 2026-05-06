import { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { ChevronRight, TrendingDown, DollarSign, Zap, Sparkles, Target, Leaf } from 'lucide-react';
import { getCurrentSchoolProfile } from '../utils/schoolSession';
import { ensureMvpAnalysis, type RecommendationItem } from '../utils/mvpPlanner';

export function Recommendations() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [schoolLabel, setSchoolLabel] = useState('');
  const [biggestSource, setBiggestSource] = useState('');

  useEffect(() => {
    const profile = getCurrentSchoolProfile();
    const analysis = ensureMvpAnalysis(profile);
    setRecommendations(analysis.recommendations);
    setBiggestSource(analysis.emissions.biggestSourceLabel);
    setSchoolLabel(profile?.schoolName ? `${profile.schoolName} (${profile.archetype} • ${profile.district})` : 'your school');
  }, []);

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === 'all') return true;
    return rec.difficulty.toLowerCase() === filter;
  });

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-foreground font-medium">Generating tailored recommendations...</p>
          <p className="text-sm text-muted-foreground mt-1">Reading saved school and carbon data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">{t('actions_for_school')}</h1>
            <p className="text-muted-foreground">
              Tailored recommendations for <span className="text-primary font-medium">{schoolLabel}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-foreground">Biggest source</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{biggestSource || 'Energy'}</p>
            <p className="text-xs text-muted-foreground">The list is ranked around this source first.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-foreground">Recommendations</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{recommendations.length}</p>
            <p className="text-xs text-muted-foreground">Generated from your saved profile and emissions.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-foreground">Quick win</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{recommendations[0]?.title_en || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground">Lowest-friction action with strong CO₂ impact.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-border text-muted-foreground hover:border-primary'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {rec.title_en}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-1">{rec.reason_en}</p>
                <p className="text-sm text-primary/80 mb-4">{rec.title_np}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('expected_saved')}</p>
                      <p className="text-sm font-semibold text-foreground">{rec.co2_saved_kg} kg/month</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('cost')}</p>
                      <p className="text-sm font-semibold text-foreground">
                        NPR {rec.cost_npr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('difficulty')}</p>
                      <p className="text-sm font-semibold text-foreground capitalize">{rec.difficulty}</p>
                    </div>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all">
                  {t('see_details')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
