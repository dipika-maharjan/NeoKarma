'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authLogin({ email, password });
      if (result?.success || result?.token || result?.user) {
        window.location.href = '/dashboard';
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
          alt="Himalayan Mountains"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-[#0A3D25]/28" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_50%,rgba(50,215,134,0.08),transparent_34%)]" />

        <div className="relative z-10 flex h-full flex-col justify-center px-[20%] text-center">
          <h1 className="mb-6 text-[42px] font-extrabold leading-[1.08] !text-white">
            Measure. Reflect.
            <br />
            Improve.
          </h1>
          <p className="mx-auto max-w-[340px] text-[14px] font-medium leading-6 !text-white/85">
            Join our mission to build a carbon-neutral and sustainable future for the
            Himalayas and beyond.
          </p>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-[#f8f9ff] px-6 lg:w-[48%]">
        <div className="w-full max-w-[345px]">
          <div className="mb-6 text-center">
            <Link href="/" className="no-underline">
              <h1 className="mb-2 text-[23px] font-extrabold text-[#202434]">
                Welcome to Neoकर्म
              </h1>
            </Link>
            <p className="text-[12px] font-medium leading-4 text-[#68706d]">
              Join your school and start your climate journey today.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-md bg-[#e9eefb] p-1">
            <Link
              href="/register"
              className="rounded-md py-2 text-center text-[11px] font-bold text-[#6c7370] no-underline transition hover:text-[#0A3D25]"
            >
              Sign Up
            </Link>
            <div className="rounded-md bg-[#0A3D25] py-2 text-center text-[11px] font-bold text-white shadow-sm">
              Login
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                required
                className="h-10 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-extrabold text-[#303542]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="h-10 w-full rounded-md border border-[#cfd7df] bg-white px-3 text-[12px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0A3D25] focus:ring-2 focus:ring-[#0A3D25]/10"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium">
              <label className="flex items-center gap-2 text-[#68706d]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#cfd7df]"
                />
                Remember me
              </label>
              <a href="#forgot" className="text-[#0A3D25] no-underline hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0A3D25] text-[13px] font-extrabold text-white transition hover:bg-[#072B1A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] font-medium text-[#68706d]">
            Don&apos;t Have an Account?{' '}
            <Link href="/register" className="font-extrabold text-[#0A3D25] no-underline hover:underline">
              Sign Up
            </Link>
          </p>

          <p className="mx-auto mt-4 max-w-[280px] text-center text-[10px] font-medium leading-4 text-[#68706d]">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
