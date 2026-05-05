import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { ChevronRight, TrendingDown, DollarSign, Zap } from 'lucide-react';

const recommendations = [
  {
    id: 1,
    title: 'Install Improved Cookstove',
    co2Saved: 85,
    cost: 25000,
    difficulty: 'medium',
    description: 'Replace traditional stoves with fuel-efficient cookstoves'
  },
  {
    id: 2,
    title: 'Start Composting Pit',
    co2Saved: 40,
    cost: 8000,
    difficulty: 'easy',
    description: 'Convert organic waste into compost for school garden'
  },
  {
    id: 3,
    title: 'Organize Walking Groups',
    co2Saved: 120,
    cost: 0,
    difficulty: 'easy',
    description: 'Encourage students to walk together to school'
  },
  {
    id: 4,
    title: 'Install Solar Panels',
    co2Saved: 200,
    cost: 150000,
    difficulty: 'hard',
    description: 'Generate clean electricity from solar energy'
  },
  {
    id: 5,
    title: 'LED Light Replacement',
    co2Saved: 65,
    cost: 35000,
    difficulty: 'medium',
    description: 'Replace all traditional bulbs with LED lights'
  },
  {
    id: 6,
    title: 'Rainwater Harvesting',
    co2Saved: 30,
    cost: 45000,
    difficulty: 'medium',
    description: 'Collect and store rainwater for non-drinking purposes'
  },
];

export function Recommendations() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === 'all') return true;
    return rec.difficulty === filter;
  });

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">{t('actions_for_school')}</h1>
            <p className="text-muted-foreground">
              Tailored recommendations for <span className="text-primary font-medium">{t('urban')}</span> schools
            </p>
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
                    {rec.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('expected_saved')}</p>
                      <p className="text-sm font-semibold text-foreground">{rec.co2Saved} kg/month</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('cost')}</p>
                      <p className="text-sm font-semibold text-foreground">
                        NPR {rec.cost === 0 ? 'Free' : rec.cost.toLocaleString()}
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
