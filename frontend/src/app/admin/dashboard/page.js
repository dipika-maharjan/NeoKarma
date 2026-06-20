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
  Cell
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('grades');

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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f7f3 0%, #eef5f0 100%)',
        padding: 24,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(90deg, #0f5d3b 0%, #1a7a4a 100%)',
            color: '#fff',
            borderRadius: 22,
            padding: '28px 26px',
            marginBottom: 18,
            boxShadow: '0 18px 40px rgba(10,61,37,0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 18
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: '#fff',
                border: '1px solid #e8ece7',
                borderRadius: 16,
                padding: '18px 16px',
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{card.label}</span>
                <div
                  style={{
                    width: 40,
                    height: 40,
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
              <h2 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800, color: '#0A3D25' }}>
                {card.value}
              </h2>
            </div>
          ))}
        </section>

        <section
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #eef0ee',
            padding: '22px 24px',
            marginBottom: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 24
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
                Student performance
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>
                Grade Analytics
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
                { key: 'grades', label: 'By Grade' },
                { key: 'marks', label: 'Marks Range' },
                { key: 'activity', label: 'Weekly Logs' }
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
          <div style={{ width: '100%', height: 280 }}>
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
                  No grade data yet. Students need to be assigned grades.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.gradeDistribution || []}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="grade"
                      tickFormatter={(value) => `Grade ${value}`}
                      tick={{ fontSize: 12, fill: '#888' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #eef0ee',
                        fontSize: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                      formatter={(value, name) => [
                        value,
                        name === 'studentCount'
                          ? 'Students'
                          : name === 'avgMarks'
                            ? 'Avg Marks'
                            : 'Avg Streak'
                      ]}
                      labelFormatter={(label) => `Grade ${label}`}
                    />
                    <Legend
                      formatter={(value) =>
                        value === 'studentCount'
                          ? 'Students'
                          : value === 'avgMarks'
                            ? 'Avg Marks'
                            : 'Avg Streak'
                      }
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="studentCount" fill="#1a7a4a" radius={[6, 6, 0, 0]} name="studentCount" />
                    <Bar dataKey="avgMarks" fill="#4ecf96" radius={[6, 6, 0, 0]} name="avgMarks" />
                    <Bar dataKey="avgStreak" fill="#f59e0b" radius={[6, 6, 0, 0]} name="avgStreak" />
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
            {activeChart === 'marks' && (
              (data.marksDistribution || []).length === 0 ? (
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
                  No marks data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.marksDistribution || []}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    barCategoryGap="40%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #eef0ee',
                        fontSize: 12
                      }}
                      formatter={(value) => [value, 'Students']}
                      labelFormatter={(label) => `Marks: ${label}`}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                      {(data.marksDistribution || []).map((entry, index) => (
                        <Cell
                          key={`${entry.range}-${index}`}
                          fill={
                            index === 0
                              ? '#fde8e8'
                              : index === 1
                                ? '#f59e0b'
                                : index === 2
                                  ? '#4ecf96'
                                  : '#1a7a4a'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
            {activeChart === 'activity' && (
              (data.weeklyActivity || []).length === 0 ? (
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
                  No log activity in the last 7 days.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.weeklyActivity || []}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      }
                      tick={{ fontSize: 12, fill: '#888' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #eef0ee',
                        fontSize: 12
                      }}
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })
                      }
                      formatter={(value, name) => [
                        value,
                        name === 'logs' ? 'Logs submitted' : 'Avg Emission (kg)'
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        value === 'logs' ? 'Logs submitted' : 'Avg Emission (kg)'
                      }
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="logs"
                      stroke="#1a7a4a"
                      strokeWidth={2.5}
                      dot={{ fill: '#1a7a4a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgEmission"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 16, marginBottom: 18 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>School performance</p>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Class performance</h3>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eef2ee' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Class</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Students</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Avg Emission</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolPerformance.map((school) => (
                    <tr key={school.rank} style={{ borderBottom: '1px solid #f5f7f6' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>#{school.rank}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{school.className || school.schoolName}</td>
                      <td style={{ padding: '12px 8px' }}>{formatInt(school.studentCount)}</td>
                      <td style={{ padding: '12px 8px' }}>{formatNumber(school.avgEmissionKg)} kg CO₂</td>
                      <td style={{ padding: '12px 8px' }}>
                        {formatInt(school.avgScore)}
                        <div style={{ width: 60, height: 5, background: '#eef2ee', borderRadius: 999, marginTop: 6 }}>
                          <div
                            style={{
                              width: `${Math.min(100, school.avgScore)}%`,
                              height: '100%',
                              background: '#0e6b45',
                              borderRadius: 999
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>System impact</p>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Target met</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="50" fill="none" stroke="#e8ede8" strokeWidth="13" />
                <circle
                  cx="65"
                  cy="65"
                  r="50"
                  fill="none"
                  stroke="#0e6b45"
                  strokeWidth="13"
                  strokeDasharray={donutDash(systemImpact.targetMetPct)}
                  strokeDashoffset={2 * Math.PI * 50 * 0.25}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                />
                <text x="65" y="58" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111">
                  {systemImpact.targetMetPct}%
                </text>
                <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#888">
                  Target Met
                </text>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                  Transport Redux — {systemImpact.transportReduxPct}%
                </div>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
                  Meat-free Days — {systemImpact.meatFreeDaysPct}%
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Remaining — {systemImpact.remainingPct}%
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.95fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Live activity</p>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Activity feed</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                activityFeed.map((entry, index) => {
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
              }))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Student streaks</p>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Streaks</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                streakRows.map((student) => (
                <div key={`${student.name}-${student.grade}-${student.section || ''}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
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
              )))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
