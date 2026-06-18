'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/axios';

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
  MIRROR: { bg: '#e6f4ed', color: '#0e6b45', icon: '◌' },
  AWARD: { bg: '#e8f0fc', color: '#1a56b0', icon: '✦' },
  MILESTONE: { bg: '#fef3e0', color: '#92600a', icon: '↗' }
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/dashboard');
        setData(response.data || null);
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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

  const { stats, schoolPerformance, topStudents, liveActivity, systemImpact } = data;

  const statCards = [
    {
      label: 'Total Schools',
      value: formatInt(stats.totalSchools),
      icon: '🏫'
    },
    {
      label: 'Total Students',
      value: formatInt(stats.totalStudents),
      icon: '👥'
    },
    {
      label: 'Avg Emission',
      value: `${formatNumber(stats.avgEmissionKg)}kg`,
      icon: '🌿'
    },
    {
      label: 'Reports',
      value: formatInt(stats.totalReports),
      icon: '📄'
    },
    {
      label: 'Certificates',
      value: formatInt(stats.totalCertificates),
      icon: '🏅'
    }
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7f6',
        padding: 24,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(90deg, #0A3D25 0%, #165d35 100%)',
            color: '#fff',
            borderRadius: 18,
            padding: '22px 24px',
            marginBottom: 18,
            boxShadow: '0 10px 30px rgba(10,61,37,0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Admin dashboard</p>
              <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800 }}>Neoकर्म</h1>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '10px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {formatInt(stats.totalStudents)} students enrolled
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
                borderRadius: 14,
                padding: '18px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{card.label}</span>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
              </div>
              <h2 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800, color: '#0A3D25' }}>
                {card.value}
              </h2>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 18 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>School performance</p>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Top schools</h3>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eef2ee' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>School</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Students</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Avg Emission</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#6b7280' }}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolPerformance.map((school) => (
                    <tr key={school.rank} style={{ borderBottom: '1px solid #f5f7f6' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>#{school.rank}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{school.schoolName}</td>
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

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8ece7', padding: 16 }}>
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

        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Live activity</p>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Activity feed</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {liveActivity.map((entry, index) => {
                const style = feedStyle[entry.type] || feedStyle.MIRROR;
                return (
                  <div key={`${entry.type}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f2f4f1' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.color, fontWeight: 700 }}>
                      {style.icon}
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
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8ece7', padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Top students</p>
              <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 700, color: '#0A3D25' }}>Leaderboard</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topStudents.map((student, index) => (
                <div key={`${student.name}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: '#eef5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A3D25' }}>
                    {initials(student.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {student.school} · {student.grade}{student.section}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0A3D25' }}>{student.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
