'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2, Mail, MapPin, Save, School, Trophy, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';

const ProfileAccountPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [formData, setFormData] = useState(() => ({
    name: user?.name || user?.email || '',
    email: user?.email || '',
    schoolName: user?.schoolName || '',
    grade: user?.grade || '',
    locationType: user?.locationType || ''
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
      setFormData({
        name: user.name || user.email || '',
        email: user.email || '',
        schoolName: user.schoolName || '',
        grade: user.grade || '',
        locationType: user.locationType || ''
      });
    }
  }, [user]);

  const profileStats = useMemo(() => ([
    {
      label: 'Grade',
      value: user?.grade ? `Grade ${user.grade}` : 'Not set',
      icon: GraduationCap
    },
    {
      label: 'Location',
      value: user?.locationType ? `${user.locationType.charAt(0).toUpperCase()}${user.locationType.slice(1)}` : 'Not set',
      icon: MapPin
    },
    {
      label: 'Current streak',
      value: `${user?.streak?.current || 0} days`,
      icon: Trophy
    }
  ]), [user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const nextName = formData.name.trim();
    const nextEmail = formData.email.trim().toLowerCase();
    const nextSchoolName = formData.schoolName.trim();
    const nextGrade = formData.grade;
    const nextLocationType = formData.locationType;

    if (!nextName) {
      setStatus({ type: 'error', message: 'Name is required.' });
      return;
    }

    if (!nextEmail) {
      setStatus({ type: 'error', message: 'Email is required.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!nextGrade) {
      setStatus({ type: 'error', message: 'Grade is required.' });
      return;
    }

    if (!nextLocationType) {
      setStatus({ type: 'error', message: 'Location is required.' });
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: nextName,
      email: nextEmail,
      schoolName: nextSchoolName || '',
      grade: nextGrade,
      locationType: nextLocationType
    });
    setSaving(false);

    if (result.success) {
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Could not update profile.' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-[#4A6B5D]">
              Profile / Account
            </p>
            <h1 className="text-[32px] font-extrabold tracking-tight text-[#17202A] md:text-[36px]">
              Account details
            </h1>
            <p className="mt-2 max-w-[640px] text-[15px] leading-6 text-[#52665B]">
              Keep your student profile aligned with your school carbon journey.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#0A3D25] px-6 text-[14px] font-bold text-[#0A3D25] no-underline transition-colors hover:bg-[#E8F5E9]"
          >
            Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-xl border border-[#E0E5E2] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
              <div className="bg-[#a8d3ac] p-6 text-[#0A3D25]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-sm">
                  <User size={30} />
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

            <section className="rounded-xl border border-[#D8E8DE] bg-[#EEF7F1] p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[14px] font-bold text-[#17202A]">Language</p>
                <LanguageToggle />
              </div>
              <p className="text-[13px] leading-5 text-[#52665B]">
                This uses the same language toggle as the navbar and profile menu.
              </p>
            </section>
          </aside>

          <section className="rounded-xl border border-[#E0E5E2] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-7">
            <div className="mb-6">
              <h2 className="text-[22px] font-extrabold text-[#17202A]">Profile information</h2>
              <p className="mt-1 text-[14px] leading-6 text-[#52665B]">
                Your name, email, grade, and location are editable here and used throughout your reports and progress tracking.
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
                  Name
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
                  School name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Enter your school name"
                  className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#303542]">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-extrabold text-[#303542]">Grade</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  >
                    <option value="">Select grade</option>
                    {[8, 9, 10, 11, 12].map((gradeOption) => (
                      <option key={gradeOption} value={gradeOption}>
                        Grade {gradeOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-extrabold text-[#303542]">Location</label>
                  <select
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className="h-12 w-full rounded-lg border border-[#cfd7df] bg-white px-4 text-[14px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  >
                    <option value="">Select location</option>
                    <option value="urban">Urban</option>
                    <option value="rural">Rural</option>
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
                  {saving ? 'Saving...' : 'Save changes'}
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
