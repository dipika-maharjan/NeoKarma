import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TreePine, Droplets, Car, TrendingDown } from 'lucide-react';

export function CarbonReport() {
  const { t } = useLanguage();

  const data = [
    { name: 'Electricity', value: 215, percent: 63 },
    { name: 'Transport', value: 87, percent: 25 },
    { name: 'Waste', value: 30, percent: 9 },
    { name: 'Cooking', value: 10, percent: 3 },
  ];

  const colors = ['#dc2626', '#f97316', '#fbbf24', '#3B7A2B'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('carbon_report')}</h1>
        <p className="text-muted-foreground">Your school's carbon footprint analysis</p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8 text-center">
        <h2 className="text-lg opacity-90 mb-2">{t('total_co2')}</h2>
        <div className="flex items-baseline justify-center gap-3 mb-4">
          <span className="text-6xl font-semibold">342</span>
          <span className="text-2xl opacity-90">{t('kg_co2')}</span>
        </div>
        <div className="inline-block bg-white/20 rounded-lg px-6 py-2">
          <span className="text-sm">May 2026</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="font-medium text-foreground mb-4">Breakdown by Category</h3>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <div key={item.name} className="text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: colors[index] }} />
              <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
              <p className="text-lg font-semibold text-foreground">{item.percent}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">{t('biggest_issue')}: Electricity (63%)</h3>
            <p className="text-sm text-amber-800">
              Your electricity consumption is the main contributor to carbon emissions.
              Consider switching to solar or reducing usage during peak hours.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="font-medium text-foreground mb-4">{t('emotional_impact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <TreePine className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">89</p>
            <p className="text-sm text-muted-foreground">Trees needed to absorb this CO₂</p>
          </div>
          <div className="text-center p-4">
            <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">12,500</p>
            <p className="text-sm text-muted-foreground">Liters of water equivalent impact</p>
          </div>
          <div className="text-center p-4">
            <Car className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">1,280</p>
            <p className="text-sm text-muted-foreground">km driven by car equivalent</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-medium text-foreground mb-4">{t('before_after')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-red-50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Before (April 2026)</p>
            <p className="text-4xl font-semibold text-foreground mb-1">425</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">After (May 2026)</p>
            <p className="text-4xl font-semibold text-primary mb-1">342</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 text-primary">
          <TrendingDown className="w-6 h-6" />
          <span className="text-2xl font-semibold">-19.5%</span>
          <span className="text-muted-foreground">reduction</span>
        </div>
      </div>
    </div>
  );
}
