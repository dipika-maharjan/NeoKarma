'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  FileText,
  Leaf,
  TrendingUp,
  Users,
  Wind
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import apiClient from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1
  }).format(Number(value || 0));

const formatInt = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const exportCsv = (rows) => {
  const headers = [
    'Student',
    'Grade',
    'Section',
    'Date',
    'Total Emission (kg)',
    'Meat-Free',
    'Transport Emission (kg)'
  ];
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.studentName,
        row.grade || '',
        row.section || '',
        row.date ? new Date(row.date).toISOString().slice(0, 10) : '',
        row.totalEmissionKg || 0,
        row.meatFreeDay ? 'Yes' : 'No',
        row.transportEmission || 0
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'admin-reports.csv';
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function AdminReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/reports');
        setData(response.data);
      } catch (err) {
        setError(err?.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated, router]);

  const chartData = useMemo(
    () => (data?.emissionTrend || []).map((entry) => ({ ...entry })),
    [data]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7f6] p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f7f6] p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!data) return null;

  const breakdown = data.categoryBreakdown || {};

  return (
    <main className="min-h-screen bg-[#f5f7f6] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                School analytics
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#0A3D25]">Reports</h1>
            </div>
            <button
              type="button"
              onClick={() => exportCsv(data.recentLogs || [])}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D25] px-4 py-2 text-sm font-semibold text-white"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: 'Total logs',
              value: formatInt(data.totalLogs),
              icon: <FileText size={18} className="text-[#0A3D25]" />
            },
            {
              label: 'Avg transport',
              value: `${formatNumber(breakdown.transport)}kg`,
              icon: <Wind size={18} className="text-[#f59e0b]" />
            },
            {
              label: 'Avg food',
              value: `${formatNumber(breakdown.food)}kg`,
              icon: <Leaf size={18} className="text-[#10b981]" />
            },
            {
              label: 'Avg energy',
              value: `${formatNumber(breakdown.energy)}kg`,
              icon: <TrendingUp size={18} className="text-[#2563eb]" />
            }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6b7280]">{item.label}</p>
                <div className="rounded-xl bg-[#f5f7f6] p-2">{item.icon}</div>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-[#0A3D25]">{item.value}</h2>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Emission trend
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#111827]">30-day activity</h3>
            </div>
            <span className="rounded-full bg-[#eef8f1] px-3 py-1 text-xs font-semibold text-[#0A3D25]">
              {formatInt(breakdown.totalLogs || 0)} records
            </span>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="avgEmission" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1a7a4a" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#1a7a4a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0ee" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="avgEmission"
                  stroke="#1a7a4a"
                  strokeWidth={3}
                  fill="url(#avgEmission)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Recent activity
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#111827]">Recent logs</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#eef0ee]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#eef0ee] text-sm">
                  <thead className="bg-[#f9faf9] text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Student</th>
                      <th className="px-4 py-3 text-left font-semibold">Class</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Emission</th>
                      <th className="px-4 py-3 text-left font-semibold">Transport</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef0ee] bg-white">
                    {(data.recentLogs || []).map((row, index) => (
                      <tr key={`${row.studentName}-${index}`} className="hover:bg-[#f9fbfa]">
                        <td className="px-4 py-3 font-medium text-[#111827]">{row.studentName}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{row.grade || '—'} · {row.section || '—'}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{formatDate(row.date)}</td>
                        <td className="px-4 py-3 font-semibold text-[#0A3D25]">{formatNumber(row.totalEmissionKg)}kg</td>
                        <td className="px-4 py-3 text-[#6b7280]">{formatNumber(row.transportEmission)}kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Category snapshot
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Transportation', value: breakdown.transport || 0 },
                  { label: 'Food', value: breakdown.food || 0 },
                  { label: 'Energy', value: breakdown.energy || 0 }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b7280]">{item.label}</span>
                      <span className="font-semibold text-[#111827]">{formatNumber(item.value)}kg</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-[#eef0ee]">
                      <div
                        className="h-2 rounded-full bg-[#1a7a4a]"
                        style={{ width: `${Math.min(100, item.value * 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0A3D25]" />
                <p className="text-sm font-semibold text-[#111827]">Meat-free days</p>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-[#0A3D25]">
                {formatInt(breakdown.meatFreeDays || 0)}
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                {breakdown.totalLogs || 0} total log entries recorded
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
