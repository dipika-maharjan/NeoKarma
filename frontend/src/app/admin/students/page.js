'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
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
          : statusFilter === 'at-risk'
            ? student.atRisk
            : statusFilter === 'active'
              ? !student.atRisk
              : true;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  const summary = useMemo(() => {
    const activeCount = students.filter((student) => !student.atRisk).length;
    const atRiskCount = students.filter((student) => student.atRisk).length;
    const avgMarks =
      students.length > 0
        ? students.reduce((sum, item) => sum + Number(item.marksAwarded || 0), 0) /
          students.length
        : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeCount,
      atRiskStudents: atRiskCount,
      avgMarks
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
              label: 'Active learners',
              value: formatInt(summary.activeStudents),
              accent: 'bg-[#eef6ff]'
            },
            {
              label: 'At risk',
              value: formatInt(summary.atRiskStudents),
              accent: 'bg-[#fff7ed]'
            },
            {
              label: 'Avg marks',
              value: formatNumber(summary.avgMarks),
              accent: 'bg-[#f5f3ff]'
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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students"
                className="w-full outline-none md:w-72"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm outline-none"
              >
                <option value="all">All students</option>
                <option value="active">Active</option>
                <option value="at-risk">At risk</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#eef0ee]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#eef0ee] text-sm">
                <thead className="bg-[#f9faf9] text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-left font-semibold">Class</th>
                    <th className="px-4 py-3 text-left font-semibold">Logs</th>
                    <th className="px-4 py-3 text-left font-semibold">Streak</th>
                    <th className="px-4 py-3 text-left font-semibold">Marks</th>
                    <th className="px-4 py-3 text-left font-semibold">Last log</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0ee] bg-white">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-[#f9fbfa]">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-[#111827]">{student.name}</p>
                          <p className="text-xs text-[#6b7280]">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#f5f7f6] px-2.5 py-1 text-xs font-medium text-[#0A3D25]">
                          Grade {student.grade || '—'} · {student.section || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#111827]">{formatInt(student.totalLogs)}</td>
                      <td className="px-4 py-3 text-[#111827]">{student.currentStreak} day{student.currentStreak === 1 ? '' : 's'}</td>
                      <td className="px-4 py-3 text-[#111827]">{formatNumber(student.marksAwarded)}</td>
                      <td className="px-4 py-3 text-[#111827]">{formatDate(student.lastLogAt)}</td>
                      <td className="px-4 py-3">
                        {student.atRisk ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#b45309]">
                            <AlertTriangle size={12} /> At risk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f1] px-2.5 py-1 text-xs font-semibold text-[#0A3D25]">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
