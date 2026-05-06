import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, CheckCircle, TreePine, Home, School, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <School className="h-4 w-4" />
            School setup
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <aside className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 p-8 text-white shadow-2xl lg:p-10">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <Home className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Registration</p>
                    <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{t('registration')}</h1>
                  </div>
                </div>

                <p className="max-w-md text-sm leading-6 text-emerald-50/85 lg:text-base">
                  Enter your school profile once. The same identity will carry through dashboard, carbon report, and student submissions.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    { step: '1', title: 'Basic details', desc: 'School name, district, province, and staffing.' },
                    { step: '2', title: 'School systems', desc: 'Electricity, cooking fuel, and transport profile.' },
                    { step: '3', title: 'Review and confirm', desc: 'See your archetype and finish registration.' },
                  ].map((item, index) => (
                    <div key={item.step} className={`rounded-2xl border px-4 py-4 ${step === index + 1 ? 'border-white/25 bg-white/15' : 'border-white/10 bg-white/10'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">{item.step}</div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-white/75">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Designed for fair comparisons</p>
                    <p className="text-sm text-white/75">The archetype is generated from your student count.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
            <div className="border-b border-border bg-slate-50 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Step {step} of 3</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">
                    {step === 1 ? 'Basic details' : step === 2 ? 'School information' : 'Review and confirmation'}
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {Math.round((step / 3) * 100)}% complete
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
              <div className="rounded-2xl border border-border bg-slate-50 p-5">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">{t('school_name')}</label>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter school name"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">{t('district')}</label>
                        <select
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select district</option>
                          {NEPAL_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">{t('province')}</label>
                        <select
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select province</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">{t('students_count')}</label>
                        <input
                          type="number"
                          value={formData.students}
                          onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">{t('teachers_count')}</label>
                        <input
                          type="number"
                          value={formData.teachers}
                          onChange={(e) => setFormData({ ...formData, teachers: e.target.value })}
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <label className="block mb-3 text-sm font-medium text-foreground">{t('electricity_source')}</label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {['grid', 'generator', 'solar', 'none'].map((option) => (
                            <button
                              key={option}
                              onClick={() => setFormData({ ...formData, electricitySource: option })}
                              className={`rounded-2xl border-2 bg-white p-4 transition-all ${
                                formData.electricitySource === option
                                  ? 'border-primary shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <p className="text-sm font-medium">{t(option)}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-3 text-sm font-medium text-foreground">{t('cooking_fuel')}</label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                          {['wood', 'lpg', 'kerosene', 'solar', 'none'].map((option) => (
                            <button
                              key={option}
                              onClick={() => setFormData({ ...formData, cookingFuel: option })}
                              className={`rounded-2xl border-2 bg-white p-4 transition-all ${
                                formData.cookingFuel === option
                                  ? 'border-primary shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <p className="text-sm font-medium">{t(option)}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-3 text-sm font-medium text-foreground">{t('transport')}</label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {['walking', 'school_bus', 'public_transport', 'mixed'].map((option) => (
                            <button
                              key={option}
                              onClick={() => setFormData({ ...formData, transport: option })}
                              className={`rounded-2xl border-2 bg-white p-4 transition-all ${
                                formData.transport === option
                                  ? 'border-primary shadow-md'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <p className="text-sm font-medium">{t(option)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-emerald-50 p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl">
                          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <CheckCircle className="h-4 w-4" />
                            Final review
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold text-foreground">{t('archetype')}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Based on your school's profile, we've classified it as {getArchetype().toLowerCase()}.
                            This helps us provide tailored recommendations and fair comparisons.
                          </p>
                        </div>
                        <div className="rounded-3xl border border-emerald-200 bg-white p-5 text-center shadow-sm">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">School archetype</p>
                          <div className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-lg font-semibold text-primary-foreground">
                            {getArchetype()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <h3 className="font-medium text-foreground mb-4">School Summary</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t('school_name')}:</span>
                            <span className="text-right font-medium text-foreground">{formData.schoolName || '—'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t('district')}:</span>
                            <span className="text-right font-medium text-foreground">{formData.district || '—'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t('students_count')}:</span>
                            <span className="text-right font-medium text-foreground">{formData.students || '—'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{t('teachers_count')}:</span>
                            <span className="text-right font-medium text-foreground">{formData.teachers || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="flex items-center gap-2 text-emerald-800 mb-3">
                          <ShieldCheck className="h-4 w-4" />
                          <p className="text-sm font-semibold">What happens next</p>
                        </div>
                        <div className="space-y-3 text-sm text-emerald-800/90">
                          <p>• The school profile is saved in browser storage.</p>
                          <p>• Students will submit weekly inputs under this school name.</p>
                          <p>• The dashboard and carbon report will use the same school identity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t('back')}
                  </button>
                )}

                <button
                  onClick={step === 3 ? handleSubmit : handleNext}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-all hover:shadow-lg"
                >
                  {step === 3 ? t('submit') : t('next')}
                  {step < 3 && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
