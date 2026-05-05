import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function Verification() {
  const { t } = useLanguage();
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<'pending' | 'review' | 'verified'>('pending');

  const handleSubmit = () => {
    setStatus('review');
    setTimeout(() => setStatus('verified'), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('verify_reduction')}</h1>
        <p className="text-muted-foreground">Submit proof to verify your carbon reduction claims</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{t('upload_before_after')}</h3>
              <p className="text-sm text-muted-foreground">Required for verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">Before (April 2026)</p>
              <p className="text-xs text-muted-foreground">Click to upload bill</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">After (May 2026)</p>
              <p className="text-xs text-muted-foreground">Click to upload bill</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{t('upload_action_proof')}</h3>
              <p className="text-sm text-muted-foreground">Photos of completed actions</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'LED Installation',
              'Composting Pit',
              'Tree Planting',
              'Recycling Bins',
              'Solar Panels',
              'Water Harvesting',
            ].map((action, index) => (
              <div
                key={index}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirmation"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-1"
            />
            <label htmlFor="confirmation" className="flex-1 cursor-pointer">
              <h3 className="font-medium text-foreground mb-1">{t('admin_confirmation')}</h3>
              <p className="text-sm text-muted-foreground">
                I confirm that all submitted data and proof are accurate and represent actual
                carbon reduction efforts undertaken by our school.
              </p>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-medium text-foreground mb-4">Verification Status</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'pending' ? 'bg-gray-100' : 'bg-primary'
              }`}>
                {status === 'pending' ? (
                  <Clock className="w-5 h-5 text-gray-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('pending')}</p>
                <p className="text-sm text-muted-foreground">Upload documents and submit</p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-8" />

            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'review' || status === 'verified' ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                {status === 'review' || status === 'verified' ? (
                  <Clock className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('under_review')}</p>
                <p className="text-sm text-muted-foreground">Team reviewing your submission</p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-8" />

            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'verified' ? 'bg-primary' : 'bg-gray-100'
              }`}>
                {status === 'verified' ? (
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('verified')}</p>
                <p className="text-sm text-muted-foreground">Reduction confirmed and recorded</p>
              </div>
              {status === 'verified' && (
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  Complete
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!confirmed || status !== 'pending'}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('submit_verification')}
        </button>
      </div>
    </div>
  );
}
