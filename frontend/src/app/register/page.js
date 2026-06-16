'use client';

import React, { useState } from 'react';
import { Card, Input, Select, Button } from '@/components/ui';
import { register } from '@/lib/actions/authActions';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    grade: '',
    locationType: 'urban',
    schoolName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(i + 8),
    label: `Grade ${i + 8}`
  }));

  const locationOptions = [
    { value: 'urban', label: 'Urban' },
    { value: 'rural', label: 'Rural' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B5E20] to-[#0D3D14] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">नेओकर्म</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Select
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              options={gradeOptions}
              required
            />

            <Select
              label="Location Type"
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              options={locationOptions}
              required
            />

            <Input
              label="School Name"
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Your school (optional)"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-[#1B5E20] hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
