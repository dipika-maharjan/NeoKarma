'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  FileText,
  Leaf,
  TrendingUp,
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
    'Date',
    'Total Emission (kg)'
  ];
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.studentName,
        row.grade || '',
        row.date ? new Date(row.date).toISOString().slice(0, 10) : '',
        row.totalEmissionKg || 0
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('30');
  const isFirstLoad = useRef(true);
  const timeframeLabel = {
    7: 'Last 7 days',
    30: 'Last 30 days',
    90: 'Last 3 months',
    all: 'All time'
  }[timeframe] || 'Last 30 days';

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        if (isFirstLoad.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError('');

        const token = localStorage.getItem('token') || '';
        const response = await fetch(`/api/admin/reports?days=${timeframe}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load reports.');
        }

        const reportData = await response.json();
        setData(reportData);
      } catch (err) {
        setError(err?.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFirstLoad.current = false;
      }
    };

    fetchReports();
  }, [isAuthenticated, router, timeframe]);

  const chartData = useMemo(
    () => (data?.emissionTrend || []).map((entry) => ({ ...entry })),
    [data]
  );
  const recentLogs = data?.recentLogs || [];

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
        <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                School analytics
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#0A3D25]">Reports</h1>
              <p className="mt-1 text-xs text-[#6b7280]">{timeframeLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 rounded-xl bg-[#f5f7f6] p-1">
                {[
                  { label: '7 Days', value: '7' },
                  { label: '30 Days', value: '30' },
                  { label: '3 Months', value: '90' },
                  { label: 'All Time', value: 'all' }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTimeframe(t.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      timeframe === t.value
                        ? 'bg-[#0A3D25] text-white'
                        : 'text-[#6b7280] hover:bg-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => exportCsv(data.recentLogs || [])}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D25] px-4 py-2 text-sm font-semibold text-white"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </section>

        <section
          className="grid gap-4 md:grid-cols-5"
          style={{
            opacity: refreshing ? 0.5 : 1,
            transition: 'opacity 0.2s',
            pointerEvents: refreshing ? 'none' : 'auto'
          }}
        >
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
              label: 'Avg waste',
              value: `${formatNumber(breakdown.waste)}kg`,
              icon: <TrendingUp size={18} className="text-[#ef4444]" />
            },
            {
              label: 'Avg energy',
              value: `${formatNumber(breakdown.energy)}kg`,
              icon: <TrendingUp size={18} className="text-[#2563eb]" />
            }
          ].map((item) => (
            <div key={item.label} className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6b7280]">{item.label}</p>
                <div className="rounded-xl bg-[#f5f7f6] p-2">{item.icon}</div>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-[#0A3D25]">{item.value}</h2>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
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

        <section>
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Recent activity
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#111827]">Recent logs</h3>
              </div>
            </div>
            <div className="max-h-[300px] overflow-auto rounded-2xl border border-[#eef0ee]">
              <div className="min-w-[680px]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#f9faf9] text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Emission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef0ee] bg-white">
                    {recentLogs.map((row, index) => (
                      <tr key={`${row.studentName}-${index}`} className="hover:bg-[#f9fbfa]">
                        <td className="px-4 py-3 font-medium text-[#111827]">{row.studentName}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{row.grade || '—'}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{formatDate(row.date)}</td>
                        <td className="px-4 py-3 font-semibold text-[#0A3D25]">{formatNumber(row.totalEmissionKg)}kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
