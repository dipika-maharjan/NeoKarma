import { useLanguage } from '../components/LanguageContext';
import { Lock, CheckCircle, Award, Phone, ExternalLink } from 'lucide-react';

const tiers = [
  {
    level: 1,
    points: 100,
    rewards: ['Compost bins (5 units)', 'Saplings (50 trees)', 'Training materials'],
    unlocked: true
  },
  {
    level: 2,
    points: 250,
    rewards: ['Solar lamps (10 units)', 'Waste dustbins (20 units)', 'Workshop facilitation'],
    progress: 68
  },
  {
    level: 3,
    points: 500,
    rewards: ['Priority NGO consultation', 'Technical support visit', 'Advanced equipment grant'],
    unlocked: false
  },
];

const organizations = [
  {
    name: 'Nepal Climate Change Fund',
    offers: 'Grants up to NPR 100,000 for solar installations',
    contact: 'climate@ncf.gov.np'
  },
  {
    name: 'AEPC (Alternative Energy Promotion Centre)',
    offers: 'Technical support & subsidies for renewable energy',
    contact: 'info@aepc.gov.np'
  },
  {
    name: 'WWF Nepal',
    offers: 'Educational materials & biodiversity programs',
    contact: 'support@wwfnepal.org'
  },
  {
    name: 'Municipality Environment Fund',
    offers: 'Local grants for waste management & tree plantation',
    contact: 'environment@municipality.gov.np'
  },
];

export function Support() {
  const { t } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('support_available')}</h1>
        <p className="text-muted-foreground">Unlock rewards and connect with support organizations</p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg opacity-90 mb-2">Your {t('impact_points')}</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-semibold">170</span>
              <span className="text-xl opacity-90">points</span>
            </div>
          </div>
          <Award className="w-20 h-20 opacity-20" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Reward Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.level}
              className={`rounded-xl border-2 p-6 ${
                tier.unlocked
                  ? 'border-primary bg-primary/5'
                  : tier.progress
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-border bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('tier')} {tier.level}
                </h3>
                {tier.unlocked ? (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                ) : tier.progress ? (
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                    {tier.progress}%
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{tier.points} points required</p>
                {tier.progress && (
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${tier.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Rewards:</p>
                {tier.rewards.map((reward, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      tier.unlocked ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      tier.unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {reward}
                    </span>
                  </div>
                ))}
              </div>

              {tier.unlocked && (
                <button className="w-full mt-4 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:shadow-lg transition-all">
                  {t('unlocked')} - Claim Rewards
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">{t('available_orgs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((org, index) => (
            <div key={index} className="bg-white rounded-xl border border-border p-6 hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold text-foreground mb-2">{org.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{org.offers}</p>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-all">
                  <Phone className="w-4 h-4" />
                  Contact
                </button>
                <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Mentor Commitment</h3>
        <p className="text-sm text-blue-800 mb-4">{t('mentor_commitment')}</p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Sign Up as Mentor
        </button>
      </div>
    </div>
  );
}
