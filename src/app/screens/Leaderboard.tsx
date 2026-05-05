import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';

const leaderboardData = {
  my_province: [
    { rank: 1, school: 'Shree Jana Jyoti School', district: 'Kathmandu', improvement: 42, badge: 'gold' },
    { rank: 2, school: 'Everest Secondary', district: 'Lalitpur', improvement: 38, badge: 'silver' },
    { rank: 3, school: 'Kathmandu Model', district: 'Kathmandu', improvement: 26, badge: 'bronze', highlight: true },
    { rank: 4, school: 'Valley View School', district: 'Bhaktapur', improvement: 24, badge: '' },
    { rank: 5, school: 'Sunrise Academy', district: 'Kathmandu', improvement: 21, badge: '' },
    { rank: 6, school: 'Green Valley School', district: 'Lalitpur', improvement: 19, badge: '' },
    { rank: 7, school: 'Mountain Peak', district: 'Bhaktapur', improvement: 17, badge: '' },
    { rank: 8, school: 'River Side School', district: 'Kathmandu', improvement: 15, badge: '' },
  ],
  my_archetype: [
    { rank: 1, school: 'Metropolitan School', district: 'Pokhara', improvement: 45, badge: 'gold' },
    { rank: 2, school: 'City Central School', district: 'Biratnagar', improvement: 39, badge: 'silver' },
    { rank: 3, school: 'Kathmandu Model', district: 'Kathmandu', improvement: 26, badge: 'bronze', highlight: true },
    { rank: 4, school: 'Urban Excellence', district: 'Dharan', improvement: 23, badge: '' },
    { rank: 5, school: 'Central Academy', district: 'Butwal', improvement: 20, badge: '' },
  ],
  all_nepal: [
    { rank: 12, school: 'Himalayan Heights', district: 'Mustang', improvement: 58, badge: 'gold' },
    { rank: 23, school: 'Remote Valley School', district: 'Humla', improvement: 52, badge: 'silver' },
    { rank: 34, school: 'Mountain View', district: 'Dolpa', improvement: 48, badge: 'bronze' },
    { rank: 45, school: 'Kathmandu Model', district: 'Kathmandu', improvement: 26, badge: '', highlight: true },
    { rank: 56, school: 'Lowland School', district: 'Jhapa', improvement: 24, badge: '' },
  ],
};

export function Leaderboard() {
  const { t } = useLanguage();
  const [view, setView] = useState<'my_province' | 'my_archetype' | 'all_nepal'>('my_province');

  const currentData = leaderboardData[view];
  const highlightedSchool = currentData.find(s => s.highlight);

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'gold':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'silver':
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 'bronze':
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('leaderboard')}</h1>
        <p className="text-muted-foreground">Compare your school's performance</p>
      </div>

      {highlightedSchool && (
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-semibold mb-2">Great Progress!</h2>
          <p className="text-lg opacity-90 mb-4">
            You improved <span className="font-bold">{highlightedSchool.improvement}%</span> —
            Top {highlightedSchool.rank} in {view === 'my_province' ? 'Bagmati Province' : view === 'my_archetype' ? 'Urban Schools' : 'Nepal'}!
          </p>
          <div className="inline-block bg-white/20 rounded-lg px-6 py-2">
            <span className="text-sm">Keep up the excellent work!</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('my_province')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'my_province'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('my_province')}
          </button>
          <button
            onClick={() => setView('my_archetype')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'my_archetype'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('my_archetype')}
          </button>
          <button
            onClick={() => setView('all_nepal')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'all_nepal'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('all_nepal')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('rank')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">School Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('district')}</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('improvement')} %</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('badge')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentData.map((school) => (
                <tr
                  key={school.rank}
                  className={`transition-colors ${
                    school.highlight
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      school.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : school.rank === 2
                        ? 'bg-gray-100 text-gray-700'
                        : school.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-accent text-foreground'
                    }`}>
                      {school.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${school.highlight ? 'text-primary' : 'text-foreground'}`}>
                      {school.school}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{school.district}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">{school.improvement}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getBadgeIcon(school.badge)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-900">{t('fair_note')}</p>
      </div>
    </div>
  );
}
