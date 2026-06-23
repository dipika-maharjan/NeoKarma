'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const LoginPage = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const imgT = useTranslations('Images');
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getHomeRoute = (user) => {
    if (!user) return '/dashboard';
    if (
      user.role === 'school_admin' ||
      user.role === 'admin' ||
      user.isAdmin ||
      user.admin
    )
      return '/admin/dashboard';
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const result = await authLogin({ email, password });
      if (result?.success) {
        const nextParam = searchParams.get('next');
        const defaultRoute = getHomeRoute(result.user);
        router.push(nextParam || defaultRoute);
      } else {
        setError(result?.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
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
          <div className="mb-6 text-center">
            <Link href="/" className="no-underline">
              <h1 className="mb-2 text-[23px] font-extrabold text-[#202434]">
                {t('welcome')}
              </h1>
            </Link>
            <p className="text-[12px] font-medium leading-4 text-[#68706d]">
              {t('joinMission')}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-md bg-[#e9eefb] p-1">
            <Link
              href="/register"
              className="rounded-md py-2 text-center text-[11px] font-bold text-[#6c7370] no-underline transition hover:text-[#0A3D25]"
            >
              {t('signUp')}
            </Link>
            <div className="rounded-md bg-[#0A3D25] py-2 text-center text-[11px] font-bold text-white shadow-sm">
              {t('login')}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[12px] font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-extrabold text-[#303542]">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="h-10 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-extrabold text-[#303542]">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="h-10 w-full rounded-md border border-[#cfd7df] bg-white pl-3 pr-10 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium">
              <label className="flex items-center gap-2 text-[#68706d]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#cfd7df]"
                />
                {t('remember')}
              </label>
              <Link href="/forgot-password" className="text-[#0A3D25] no-underline hover:underline">
                {t('forgot')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signInButton')
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] font-medium text-[#68706d]">
            {t('dontHaveAccount')}{' '}
            <Link href="/register" className="font-extrabold text-[#0A3D25] no-underline hover:underline">
              {t('signUp')}
            </Link>
          </p>

          <p className="mx-auto mt-4 max-w-[280px] text-center text-[10px] font-medium leading-4 text-[#68706d]">
            {t('termsText')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
