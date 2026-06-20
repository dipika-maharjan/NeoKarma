'use client';

import { useEffect, useState } from 'react';
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
import apiClient from '@/lib/api/axios';
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

const donutDash = (pct) => {
  const r = 50;
  const circ = 2 * Math.PI * r;
  return `${(pct / 100) * circ} ${circ}`;
};

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
  height: '100%',
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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #f5f5f5'
      }}
    >
      <span style={{ fontSize: 11, color: '#888' }}>
        {start}–{end} of {total} {label}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #e0e0e0',
            background: page === 1 ? '#f5f5f5' : '#fff',
            color: page === 1 ? '#ccc' : '#111',
            fontSize: 11,
            fontWeight: 600,
            cursor: page === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #e0e0e0',
              background: page === p ? '#1a7a4a' : '#fff',
              color: page === p ? '#fff' : '#111',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: 28
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #e0e0e0',
            background: page === totalPages ? '#f5f5f5' : '#fff',
            color: page === totalPages ? '#ccc' : '#111',
            fontSize: 11,
            fontWeight: 600,
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          →
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
  const [activeChart, setActiveChart] = useState('grades'); // 'grades' | 'sources' | 'eco'
  const [classPage, setClassPage] = useState(1);
  const [streakPage, setStreakPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const CLASS_PAGE_SIZE = 5;
  const STREAK_PAGE_SIZE = 5;
  const ACTIVITY_PAGE_SIZE = 4;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/dashboard');
        const dashboardData = response.data || null;
        console.log('Dashboard data:', dashboardData);
        console.log('Total students:', dashboardData?.stats?.totalStudents);
        console.log('Total reports:', dashboardData?.stats?.totalReports);
        console.log('Student streaks:', dashboardData?.studentStreaks);
        setData(dashboardData);
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, router]);

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
    systemImpact,
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

  const impact = systemImpact || {};
  const remainingPct = Math.max(0, 100 - (impact.targetMetPct || 0));

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

        <section style={{ ...cardStyle, height: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 24,
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
          <div style={{ width: '100%', height: 320 }}>
            {activeChart === 'grades' && (
              (data.gradeDistribution || []).length === 0 ? (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 13
                  }}
                >
                  No emission data yet. Students need to submit logs.
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#888',
                      marginBottom: 12
                    }}
                  >
                    Average CO₂ emission per grade (kg). Lower is better.
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={data.gradeDistribution || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      barCategoryGap="40%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="grade"
                        tickFormatter={(value) => `Grade ${value}`}
                        tick={{ fontSize: 12, fill: '#888' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value} kg`}
                        tick={{ fontSize: 12, fill: '#888' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: '1px solid #eef0ee',
                          fontSize: 12
                        }}
                        formatter={(value) => [`${value} kg CO₂`, 'Avg Emission']}
                        labelFormatter={(label) => `Grade ${label}`}
                      />
                      <Bar
                        dataKey="avgEmission"
                        radius={[6, 6, 0, 0]}
                        name="Avg Emission"
                      >
                        {(data.gradeDistribution || []).map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              entry.avgEmission <= 2
                                ? '#1a7a4a'
                                : entry.avgEmission <= 3.5
                                  ? '#f59e0b'
                                  : '#c0392b'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: 'flex',
                      gap: 20,
                      justifyContent: 'center',
                      marginTop: 12
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#555'
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#1a7a4a'
                        }}
                      />
                      Good (under 2kg)
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#555'
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#f59e0b'
                        }}
                      />
                      Moderate (2–3.5kg)
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#555'
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#c0392b'
                        }}
                      />
                      High (above 3.5kg)
                    </div>
                  </div>
                </div>
              )
            )}
            {activeChart === 'sources' && (
              sourceBreakdown.length === 0 ? (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 13
                  }}
                >
                  No source data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceBreakdown}
                    margin={{ top: 18, right: 20, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #eef0ee',
                        fontSize: 12
                      }}
                      formatter={(value) => [`${Number(value || 0).toFixed(2)} kg`, 'Avg Emission']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Avg Emission">
                      {sourceBreakdown.map((entry, index) => (
                        <Cell key={`${entry.category}-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(value) => `${Number(value || 0).toFixed(2)} kg`}
                        style={{ fill: '#111827', fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
                          height: '100%',
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
          <section className="dashboard-split-left" style={{ ...cardStyle, gridColumn: 'span 8' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                Class Performance
              </h3>
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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

          <section className="dashboard-split-right" style={{ ...cardStyle, gridColumn: 'span 4' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>System impact</p>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Target met</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#e8ede8" strokeWidth="13" />
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="none"
                    stroke="#0e6b45"
                    strokeWidth="13"
                    strokeDasharray={donutDash(impact.targetMetPct || 0)}
                    strokeDashoffset={2 * Math.PI * 50 * 0.25}
                    strokeLinecap="round"
                    transform="rotate(-90 65 65)"
                  />
                  <text x="65" y="58" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111">
                    {impact.targetMetPct || 0}%
                  </text>
                  <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#888">
                    Target Met
                  </text>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                    Eco transport — {impact.ecoTransportPct || 0}%
                  </div>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                    Veg days — {impact.vegDaysPct || 0}%
                  </div>
                  <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                    No plastic — {impact.noPlasticPct || 0}%
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    Remaining — {remainingPct}%
                  </div>
                </div>
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
          <section className="dashboard-bottom-left" style={{ ...cardStyle, gridColumn: 'span 6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                Activity Feed
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
                {activityFeed.length === 0 ? (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#888',
                      fontSize: 13
                    }}
                  >
                    No activity yet. Students need to submit carbon logs.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {paginatedActivity.map((entry, index) => {
                        const style = feedStyle[entry.type] || feedStyle.MIRROR;
                        const FeedIcon = style.icon;
                        return (
                          <div key={`${entry.type}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f2f4f1' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FeedIcon size={14} color={style.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: '#111827' }}>{entry.description}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>
                                {timeAgo(entry.createdAt)} · {entry.school}
                              </div>
                            </div>
                            <span style={{ background: style.bg, color: style.color, borderRadius: 999, fontSize: 12, padding: '5px 9px', fontWeight: 700 }}>
                              {entry.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <Pagination
                        page={activityPage}
                        totalPages={activityTotalPages}
                        total={activityFeed.length}
                        pageSize={ACTIVITY_PAGE_SIZE}
                        label="activities"
                        onChange={setActivityPage}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-right" style={{ ...cardStyle, gridColumn: 'span 6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                Student Streaks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
                {streakRows.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#888',
                      fontSize: 13
                    }}
                  >
                    No students found for this school.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                      {paginatedStreaks.map((student) => (
                        <div
                          key={`${student.name}-${student.grade}-${student.section || ''}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 999, background: student.atRisk ? '#fef2f2' : '#e6f4ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: student.atRisk ? '#c0392b' : '#1a7a4a', flexShrink: 0 }}>
                            {initials(student.name || '')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {student.name}
                              {student.atRisk && (
                                <span style={{ fontSize: 10, background: '#fef2f2', color: '#c0392b', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                                  At risk
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>
                              {student.grade}{student.section ? ` • ${student.section}` : ''}
                            </div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                              {formatInt(student.totalLogDays)} logs total
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: student.currentStreak > 0 ? '#1a7a4a' : '#888' }}>{student.currentStreak} days</div>
                            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>best: {student.longestStreak} days</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <Pagination
                        page={streakPage}
                        totalPages={streakTotalPages}
                        total={streakRows.length}
                        pageSize={STREAK_PAGE_SIZE}
                        label="students"
                        onChange={setStreakPage}
                      />
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
