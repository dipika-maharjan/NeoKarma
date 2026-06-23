'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/lib/actions/authActions';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ResetPasswordForm = () => {
  const t = useTranslations('Auth');
  const imgT = useTranslations('Images');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('invalidToken'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await resetPasswordAction({ token, password });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff]">
      {/* Left pane: Green Hero Overlay */}
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

      {/* Right pane: Reset Password Form */}
      <section className="flex w-full items-center justify-center bg-[#f8f9ff] px-6 lg:w-[48%]">
        <div className="w-full max-w-[345px]">
          <div className="mb-6 text-center">
            <Link href="/" className="no-underline">
              <h1 className="mb-2 text-[23px] font-extrabold text-[#202434]">
                {t('welcome')}
              </h1>
            </Link>
            <p className="text-[12px] font-medium leading-4 text-[#68706d]">
              {t('forgotPasswordTitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[12px] font-medium text-red-700">{error}</p>
            </div>
          )}

          {!token ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center text-red-600">
                <AlertCircle size={48} />
              </div>
              <p className="mb-6 text-[13px] font-medium leading-5 text-[#303542]">
                {t('invalidToken')}
              </p>
              <Link
                href="/forgot-password"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] no-underline"
              >
                {t('forgotPasswordTitle')}
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center text-green-600">
                <CheckCircle2 size={48} className="text-[#0A3D25]" />
              </div>
              <p className="mb-6 text-[13px] font-medium leading-5 text-[#303542]">
                {t('resetPasswordSuccess')}
              </p>
              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] no-underline"
              >
                {t('login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-extrabold text-[#303542]">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={6}
                  className="h-10 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-extrabold text-[#303542]">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={6}
                  className="h-10 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {t('resettingPassword')}
                  </>
                ) : (
                  t('resetPasswordButton')
                )}
              </button>
            </form>
          )}

          <p className="mx-auto mt-8 max-w-[280px] text-center text-[10px] font-medium leading-4 text-[#68706d]">
            {t('termsText')}
          </p>
        </div>
      </section>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f8f9ff]">
        <Loader2 size={24} className="animate-spin text-[#0A3D25]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
