import { useState, type FormEvent } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router';
import { Zap, Fuel, Flame, Trash2, Upload, AlertCircle } from 'lucide-react';
import { saveMonthlyData } from '../utils/mvpPlanner';

export function DataEntry() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    electricityBill: '',
    dieselLiters: '',
    cookingFuelAmount: '',
    wasteBags: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMonthlyData(formData);
    navigate('/carbon-report');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('data_entry')}</h1>
        <p className="text-muted-foreground">Enter your school's monthly consumption data</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Electricity</h3>
              <p className="text-sm text-muted-foreground">We convert this to kWh automatically</p>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm text-foreground">{t('electricity_bill')}</label>
            <input
              type="number"
              value={formData.electricityBill}
              onChange={(e) => setFormData({ ...formData, electricityBill: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="5000"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Generator / Diesel</h3>
              <p className="text-sm text-muted-foreground">For backup power</p>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm text-foreground">{t('diesel_liters')}</label>
            <input
              type="number"
              value={formData.dieselLiters}
              onChange={(e) => setFormData({ ...formData, dieselLiters: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="20"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Cooking Fuel</h3>
              <p className="text-sm text-muted-foreground">For school meals</p>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm text-foreground">{t('cooking_amount')}</label>
            <input
              type="number"
              value={formData.cookingFuelAmount}
              onChange={(e) => setFormData({ ...formData, cookingFuelAmount: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="15"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Waste</h3>
              <p className="text-sm text-muted-foreground">Approximate bags per week</p>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm text-foreground">{t('waste_bags')}</label>
            <div className="flex gap-3 mb-4">
              {[
                { size: 'Small', bags: '5-10', img: '🛍️' },
                { size: 'Medium', bags: '10-20', img: '🗑️' },
                { size: 'Large', bags: '20+', img: '🚮' }
              ].map((option) => (
                <button
                  key={option.size}
                  type="button"
                  onClick={() => setFormData({ ...formData, wasteBags: option.bags })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.wasteBags === option.bags
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.img}</div>
                  <div className="text-sm font-medium">{option.size}</div>
                  <div className="text-xs text-muted-foreground">{option.bags}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Bill Upload</h3>
              <p className="text-sm text-muted-foreground">Required for verification</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground mb-1">{t('upload_bill')}</p>
            <p className="text-xs text-muted-foreground">Click to browse or drag and drop</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Make sure all data is accurate. This will be used to calculate your carbon footprint and track progress.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-medium hover:shadow-lg transition-all"
        >
          {t('calculate_carbon')}
        </button>
      </form>
    </div>
  );
}
