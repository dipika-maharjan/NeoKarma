'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2, Mail, MapPin, Pencil, Save, School, Trophy, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslations, useLocale } from 'next-intl';
import ProfileAvatar from '@/components/ProfileAvatar';

const profileImageMessages = {
  typeError: 'Please choose a PNG, JPG, or WebP image.',
  sizeError: 'Profile image must be under 1 MB.',
  readError: 'Could not read that image. Please try another file.',
};

const ProfileAccountPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const locale = useLocale();
  const t = useTranslations('Profile');
  const tAuth = useTranslations('Auth');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(() => ({
    name: user?.name || user?.email || '',
    email: user?.email || '',
    schoolName: user?.schoolName || '',
    grade: user?.grade || '',
    locationType: user?.locationType || '',
    profileImage: user?.profileImage || ''
  }));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?next=/profile/account');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setFormData({
          name: user.name || user.email || '',
          email: user.email || '',
          schoolName: user.schoolName || '',
          grade: user.grade || '',
          locationType: user.locationType || '',
          profileImage: user.profileImage || ''
        });
      });
    }
  }, [user]);

  const profileStats = useMemo(() => ([
    {
      label: tAuth('grade'),
      value: user?.grade ? t('gradeLabel', { grade: user.grade, location: tAuth(user.locationType) || user.locationType }) : t('notSet'),
      icon: GraduationCap
    },
    {
      label: tAuth('location'),
      value: user?.locationType ? (tAuth(user.locationType) || user.locationType.charAt(0).toUpperCase() + user.locationType.slice(1)) : t('notSet'),
      icon: MapPin
    },
    {
      label: t('currentStreak'),
      value: `${user?.streak?.current || 0} ${t('days') || 'days'}`,
      icon: Trophy
    }
  ]), [user, t, tAuth, locale]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setStatus({ type: 'error', message: profileImageMessages.typeError });
      event.target.value = '';
      return;
    }

    if (file.size > 1024 * 1024) {
      setStatus({ type: 'error', message: profileImageMessages.sizeError });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result || '' }));
      setStatus({ type: '', message: '' });
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: profileImageMessages.readError });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const nextName = formData.name.trim();
    const nextSchoolName = formData.schoolName.trim();
    const nextGrade = formData.grade;
    const nextLocationType = formData.locationType;

    if (!nextName) {
      setStatus({ type: 'error', message: t('nameRequired') });
      return;
    }

    if (!nextGrade) {
      setStatus({ type: 'error', message: t('gradeRequired') });
      return;
    }

    if (!nextLocationType) {
      setStatus({ type: 'error', message: t('locationRequired') });
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: nextName,
      schoolName: nextSchoolName || '',
      grade: nextGrade,
      locationType: nextLocationType,
      profileImage: formData.profileImage || ''
    });
    setSaving(false);

    if (result.success) {
      setStatus({ type: 'success', message: t('profileUpdatedSuccess') });
    } else {
      setStatus({ type: 'error', message: result.error || t('profileUpdateFailed') });
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-[#4A6B5D]">
              {t('profileAccount')}
            </p>
            <h1 className="text-[32px] font-extrabold tracking-tight text-[#17202A] md:text-[36px]">
              {t('accountTitle')}
            </h1>
            <p className="mt-2 max-w-[640px] text-[15px] leading-6 text-[#52665B]">
              {t('accountDescription')}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#0A3D25] px-6 text-[14px] font-bold text-[#0A3D25] no-underline transition-colors hover:bg-[#E8F5E9]"
          >
            {t('dashboardButton')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-xl border border-[#E0E5E2] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
              <div className="bg-[#a8d3ac] p-6 text-[#0A3D25]">
                <div className="relative h-16 w-16">
                  <ProfileAvatar
                    imageSrc={formData.profileImage}
                    alt={user.name || user.email}
                    size="lg"
                    className="bg-white/70 text-[#0A3D25] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Edit profile image"
                    className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#a8d3ac] bg-[#0A3D25] text-white shadow-sm transition-colors hover:bg-[#072B1A] focus:outline-none focus:ring-2 focus:ring-[#0A3D25]/30"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>
                <h2 className="mt-5 text-[24px] font-extrabold">
                  {user.name || user.email}
                </h2>
                <p className="mt-1 truncate text-[14px] font-medium text-[#4A655A]">
                  {user.schoolName || user.email}
                </p>
              </div>

              <div className="divide-y divide-[#EEF2EF]">
                {profileStats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 px-6 py-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#0A3D25]">
                      <Icon size={19} />
                    </span>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7A8881]">
                        {label}
                      </p>
                      <p className="text-[15px] font-bold text-[#17202A]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-xl border border-[#E0E5E2] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-7">
            <div className="mb-6">
              <h2 className="text-[22px] font-extrabold text-[#17202A]">{t('profileInfoTitle')}</h2>
              <p className="mt-1 text-[14px] leading-6 text-[#52665B]">
                {t('profileInfoDesc')}
              </p>
            </div>

            {status.message && (
              <div
                className={`mb-5 rounded-lg border px-4 py-3 text-[13px] font-semibold ${
                  status.type === 'success'
                    ? 'border-[#BEE8D3] bg-[#E8F5E9] text-[#0A3D25]'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                  <label className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#303542]">
                  <User size={16} />
                  {t('nameLabel')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={user.email}
                  className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                />
              </div>

              <div>
                  <label className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#303542]">
                  <School size={16} />
                  {t('schoolLabel')}
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder={t('schoolPlaceholder') || t('schoolLabel')}
                  className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                />
              </div>

              <div>
                  <label className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#303542]">
                  <Mail size={16} />
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={tAuth('emailPlaceholder')}
                  disabled
                  className="h-12 w-full rounded-lg border border-[#cfd7df] bg-gray-100 px-4 text-[14px] text-gray-600 outline-none transition placeholder:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-extrabold text-[#303542]">{tAuth('grade')}</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  >
                    <option value="">{tAuth('selectGrade')}</option>
                    {[8, 9, 10, 11, 12].map((gradeOption) => (
                      <option key={gradeOption} value={gradeOption}>
                        {tAuth('grade')} {gradeOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-extrabold text-[#303542]">{tAuth('location')}</label>
                  <select
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  >
                    <option value="">{t('selectLocation')}</option>
                    <option value="urban">{tAuth('urban')}</option>
                    <option value="rural">{tAuth('rural')}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A3D25] px-7 text-[14px] font-extrabold text-white transition-colors hover:bg-[#072B1A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountPage;
