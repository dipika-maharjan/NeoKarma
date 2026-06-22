'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown,
  Download,
  Search,
  Users,
  Zap
} from 'lucide-react';
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

export default function AdminStudentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/students');
        setStudents(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isAuthenticated, router]);

  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesQuery =
        !term ||
        [student.name, student.email, student.section, String(student.grade)]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : student.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  const summary = useMemo(() => {
    const activeCount = students.filter((student) => student.status === 'active').length;
    const atRiskCount = students.filter((student) => student.status === 'at_risk').length;
    const inactiveCount = students.filter((student) => student.status === 'inactive').length;
    const avgEmission =
      students.length > 0
        ? students.reduce((sum, item) => sum + Number(item.avgEmission || 0), 0) /
          students.length
        : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeCount,
      atRiskStudents: atRiskCount,
      inactiveStudents: inactiveCount,
      avgEmission
    };
  }, [students]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7f6] p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-white"
            />
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

  return (
    <main className="min-h-screen bg-[#f5f7f6] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Student overview
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#0A3D25]">Students</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#f5f7f6] px-3 py-2 text-sm text-[#0A3D25]">
              <Users size={16} />
              <span>{formatInt(summary.totalStudents)} students</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: 'Total students',
              value: formatInt(summary.totalStudents),
              accent: 'bg-[#eef8f1]'
            },
            {
              label: 'Active',
              value: formatInt(summary.activeStudents),
              accent: 'bg-[#eef6ff]'
            },
            {
              label: 'At risk',
              value: formatInt(summary.atRiskStudents),
              accent: 'bg-[#fff7ed]'
            },
            {
              label: 'Inactive',
              value: formatInt(summary.inactiveStudents),
              accent: 'bg-[#f5f5f5]'
            }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-xl p-2 ${item.accent}`}>
                <Zap size={18} className="text-[#0A3D25]" />
              </div>
              <p className="mt-3 text-sm text-[#6b7280]">{item.label}</p>
              <h2 className="mt-1 text-2xl font-bold text-[#0A3D25]">{item.value}</h2>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm">
              <Search size={16} className="text-[#6b7280]" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search students"
                className="w-full outline-none md:w-72"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm outline-none"
              >
                <option value="all">All students</option>
                <option value="active">Active</option>
                <option value="at_risk">At risk</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#eef0ee]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#eef0ee] text-sm">
                <thead className="bg-[#f9faf9] text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-left font-semibold">Grade</th>
                    <th className="px-4 py-3 text-left font-semibold">Streak</th>
                    <th className="px-4 py-3 text-left font-semibold">Logs</th>
                    <th className="px-4 py-3 text-left font-semibold">Avg Emission</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0ee] bg-white">
                  {paginatedStudents.map((student) => {
                    const statusConfig = {
                      active: {
                        label: '● Active',
                        bg: '#e6f4ed',
                        color: '#1a7a4a'
                      },
                      at_risk: {
                        label: '⚠ At risk',
                        bg: '#fff8ed',
                        color: '#92600a'
                      },
                      inactive: {
                        label: '○ Inactive',
                        bg: '#f5f5f5',
                        color: '#888'
                      }
                    };

                    const cfg = statusConfig[student.status] || statusConfig.inactive;

                    return (
                      <tr key={student._id} className="hover:bg-[#f9fbfa]">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-[#111827]">{student.name}</p>
                            <p className="text-xs text-[#6b7280]">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#f5f7f6] px-2.5 py-1 text-xs font-medium text-[#0A3D25]">
                            Grade {student.grade || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#111827]">{student.currentStreak} day{student.currentStreak === 1 ? '' : 's'}</td>
                        <td className="px-4 py-3 text-[#111827]">{formatInt(student.totalLogs)}</td>
                        <td className="px-4 py-3">
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color:
                                student.avgEmission === 0
                                  ? '#aaa'
                                  : student.avgEmission <= 2
                                    ? '#1a7a4a'
                                    : student.avgEmission <= 4
                                      ? '#f59e0b'
                                      : '#c0392b'
                            }}
                          >
                            {student.avgEmission === 0
                              ? 'No logs'
                              : `${student.avgEmission} kg`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: cfg.bg,
                            color: cfg.color
                          }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#111827]">{formatDate(student.lastLogAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#eef0ee] pt-4">
            <span className="text-xs text-[#6b7280]">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  page === 1
                    ? 'cursor-not-allowed border-[#eef0ee] bg-[#f9faf9] text-[#cbd5e1]'
                    : 'border-[#e5e7eb] bg-white text-[#111827] hover:bg-[#f9faf9]'
                }`}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#6b7280]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      onClick={() => setPage(p)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                        page === p
                          ? 'border-[#1a7a4a] bg-[#1a7a4a] text-white'
                          : 'border-[#e5e7eb] bg-white text-[#111827] hover:bg-[#f9faf9]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  page === totalPages || totalPages === 0
                    ? 'cursor-not-allowed border-[#eef0ee] bg-[#f9faf9] text-[#cbd5e1]'
                    : 'border-[#e5e7eb] bg-white text-[#111827] hover:bg-[#f9faf9]'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
