import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { saveSchoolProfile } from '../utils/schoolSession';

const NEPAL_DISTRICTS = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara', 'Bardiya', 'Bhaktapur',
  'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula', 'Dhading', 'Dhankuta', 'Dhanusa', 'Dolakha',
  'Dolpa', 'Doti', 'Gorkha', 'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot',
  'Kanchanpur', 'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung', 'Mahottari',
  'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalparasi East', 'Nawalparasi West', 'Nuwakot', 'Okhaldhunga',
  'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap', 'Rasuwa', 'Rautahat', 'Rolpa', 'Rukum East',
  'Rukum West', 'Rupandehi', 'Salyan', 'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu',
  'Sunsari', 'Surkhet', 'Syangja', 'Tanahu', 'Taplejung', 'Terhathum', 'Udayapur'
];

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

export function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    district: '',
    province: '',
    students: '',
    teachers: '',
    electricitySource: '',
    cookingFuel: '',
    transport: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    saveSchoolProfile({
      schoolName: formData.schoolName,
      district: formData.district,
      province: formData.province,
      students: formData.students,
      teachers: formData.teachers,
      electricitySource: formData.electricitySource,
      cookingFuel: formData.cookingFuel,
      transport: formData.transport,
      archetype: getArchetype(),
    });
    navigate('/dashboard');
  };

  const getArchetype = () => {
    const studentsCount = parseInt(formData.students) || 0;
    if (studentsCount < 100) return t('remote');
    if (studentsCount < 500) return t('semi_urban');
    return t('urban');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">{t('registration')}</h1>
            <span className="text-sm text-muted-foreground">
              {t('step')} {step} {t('of')} 3
            </span>
          </div>

          <div className="relative">
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-foreground">{t('school_name')}</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter school name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-foreground">{t('district')}</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select district</option>
                  {NEPAL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-foreground">{t('province')}</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-foreground">{t('students_count')}</label>
                <input
                  type="number"
                  value={formData.students}
                  onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground">{t('teachers_count')}</label>
                <input
                  type="number"
                  value={formData.teachers}
                  onChange={(e) => setFormData({ ...formData, teachers: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-foreground">{t('electricity_source')}</label>
              <div className="grid grid-cols-2 gap-3">
                {['grid', 'generator', 'solar', 'none'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, electricitySource: option })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.electricitySource === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-foreground">{t('cooking_fuel')}</label>
              <div className="grid grid-cols-2 gap-3">
                {['wood', 'lpg', 'kerosene', 'solar', 'none'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, cookingFuel: option })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.cookingFuel === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-foreground">{t('transport')}</label>
              <div className="grid grid-cols-2 gap-3">
                {['walking', 'school_bus', 'public_transport', 'mixed'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, transport: option })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.transport === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary rounded-xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('archetype')}</h2>
              <div className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full text-lg font-medium mb-4">
                {getArchetype()}
              </div>
              <p className="text-muted-foreground">
                Based on your school's profile, we've classified it as {getArchetype().toLowerCase()}.
                This helps us provide tailored recommendations and fair comparisons.
              </p>
            </div>

            <div className="bg-accent rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-3">School Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('school_name')}:</span>
                  <span className="text-foreground font-medium">{formData.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('district')}:</span>
                  <span className="text-foreground font-medium">{formData.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('students_count')}:</span>
                  <span className="text-foreground font-medium">{formData.students}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('back')}
            </button>
          )}

          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
          >
            {step === 3 ? t('submit') : t('next')}
            {step < 3 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
