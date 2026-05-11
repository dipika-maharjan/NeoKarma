import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router';
import { Zap, Fuel, Flame, Trash2, Upload, AlertCircle } from 'lucide-react';

export function DataEntry() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    electricityBill: '',
    dieselLiters: '',
    cookingFuelAmount: '',
    wasteBags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/carbon-report');
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('data_entry')}</h1>
      <p className="text-muted-foreground mb-6">Enter your school's monthly consumption data</p>
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Electricity */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Electricity</h3>
              <p className="text-xs text-muted-foreground">We convert this to kWh automatically</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-foreground">{t('electricity_bill')}</label>
            <input
              type="number"
              value={formData.electricityBill}
              onChange={(e) => setFormData({ ...formData, electricityBill: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="5000"
            />
          </div>

          {/* Generator / Diesel */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Generator / Diesel</h3>
              <p className="text-xs text-muted-foreground">For backup power</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-foreground">{t('diesel_liters')}</label>
            <input
              type="number"
              value={formData.dieselLiters}
              onChange={(e) => setFormData({ ...formData, dieselLiters: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="20"
            />
          </div>

          {/* Cooking Fuel */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Cooking Fuel</h3>
              <p className="text-xs text-muted-foreground">For school meals</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-foreground">{t('cooking_amount')}</label>
            <input
              type="number"
              value={formData.cookingFuelAmount}
              onChange={(e) => setFormData({ ...formData, cookingFuelAmount: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="15"
            />
          </div>

          {/* Waste */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Waste</h3>
              <p className="text-xs text-muted-foreground">Approximate bags per week</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-foreground">{t('waste_bags')}</label>
            <div className="flex gap-2 mb-2">
              {[
                { size: 'Small', bags: '5-10', img: '🛍️' },
                { size: 'Medium', bags: '10-20', img: '🗑️' },
                { size: 'Large', bags: '20+', img: '🚮' }
              ].map((option) => (
                <button
                  key={option.size}
                  type="button"
                  onClick={() => setFormData({ ...formData, wasteBags: option.bags })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    formData.wasteBags === option.bags
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.img}</div>
                  <div className="text-xs font-medium">{option.size}</div>
                  <div className="text-xs text-muted-foreground">{option.bags}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bill Upload */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Bill Upload</h3>
              <p className="text-xs text-muted-foreground">Required for verification</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer mb-4">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-foreground mb-1">{t('upload_bill')}</p>
            <p className="text-xs text-muted-foreground">Click to browse or drag and drop</p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Make sure all data is accurate. This will be used to calculate your carbon footprint and track progress.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:shadow-lg transition-all"
          >
            {t('calculate_carbon')}
          </button>
        </form>
      </div>
    </div>
  );
}
