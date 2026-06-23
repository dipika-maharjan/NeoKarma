'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Award,
  FileText,
  Flame,
  TrendingDown,
  Users,
  Wind,
  Bus,
  Salad,
  Trash2,
  Zap,
  Bike,
  Leaf,
  PackageX,
  UtensilsCrossed
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Cell,
  LabelList
} from 'recharts';
import { useAuth } from '@/context/AuthContext';

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1
  }).format(Number(value || 0));

const formatInt = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value || 0));

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
};

const initials = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const feedStyle = {
  MIRROR: { bg: '#e6f4ed', color: '#1a7a4a', icon: TrendingDown },
  AWARD: { bg: '#e8f0fc', color: '#1a56b0', icon: Award },
  MILESTONE: { bg: '#fef3e0', color: '#92600a', icon: Activity }
};

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #eef0ee',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('30');
  const [activeChart, setActiveChart] = useState('grades'); // 'grades' | 'sources' | 'eco'
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

    const fetchDashboard = async () => {
      try {
        if (isFirstLoad.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError('');

        const token = localStorage.getItem('token') || '';
        const response = await fetch(`/api/admin/dashboard?days=${timeframe}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load dashboard data.');
        }

        const dashboardData = await response.json();
        setData(dashboardData || null);
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFirstLoad.current = false;
      }
    };

    fetchDashboard();
  }, [isAuthenticated, router, timeframe]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            style={{
              height: 48,
              background: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 12,
              animation: 'pulse 1.5s infinite'
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          margin: 24,
          padding: '12px 16px',
          background: '#fde8e8',
          color: '#c0392b',
          borderRadius: 8,
          fontSize: 13
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    schoolPerformance,
    studentStreaks,
    liveActivity,
    schoolName,
    adminName,
    studentsEnrolled
  } = data;

  const sourceBreakdown = (data.emissionSources || []).map((entry) => ({
    category: entry.category,
    value: Number(entry.value || 0),
    color: entry.color || '#1a7a4a'
  }));

  const ecoData = [
    {
      action: 'Walked or Cycled',
      pct: Number(data.ecoActions?.walkedOrCycledPct || 0),
      color: '#1a7a4a',
      icon: <Bike size={15} color="#1a7a4a" />
    },
    {
      action: 'Veg Lunch',
      pct: Number(data.ecoActions?.vegLunchPct || 0),
      color: '#4ecf96',
      icon: <Salad size={15} color="#4ecf96" />
    },
    {
      action: 'No Plastic',
      pct: Number(data.ecoActions?.noPlasticPct || 0),
      color: '#3b82f6',
      icon: <PackageX size={15} color="#3b82f6" />
    },
    {
      action: 'No Food Waste',
      pct: Number(data.ecoActions?.noFoodWastePct || 0),
      color: '#f59e0b',
      icon: <UtensilsCrossed size={15} color="#f59e0b" />
    }
  ];

  const statCards = [
    {
      label: 'Total Students',
      value: formatInt(stats.totalStudents),
      icon: <Users size={18} color="#1a7a4a" />,
      accent: '#e6f4ed'
    },
    {
      label: 'Avg Emission',
      value: `${formatNumber(stats.avgEmissionKg)}kg`,
      icon: <Wind size={18} color="#f59e0b" />,
      accent: '#fff8ed'
    },
    {
      label: 'Reports',
      value: formatInt(stats.totalReports),
      icon: <FileText size={18} color="#3b82f6" />,
      accent: '#eff6ff'
    }
  ];
  const activityFeed = liveActivity || [];
  const streakRows = studentStreaks || [];
  const gradeDistribution = data.gradeDistribution || [];
  const gradeEmissions = gradeDistribution.map((entry) => ({
    ...entry,
    avgEmission: Number(entry.avgEmission || 0)
  }));
  const sortedGradeEmissions = [...gradeEmissions].sort(
    (a, b) => a.avgEmission - b.avgEmission
  );
  const lowestGrade = sortedGradeEmissions[0];
  const highestGrade = sortedGradeEmissions[sortedGradeEmissions.length - 1];
  const gradeAverage =
    gradeEmissions.length > 0
      ? gradeEmissions.reduce((sum, entry) => sum + entry.avgEmission, 0) /
        gradeEmissions.length
      : 0;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f7f3 0%, #eef5f0 100%)',
        padding: 24,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'stretch'
        }}
      >
        <section
          style={{
            background: 'linear-gradient(135deg, #1a7a4a 0%, #0d5c35 100%)',
            color: '#fff',
            borderRadius: 16,
            padding: '28px 32px',
            boxShadow: '0 18px 40px rgba(10,61,37,0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', width: '100%' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255, 255, 255, 0.72)' }}>Admin dashboard</p>
              <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 800, color: '#fff' }}>
                {schoolName || 'Admin Dashboard'}
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255, 255, 255, 0.82)' }}>
                Welcome back, {adminName || 'Admin'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: 4
                }}
              >
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
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: timeframe === t.value ? '#fff' : 'transparent',
                      color: timeframe === t.value ? '#1a7a4a' : 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff'
                }}
              >
                {formatInt(studentsEnrolled ?? stats.totalStudents)} students enrolled
              </div>
            </div>
          </div>
        </section>

        <section
          className="dashboard-grid dashboard-grid--stats"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="dashboard-stat-card"
              style={cardStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{card.label}</span>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: card.accent,
                    flexShrink: 0
                  }}
                >
                  {card.icon}
                </div>
              </div>
              <h2 style={{ margin: '12px 0 0', fontSize: 28, fontWeight: 800, color: '#0A3D25' }}>
                {card.value}
              </h2>
            </div>
          ))}
        </section>

        <section style={{ ...cardStyle, padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 12,
              flexWrap: 'wrap'
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: '#888',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4
                }}
              >
                Carbon insights
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>
                Emission Analytics
              </h3>
              <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>
                {timeframeLabel}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 4,
                background: '#f4f6f4',
                borderRadius: 8,
                padding: 4
              }}
            >
              {[
                { key: 'grades', label: 'Emissions by Grade' },
                { key: 'sources', label: 'Emission Sources' },
                { key: 'eco', label: 'Eco Actions' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChart(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeChart === tab.key ? '#1a7a4a' : 'transparent',
                    color: activeChart === tab.key ? '#fff' : '#888',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              width: '100%',
              opacity: refreshing ? 0.5 : 1,
              transition: 'opacity 0.2s',
              pointerEvents: refreshing ? 'none' : 'auto'
            }}
          >
            {activeChart === 'grades' && (
              gradeEmissions.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 13,
                    padding: '24px 0'
                  }}
                >
                  No emission data yet. Students need to submit logs.
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-[minmax(0,5.5fr)_minmax(350px,4.5fr)]">
                  <div className="rounded-xl border border-[#e8eee9] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[14px] font-extrabold text-[#111827]">
                          Emissions by Grade
                        </h4>
                        <p className="mt-1 text-[11px] text-[#6b7280]">
                          Average CO2 per student log. Lower is better.
                        </p>
                      </div>
                      <span className="rounded-full bg-[#eef8f1] px-2.5 py-1 text-[11px] font-bold text-[#1a7a4a]">
                        {timeframeLabel}
                      </span>
                    </div>
                    <div className="flex min-h-[305px] items-center">
                      <ResponsiveContainer width="100%" height={305}>
                        <BarChart
                          data={gradeEmissions}
                          margin={{ top: 30, right: 12, left: -2, bottom: 4 }}
                          barGap={4}
                          barCategoryGap="1%"
                          barSize={70}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#edf2ee"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="grade"
                            tickFormatter={(v) => `Gr.${v}`}
                            tick={{ fontSize: 12, fontWeight: 700, fill: '#4b5563' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tickFormatter={(v) => `${v} kg`}
                            domain={[0, 'auto']}
                            tickCount={5}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            width={44}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(26, 122, 74, 0.06)' }}
                            contentStyle={{
                              borderRadius: 10,
                              border: '1px solid #dfe8e1',
                              fontSize: 12,
                              padding: '8px 10px',
                              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
                            }}
                            formatter={(v) => [`${formatNumber(v)} kg CO2`, 'Average']}
                            labelFormatter={(l) => `Grade ${l}`}
                          />
                          <Bar
                            dataKey="avgEmission"
                            radius={[10, 10, 0, 0]}
                            maxBarSize={55}
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="avgEmission"
                              position="top"
                              formatter={(value) => `${formatNumber(value)}kg`}
                              style={{
                                fill: '#374151',
                                fontSize: 11,
                                fontWeight: 800
                              }}
                            />
                            {gradeEmissions.map((entry, i) => (
                              <Cell
                                key={`${entry.grade}-${i}`}
                                fill={
                                  entry.avgEmission <= 2
                                    ? '#0f8a50'
                                    : entry.avgEmission <= 3.5
                                      ? '#f59e0b'
                                      : '#d92d20'
                                }
                                className="[transform-box:fill-box] [transform-origin:center_bottom] transition-all duration-200 hover:scale-y-[1.04] hover:opacity-95 hover:drop-shadow-[0_10px_12px_rgba(15,138,80,0.22)]"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8eee9] bg-[#fbfcfb] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#6b7280]">
                        Performance Summary
                      </p>
                      <h4 className="mt-1 text-[14px] font-extrabold text-[#111827]">
                        Grade Insights
                      </h4>
                    </div>

                    {[
                      {
                        label: 'Lowest Emission',
                        value: lowestGrade ? `Grade ${lowestGrade.grade}` : '-',
                        detail: `${formatNumber(lowestGrade?.avgEmission)} kg CO2`,
                        color: '#1a7a4a'
                      },
                      {
                        label: 'Highest Emission',
                        value: highestGrade ? `Grade ${highestGrade.grade}` : '-',
                        detail: `${formatNumber(highestGrade?.avgEmission)} kg CO2`,
                        color: '#c0392b'
                      },
                      {
                        label: 'Avg CO2',
                        value: `${formatNumber(gradeAverage)} kg`,
                        detail: 'Across visible grades',
                        color: '#0A3D25'
                      }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="mb-3 rounded-lg border border-[#eef2ee] bg-white px-3 py-3 last:mb-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12px] font-semibold text-[#6b7280]">
                            {item.label}
                          </span>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: item.color }}
                          />
                        </div>
                        <div className="mt-1 text-[16px] font-extrabold text-[#111827]">
                          {item.value}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6b7280]">
                          {item.detail}
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 rounded-lg border-l-4 border-[#1a7a4a] bg-[#eef8f1] px-3 py-2">
                      <p className="text-[11px] leading-5 text-[#355342]">
                        Green bars are under 2 kg CO2, amber bars are 2-3.5 kg,
                        and red bars need attention.
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
            {activeChart === 'sources' && (
              sourceBreakdown.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 13,
                    padding: '24px 0'
                  }}
                >
                  No source data yet.
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div style={{ flex: 1, width: '100%' }}>
                    <p style={{
                      fontSize: 11,
                      color: '#888',
                      marginBottom: 16
                    }}>
                      Average emission per log entry by source
                    </p>
                    {[
                      {
                        label: 'Transport',
                        value: data.emissionSources?.find(
                          s => s.category === 'Transport'
                        )?.value || 0,
                        color: '#f59e0b',
                        icon: <Bus size={14} color="#f59e0b" />
                      },
                      {
                        label: 'Lunch',
                        value: data.emissionSources?.find(
                          s => s.category === 'Lunch'
                        )?.value || 0,
                        color: '#1a7a4a',
                        icon: <Salad size={14} color="#1a7a4a" />
                      },
                      {
                        label: 'Waste',
                        value: data.emissionSources?.find(
                          s => s.category === 'Waste'
                        )?.value || 0,
                        color: '#c0392b',
                        icon: <Trash2 size={14} color="#c0392b" />
                      },
                      {
                        label: 'Energy',
                        value: data.emissionSources?.find(
                          s => s.category === 'Energy'
                        )?.value || 0,
                        color: '#3b82f6',
                        icon: <Zap size={14} color="#3b82f6" />
                      }
                    ].map(s => {
                      const total = data.emissionSources
                        ?.reduce((sum, x) => sum + x.value, 0) || 1
                      const pct = Math.round(
                        (s.value / total) * 100
                      )
                      return (
                        <div key={s.label} style={{
                          marginBottom: 14
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 5
                          }}>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#111'
                            }}>
                              <span style={{
                                width: 24, height: 24,
                                borderRadius: 6,
                                background: s.color + '18',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {s.icon}
                              </span>
                              {s.label}
                            </span>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: s.color
                            }}>
                              {s.value} kg
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: 8,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: s.color,
                              borderRadius: 4,
                              transition: 'width 0.6s ease'
                            }}/>
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: '#aaa',
                            marginTop: 3
                          }}>
                            {pct}% of total emission
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="w-full md:w-[280px] shrink-0">
                    <div style={{
                      background: '#f8faf8',
                      borderRadius: 10,
                      padding: '14px 16px',
                      marginBottom: 12
                    }}>
                      <p style={{
                        fontSize: 10,
                        color: '#888',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: 4
                      }}>
                        Avg total per log
                      </p>
                      <p style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: '#111',
                        margin: 0
                      }}>
                        {(data.emissionSources?.reduce(
                          (sum, s) => sum + s.value, 0
                        ) || 0).toFixed(1)} kg
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: '#888',
                        marginTop: 2
                      }}>
                        CO₂ per student per day
                      </p>
                    </div>
                    <div style={{
                      background: '#fff8ed',
                      borderRadius: 10,
                      padding: '12px 14px',
                      border: '1px solid #fcd34d'
                    }}>
                      <p style={{
                        fontSize: 10,
                        color: '#92600a',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: 4
                      }}>
                        Biggest source
                      </p>
                      <p style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#92600a',
                        margin: 0
                      }}>
                        <Bus size={16} color="#92600a" />
                        Transport
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: '#b45309',
                        marginTop: 2
                      }}>
                        Focus area for reduction
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
            {activeChart === 'eco' && (
              <div style={{ padding: '8px 0' }}>
                <p
                  style={{
                    fontSize: 12,
                    color: '#888',
                    marginBottom: 16
                  }}
                >
                  % of all log entries where students chose eco-friendly options
                </p>
                {ecoData.map((item, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6
                      }}
                    >
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#111',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7
                      }}>
                        <span style={{
                          width: 26, height: 26,
                          borderRadius: 6,
                          background: item.color + '18',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </span>
                        {item.action}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: item.color
                        }}
                      >
                        {item.pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 10,
                        background: '#f0f0f0',
                        borderRadius: 5,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${item.pct}%`,
                          height: 10,
                          background: item.color,
                          borderRadius: 5,
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          className="dashboard-grid dashboard-grid--split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24
          }}
        >
          <section className="dashboard-split-left" style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                Class Performance
              </h3>
              <div style={{ overflow: 'auto', flex: 1, maxHeight: 360 }}>
                <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eef2ee' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>S.N</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Class</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Students</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Avg Emission</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>
                        Total Logs{' '}
                        <span
                          title="The number of daily carbon logs submitted by this class."
                          style={{ cursor: 'help', color: '#0A3D25' }}
                        >
                          ⓘ
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(schoolPerformance || []).map((school) => (
                      <tr key={`${school.className}-${school.rank}`} style={{ borderBottom: '1px solid #f5f7f6' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{school.rank}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{school.className || school.schoolName}</td>
                        <td style={{ padding: '12px 8px' }}>{formatInt(school.studentCount)}</td>
                        <td style={{ padding: '12px 8px' }}>{formatNumber(school.avgEmissionKg)} kg CO₂</td>
                        <td style={{ padding: '12px 8px' }}>{formatInt(school.totalLogs || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </section>

        <section
          className="dashboard-grid dashboard-grid--bottom grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <section className="dashboard-bottom-left flex lg:col-span-6" style={cardStyle}>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="mb-4 text-[15px] font-bold text-[#111]">Activity Feed</h3>
              <div className="flex flex-1 flex-col">
                {activityFeed.length === 0 ? (
                  <div className="px-6 py-6 text-center text-sm text-[#888]">
                    No activity yet. Students need to submit carbon logs.
                  </div>
                ) : (
                  <>
                    <div className="flex max-h-[340px] flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                      {activityFeed.map((entry, index) => {
                        const style = feedStyle[entry.type] || feedStyle.MIRROR;
                        const FeedIcon = style.icon;
                        return (
                          <div key={`${entry.type}-${index}`} className="flex items-center gap-3 border-b border-[#f2f4f1] py-3 last:border-b-0">
                            {entry.type !== 'MIRROR' && (
                              <div className="inline-flex shrink-0 items-center justify-center rounded-full p-2" style={{ background: style.bg }}>
                                <FeedIcon size={14} color={style.color} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-[#111827]">{entry.description}</div>
                              <div className="text-xs text-[#6b7280]">
                                {timeAgo(entry.createdAt)} · {entry.school}
                              </div>
                            </div>
                            {entry.type !== 'MIRROR' && (
                              <span className="rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: style.bg, color: style.color }}>
                                {entry.type}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </>
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-right flex lg:col-span-6" style={cardStyle}>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="mb-4 text-[15px] font-bold text-[#111]">Student Streaks</h3>
              <div className="flex flex-1 flex-col">
                {streakRows.length === 0 ? (
                  <div className="px-5 py-5 text-center text-sm text-[#888]">
                    No students found for this school.
                  </div>
                ) : (
                  <>
                    <div className="flex max-h-[340px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
                      {streakRows.map((student) => (
                        <div
                          key={`${student.name}-${student.grade}-${student.section || ''}`}
                          className="flex items-center gap-3 border-b border-[#f5f5f5] pb-3 last:border-b-0 last:pb-0"
                        >
                          <div
                            className="inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1.5 text-[12px] font-bold"
                            style={{
                              background: '#e6f4ed',
                              color: '#1a7a4a'
                            }}
                          >
                            {initials(student.name || '')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111]">
                              {student.name}
                            </div>
                            <div className="text-xs text-[#6b7280]">
                              Grade {student.grade || '—'}
                            </div>
                            <div className="mt-1 text-[11px] text-[#888]">
                              {formatInt(student.totalLogDays)} logs total
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className={`text-sm font-extrabold ${student.currentStreak > 0 ? 'text-[#1a7a4a]' : 'text-[#888]'}`}>
                              {student.currentStreak} days
                            </div>
                            <div className="mt-1 text-[10px] text-[#aaa]">best: {student.longestStreak} days</div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
