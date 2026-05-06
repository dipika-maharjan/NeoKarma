import { useLanguage } from '../components/LanguageContext';
import { MapPin, TrendingDown, Users, Award } from 'lucide-react';

const schools = [
  { name: 'Shree Jana Jyoti School', district: 'Kathmandu', co2Reduced: 1250, actions: 12, resources: 'NPR 45,000', supportedBy: 'WWF Nepal' },
  { name: 'Everest Secondary School', district: 'Lalitpur', co2Reduced: 980, actions: 9, resources: 'NPR 38,000', supportedBy: 'AEPC' },
  { name: 'Himalayan Model School', district: 'Bhaktapur', co2Reduced: 875, actions: 11, resources: 'NPR 42,000', supportedBy: 'Municipality' },
  { name: 'Green Valley School', district: 'Pokhara', co2Reduced: 720, actions: 8, resources: 'NPR 35,000', supportedBy: 'WWF Nepal' },
  { name: 'Sunrise Academy', district: 'Chitwan', co2Reduced: 650, actions: 7, resources: 'NPR 28,000', supportedBy: 'AEPC' },
  { name: 'Mountain View School', district: 'Dhading', co2Reduced: 540, actions: 6, resources: 'NPR 25,000', supportedBy: 'Climate Fund' },
  { name: 'River Valley School', district: 'Banke', co2Reduced: 490, actions: 5, resources: 'NPR 22,000', supportedBy: 'Municipality' },
  { name: 'Peaceful School', district: 'Surkhet', co2Reduced: 420, actions: 6, resources: 'NPR 20,000', supportedBy: 'WWF Nepal' },
];

const sponsors = [
  { name: 'WWF Nepal', logo: '🐼' },
  { name: 'AEPC', logo: '☀️' },
  { name: 'Climate Fund', logo: '🌍' },
  { name: 'Municipality', logo: '🏛️' },
];

export function ImpactLedger() {
  const { t } = useLanguage();
  const totalCO2 = schools.reduce((sum, school) => sum + school.co2Reduced, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold mb-2">Harit Pathshala</h1>
          <p className="text-lg opacity-90">Nepal School Impact Tracker</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8 text-center">
          <h2 className="text-lg opacity-90 mb-3">{t('total_reduced')}</h2>
          <div className="flex items-baseline justify-center gap-3 mb-4">
            <span className="text-6xl font-semibold">{totalCO2.toLocaleString()}</span>
            <span className="text-2xl opacity-90">{t('kg_co2')}</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{schools.length} {t('active_schools')}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span>24% average reduction</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <h3 className="font-medium text-foreground mb-4">Nepal School Map</h3>
          <div className="relative bg-accent rounded-xl h-64 flex items-center justify-center">
            <svg viewBox="0 0 600 300" className="w-full h-full">
              <path
                d="M50,150 L100,120 L150,140 L200,100 L250,110 L300,90 L350,120 L400,100 L450,130 L500,110 L550,140 L550,250 L50,250 Z"
                fill="#e8f5e3"
                stroke="#3B7A2B"
                strokeWidth="2"
              />
              {[
                { x: 150, y: 150 },
                { x: 250, y: 130 },
                { x: 350, y: 140 },
                { x: 180, y: 180 },
                { x: 280, y: 170 },
                { x: 400, y: 160 },
                { x: 320, y: 200 },
                { x: 450, y: 180 }
              ].map((point, i) => (
                <g key={i}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="#3B7A2B"
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                  <MapPin
                    x={point.x - 8}
                    y={point.y - 20}
                    width="16"
                    height="16"
                    className="text-primary"
                  />
                </g>
              ))}
            </svg>
            <div className="absolute bottom-4 right-4 bg-white rounded-lg px-4 py-2 text-sm shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">Active Schools</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">School Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('district')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">CO₂ Reduced (kg)</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('actions_taken')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('resources_received')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">{t('supported_by')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schools.map((school, index) => (
                  <tr key={index} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{school.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{school.district}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary">{school.co2Reduced.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{school.actions}</td>
                    <td className="px-6 py-4 text-muted-foreground">{school.resources}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {school.supportedBy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-foreground">{t('fund_pool')}: NPR 2,45,000</h3>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">{t('contributed_by')}:</span>
            {sponsors.map((sponsor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg"
              >
                <span className="text-2xl">{sponsor.logo}</span>
                <span className="text-sm font-medium text-foreground">{sponsor.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
