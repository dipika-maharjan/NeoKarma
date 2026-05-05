import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Footprints, Bus, Bike, Car, TreePine, Award } from 'lucide-react';

export function StudentInput() {
  const { t } = useLanguage();
  const [transport, setTransport] = useState('');
  const [plastic, setPlastic] = useState<boolean | null>(null);
  const [foodWaste, setFoodWaste] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Student Weekly Input</h1>
          <p className="text-muted-foreground">Help your school track environmental impact</p>
        </div>

        {!submitted ? (
          <div className="space-y-8">
            <div>
              <h3 className="font-medium text-foreground mb-4 text-center">{t('how_came_school')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: 'walking', icon: Footprints, label: 'Walking' },
                  { value: 'bus', icon: Bus, label: 'Bus' },
                  { value: 'bike', icon: Bike, label: 'Bicycle' },
                  { value: 'motorbike', icon: Bike, label: 'Motorbike' },
                  { value: 'car', icon: Car, label: 'Car' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTransport(option.value)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        transport === option.value
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        transport === option.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs font-medium text-center">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-4 text-center">{t('brought_plastic')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPlastic(true)}
                  className={`p-8 rounded-xl border-2 transition-all ${
                    plastic === true
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-border hover:border-red-300'
                  }`}
                >
                  <p className="text-4xl mb-2">😔</p>
                  <p className="text-lg font-medium">{t('yes')}</p>
                </button>
                <button
                  onClick={() => setPlastic(false)}
                  className={`p-8 rounded-xl border-2 transition-all ${
                    plastic === false
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-4xl mb-2">😊</p>
                  <p className="text-lg font-medium">{t('no')}</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-4 text-center">{t('wasted_food')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFoodWaste(true)}
                  className={`p-8 rounded-xl border-2 transition-all ${
                    foodWaste === true
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-border hover:border-red-300'
                  }`}
                >
                  <p className="text-4xl mb-2">🍽️</p>
                  <p className="text-lg font-medium">{t('yes')}</p>
                </button>
                <button
                  onClick={() => setFoodWaste(false)}
                  className={`p-8 rounded-xl border-2 transition-all ${
                    foodWaste === false
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-4xl mb-2">✨</p>
                  <p className="text-lg font-medium">{t('no')}</p>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!transport || plastic === null || foodWaste === null}
              className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('submit_week')}
            </button>

            <div className="bg-accent rounded-xl p-6 text-center">
              <Award className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground mb-1">
                {t('streak')} <span className="text-primary">4</span> {t('weeks_row')}
              </p>
              <p className="text-sm text-muted-foreground">Keep it up!</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <TreePine className="w-16 h-16 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your submission helps make our school greener</p>
          </div>
        )}
      </div>
    </div>
  );
}
