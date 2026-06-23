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
  Wind
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

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  label,
  onChange
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) {
        acc.push('...');
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 14,
        borderTop: '1px solid #f0f0f0'
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: '#aaa',
          fontWeight: 400
        }}
      >
        {start}–{end} of {total} {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            background: '#fff',
            color: page === 1 ? '#ddd' : '#555',
            fontSize: 14,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500
          }}
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#aaa'
              }}
            >
              •••
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: page === p ? 'none' : '1px solid #e8e8e8',
                background: page === p ? '#1a7a4a' : '#fff',
                color: page === p ? '#fff' : '#555',
                fontSize: 12,
                fontWeight: page === p ? 700 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            background: '#fff',
            color: page === totalPages ? '#ddd' : '#555',
            fontSize: 14,
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('30');
  const [activeChart, setActiveChart] = useState('grades'); // 'grades' | 'sources' | 'eco'
  const [classPage, setClassPage] = useState(1);
  const [streakPage, setStreakPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const isFirstLoad = useRef(true);
  const CLASS_PAGE_SIZE = 5;
  const STREAK_PAGE_SIZE = 5;
  const ACTIVITY_PAGE_SIZE = 4;
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
      icon: '🚶'
    },
    {
      action: 'Veg Lunch',
      pct: Number(data.ecoActions?.vegLunchPct || 0),
      color: '#4ecf96',
      icon: '🥗'
    },
    {
      action: 'No Plastic',
      pct: Number(data.ecoActions?.noPlasticPct || 0),
      color: '#3b82f6',
      icon: '♻'
    },
    {
      action: 'No Food Waste',
      pct: Number(data.ecoActions?.noFoodWastePct || 0),
      color: '#f59e0b',
      icon: '🍱'
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
  const paginatedClasses = (schoolPerformance || []).slice(
    (classPage - 1) * CLASS_PAGE_SIZE,
    classPage * CLASS_PAGE_SIZE
  );
  const classTotalPages = Math.ceil(
    (schoolPerformance?.length || 0) / CLASS_PAGE_SIZE
  );
  const paginatedStreaks = streakRows.slice(
    (streakPage - 1) * STREAK_PAGE_SIZE,
    streakPage * STREAK_PAGE_SIZE
  );
  const streakTotalPages = Math.ceil(
    (streakRows.length || 0) / STREAK_PAGE_SIZE
  );
  const paginatedActivity = activityFeed.slice(
    (activityPage - 1) * ACTIVITY_PAGE_SIZE,
    activityPage * ACTIVITY_PAGE_SIZE
  );
  const activityTotalPages = Math.ceil(
    (activityFeed.length || 0) / ACTIVITY_PAGE_SIZE
  );

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
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 24
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="dashboard-stat-card"
              style={{
                ...cardStyle,
                gridColumn: 'span 3'
              }}
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
              (data.gradeDistribution || []).length === 0 ? (
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
                <div style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 24
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 11,
                      color: '#888',
                      marginBottom: 10
                    }}>
                      Average CO₂ per grade. Lower is better.
                    </p>
                    <ResponsiveContainer width="100%" height={270}>
                      <BarChart
                        data={data.gradeDistribution}
                        margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
                        barCategoryGap="10%"
                        barSize={34}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="grade"
                          tickFormatter={v => `Gr.${v}`}
                          tick={{ fontSize: 11, fill: '#999' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={v => `${v} kg`}
                          domain={[0, 'auto']}
                          tickCount={5}
                          tick={{ fontSize: 11, fill: '#999' }}
                          axisLine={false}
                          tickLine={false}
                          width={48}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: '1px solid #eef0ee',
                            fontSize: 12,
                            padding: '6px 10px',
                            boxShadow: 'none'
                          }}
                          formatter={v => [`${v} kg CO₂`, 'Avg Emission']}
                          labelFormatter={l => `Grade ${l}`}
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                        />
                        <Bar
                          dataKey="avgEmission"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={34}
                          isAnimationActive={true}
                        >
                          {data.gradeDistribution.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={
                                entry.avgEmission <= 2   ? '#1a7a4a' :
                                entry.avgEmission <= 3.5 ? '#f59e0b' :
                                '#c0392b'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{
                    width: 250,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    background: '#fbfcfb',
                    border: '1px solid #eef2ee',
                    borderRadius: 12,
                    padding: '16px 18px'
                  }}>
                    <p style={{
                      fontSize: 11,
                      color: '#888',
                      margin: '0 0 6px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}>
                      Performance key
                    </p>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#111',
                      margin: '0 0 14px'
                    }}>
                      Emissions by Grade
                    </h4>
                    {[
                      {
                        color: '#1a7a4a',
                        label: 'Good',
                        sub: 'Under 2 kg CO₂'
                      },
                      {
                        color: '#f59e0b',
                        label: 'Moderate',
                        sub: '2 – 3.5 kg CO₂'
                      },
                      {
                        color: '#c0392b',
                        label: 'Needs attention',
                        sub: 'Above 3.5 kg CO₂'
                      }
                    ].map(l => (
                      <div key={l.label} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 14
                      }}>
                        <div style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: l.color,
                          flexShrink: 0,
                          marginTop: 4
                        }}/>
                        <div>
                          <div style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#111'
                          }}>
                            {l.label}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: '#888'
                          }}>
                            {l.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{
                      marginTop: 18,
                      padding: '10px 12px',
                      background: '#f4f8f5',
                      borderRadius: 8,
                      borderLeft: '3px solid #1a7a4a'
                    }}>
                      <p style={{
                        fontSize: 11,
                        color: '#555',
                        lineHeight: 1.5,
                        margin: 0
                      }}>
                        Grade 12 has the lowest avg emission.
                        Grade 8 needs the most improvement.
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
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 32
                }}>
                  <div style={{ flex: 1 }}>
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
                        icon: '🚌'
                      },
                      {
                        label: 'Lunch',
                        value: data.emissionSources?.find(
                          s => s.category === 'Lunch'
                        )?.value || 0,
                        color: '#1a7a4a',
                        icon: '🥗'
                      },
                      {
                        label: 'Waste',
                        value: data.emissionSources?.find(
                          s => s.category === 'Waste'
                        )?.value || 0,
                        color: '#c0392b',
                        icon: '🗑'
                      },
                      {
                        label: 'Energy',
                        value: data.emissionSources?.find(
                          s => s.category === 'Energy'
                        )?.value || 0,
                        color: '#3b82f6',
                        icon: '⚡'
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
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#111',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              {s.icon} {s.label}
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
                  <div style={{
                    width: 180,
                    flexShrink: 0
                  }}>
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
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#92600a',
                        margin: 0
                      }}>
                        🚌 Transport
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
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111'
                        }}
                      >
                        {item.icon} {item.action}
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
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 24
          }}
        >
          <section className="dashboard-split-left" style={{ ...cardStyle, gridColumn: 'span 12' }}>
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
                    {paginatedClasses.map((school) => (
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
              <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                <Pagination
                  page={classPage}
                  totalPages={classTotalPages}
                  total={schoolPerformance?.length || 0}
                  pageSize={CLASS_PAGE_SIZE}
                  label="grades"
                  onChange={setClassPage}
                />
              </div>
            </div>
          </section>

        </section>

        <section
          className="dashboard-grid dashboard-grid--bottom"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gap: 24
          }}
        >
          <section className="dashboard-bottom-left col-span-6 flex" style={{ ...cardStyle, gridColumn: 'span 6' }}>
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
                      {paginatedActivity.map((entry, index) => {
                        const style = feedStyle[entry.type] || feedStyle.MIRROR;
                        const FeedIcon = style.icon;
                        return (
                          <div key={`${entry.type}-${index}`} className="flex items-center gap-3 border-b border-[#f2f4f1] py-3 last:border-b-0">
                            <div className="inline-flex shrink-0 items-center justify-center rounded-full p-2" style={{ background: style.bg }}>
                              <FeedIcon size={14} color={style.color} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-[#111827]">{entry.description}</div>
                              <div className="text-xs text-[#6b7280]">
                                {timeAgo(entry.createdAt)} · {entry.school}
                              </div>
                            </div>
                            <span className="rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: style.bg, color: style.color }}>
                              {entry.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <Pagination
                      page={activityPage}
                      totalPages={activityTotalPages}
                      total={activityFeed.length}
                      pageSize={ACTIVITY_PAGE_SIZE}
                      label="activities"
                      onChange={setActivityPage}
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-right col-span-6 flex" style={{ ...cardStyle, gridColumn: 'span 6' }}>
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
                      {paginatedStreaks.map((student) => (
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

                    <Pagination
                      page={streakPage}
                      totalPages={streakTotalPages}
                      total={streakRows.length}
                      pageSize={STREAK_PAGE_SIZE}
                      label="students"
                      onChange={setStreakPage}
                    />
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
