'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { register } from '@/lib/actions/authActions';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    locationType: 'urban',
    schoolName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = formData.password;
  const isLengthValid = password.length >= 8;
  const isUppercaseValid = /[A-Z]/.test(password);
  const isLowercaseValid = /[a-z]/.test(password);
  const isNumberValid = /[0-9]/.test(password);
  const isSpecialValid = /[!@#$%^&*(),.?":{}|<>_+-]/.test(password);
  const isPasswordValid = isLengthValid && isUppercaseValid && isLowercaseValid && isNumberValid && isSpecialValid;
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const imgT = useTranslations('Images');

  const gradeOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(i + 8),
    label: `Grade ${i + 8}`,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getHomeRoute = (user) => {
    if (!user) return '/dashboard';
    if (
      user.role === 'school_admin' ||
      user.role === 'admin' ||
      user.isAdmin ||
      user.admin
    )
      return '/admin';
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Name validation: min 2 chars, must contain at least one letter
    const nameTrimmed = formData.name.trim();
    const nameRegex = /^[\p{L}\p{M}'\-.\s]{2,}$/u;
    if (!nameTrimmed || !nameRegex.test(nameTrimmed) || !/\p{L}/u.test(nameTrimmed)) {
      setError(t('nameInvalid'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmail'));
      return;
    }

    // Password strength check
    if (!isPasswordValid) {
      setError(t('passwordWeak'));
      return;
    }

    // Passwords matching check
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const result = await register(submitData);
      const nextParam = searchParams.get('next');
      const defaultRoute = getHomeRoute(result.user);
      router.push(nextParam || defaultRoute);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff]">
      <section className="relative hidden w-[52%] overflow-hidden bg-[#0A3D25] lg:block">
        <Image
          src="/Himalayan Mountains.png"
          alt={imgT('himalayanAlt')}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-[#0A3D25]/28" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_50%,rgba(50,215,134,0.08),transparent_34%)]" />

        <div className="relative z-10 flex h-full flex-col justify-center px-[20%] text-center">
          <h1 className="mb-6 text-[42px] font-extrabold leading-[1.08] !text-white">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
          </h1>
          <p className="mx-auto max-w-[340px] text-[14px] font-medium leading-6 !text-white/85">
            {t('marketingParagraph')}
          </p>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-[#f8f9ff] px-6 lg:w-[48%]">
        <div className="w-full max-w-[345px]">
          <div className="mb-4 text-center">
            <Link href="/" className="no-underline">
              <h1 className="mb-1.5 text-[23px] font-extrabold text-[#202434]">
                {t('welcome')}
              </h1>
            </Link>
            <p className="text-[12px] font-medium leading-4 text-[#68706d]">
              {t('joinMission')}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-md bg-[#e9eefb] p-1">
            <div className="rounded-md bg-[#0A3D25] py-2 text-center text-[11px] font-bold text-white shadow-sm">
              {t('signUp')}
            </div>
            <Link
              href="/login"
              className="rounded-md py-2 text-center text-[11px] font-bold text-[#6c7370] no-underline transition hover:text-[#0A3D25]"
            >
              {t('login')}
            </Link>
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[12px] font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('fullName')}
                required
                className="h-9 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
                required
                className="h-9 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="h-9 w-full rounded-md border border-[#cfd7df] bg-white pl-3 pr-8 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                  {t('confirm')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="h-9 w-full rounded-md border border-[#cfd7df] bg-white pl-3 pr-8 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                  {t('grade')}
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="h-9 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                >
                  <option value="">{t('selectGrade')}</option>
                  {gradeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t('grade') + ' ' + opt.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                  {t('location')}
                </label>
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleChange}
                  required
                  className="h-9 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
                >
                  <option value="urban">{t('urban')}</option>
                  <option value="rural">{t('rural')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-extrabold text-[#303542]">
                {t('schoolName')} <span className="font-medium text-[#8b9490]">(optional)</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder={t('schoolName')}
                className="h-9 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#063f2f] focus:ring-2 focus:ring-[#063f2f]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('createAccount')
              )}
            </button>
          </form>

          <p className="mt-3 text-center text-[11px] font-medium text-[#68706d]">
            {t('alreadyHaveAccount')}{' '}
            <Link
              href={searchParams.get('next') ? `/login?next=${encodeURIComponent(searchParams.get('next'))}` : '/login'}
              className="font-extrabold text-[#0A3D25] no-underline hover:underline"
            >
              {t('login')}
            </Link>
          </p>

          <p className="mx-auto mt-3 max-w-[280px] text-center text-[10px] font-medium leading-4 text-[#68706d]">
            {t('termsText')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
