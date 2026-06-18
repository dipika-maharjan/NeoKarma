'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Copy, Check, Share2, Leaf } from 'lucide-react';

const SharePage = ({ params }) => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const response = await fetch(`/api/share/${params.shareId}`);
        if (!response.ok) {
          throw new Error('Share not found or expired');
        }
        const result = await response.json();
        setShareData(result.data);
      } catch (err) {
        console.error('Error loading share:', err);
        setError(err.message || 'Failed to load shared profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.shareId) {
      fetchShare();
    }
  }, [params.shareId]);

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#FAFAFA]">
        <div className="text-center font-sans">
          <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading achievement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#FAFAFA] px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 max-w-md w-full">
          <div className="flex gap-3 mb-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-semibold">Oops!</p>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-red-700 hover:underline"
          >
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#FAFAFA]">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#FAFAFA] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0A3D25] text-white mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A3D25] mb-2">
            {shareData.displayName}
          </h1>
          <p className="text-[14px] text-[#4A5550]">
            Climate Action Champion
          </p>
        </div>

        {/* Main Achievement Card */}
        <div className="rounded-2xl bg-white border-2 border-[#0A3D25] shadow-lg overflow-hidden mb-6">
          {/* Green Header */}
          <div className="bg-gradient-to-r from-[#0A3D25] to-[#1B5E20] p-6 text-white text-center">
            <div className="mb-3">
              <p className="text-[13px] font-semibold opacity-90">Current Streak</p>
              <p className="text-4xl font-extrabold">{shareData.currentStreak}</p>
              <p className="text-[12px] mt-1 opacity-90">days in a row</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#E8F5E9] p-4 text-center">
                <p className="text-[12px] text-[#4A5550] font-semibold mb-1">
                  Longest Streak
                </p>
                <p className="text-2xl font-extrabold text-[#0A3D25]">
                  {shareData.longestStreak}
                </p>
              </div>
              <div className="rounded-lg bg-[#E8F5E9] p-4 text-center">
                <p className="text-[12px] text-[#4A5550] font-semibold mb-1">
                  Logs Submitted
                </p>
                <p className="text-2xl font-extrabold text-[#0A3D25]">
                  {shareData.totalLogsSubmitted}
                </p>
              </div>
            </div>

            {/* Impact Section */}
            <div className="rounded-lg bg-[#FFF8E1] border border-[#FBC02D] p-4">
              <p className="text-[13px] text-[#F57F17] font-semibold mb-2">
                🌱 Environmental Impact
              </p>
              <div className="space-y-1">
                <p className="text-[14px] text-[#F57F17]">
                  <span className="font-bold">{shareData.treesEquivalent}</span> trees worth of CO₂ tracked
                </p>
                <p className="text-[13px] text-[#F57F17] opacity-80">
                  ≈ {shareData.estimatedTotalCo2Kg} kg CO₂ avoided
                </p>
              </div>
            </div>

            {/* Member Info */}
            <div className="border-t border-[#E0E5E2] pt-4 mt-4 text-center">
              <p className="text-[12px] text-[#4A5550] mb-1">Member since</p>
              <p className="text-[14px] font-semibold text-[#0A3D25]">
                {shareData.joinedMonth}
              </p>
            </div>

            {/* Custom Message */}
            {shareData.customMessage && (
              <div className="bg-[#E8F5E9] rounded-lg p-4 border-l-4 border-[#0A3D25]">
                <p className="text-[13px] italic text-[#17202A]">
                  &quot;{shareData.customMessage}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          className="w-full h-12 rounded-full bg-[#0A3D25] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#072B1A] transition-colors shadow-md"
        >
          {copied ? (
            <>
              <Check size={18} />
              Link Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Shareable Link
            </>
          )}
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[12px] text-[#4A5550] mb-3">
            Join {shareData.displayName} in tracking climate action
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#0A3D25] text-[0A3D25] font-bold text-[14px] hover:bg-[#C7EEDC] transition-colors"
          >
            <Share2 size={16} />
            Start Your Journey
          </a>
        </div>

        {/* Branding */}
        <div className="text-center mt-12 pb-4">
          <p className="text-[12px] text-[#4A5550]">
            Built with <span className="text-[#0A3D25] font-bold">Neoकर्म</span>
          </p>
          <p className="text-[11px] text-[#4A5550] mt-1">
            Track your carbon footprint, change the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
