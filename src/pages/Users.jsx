import React, { useEffect, useState } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Smartphone, 
  Globe2, 
  Calendar, 
  Clock,
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Gem,
  IndianRupee,
  Wallet,
  Sparkles,
  UserPlus,
  Bell
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

// Helper to format Date & Time in IST (Asia/Kolkata)
const formatJoinDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

// Helper to calculate connected tenure (how long user has been with us)
const getConnectedDuration = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const joined = new Date(dateStr);
  const diffMs = now - joined;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Joined just now';
  if (diffHours < 24) return `Joined today (${diffHours}h ago)`;
  if (diffDays === 1) return 'Joined yesterday';
  if (diffDays < 30) return `Connected ${diffDays} days`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Connected 1 month';
  return `Connected ${diffMonths} months`;
};

const Users = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialActivity = searchParams.get('activity') || 'active_today';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState(initialActivity);
  const [language, setLanguage] = useState('all');
  const [status, setStatus] = useState('all');

  // Sync URL query param if present
  useEffect(() => {
    const paramAct = searchParams.get('activity');
    if (paramAct && paramAct !== activity) {
      setActivity(paramAct);
      setPage(1);
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: {
          page,
          limit: 15,
          search,
          activity,
          language,
          status,
        },
      });
      setUsers(res.data?.data?.users || []);
      setPagination(res.data?.data?.pagination || { total_count: 0, total_pages: 1 });
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, activity, language, status]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const activityTabs = [
    { id: 'all', label: 'All Artisans' },
    { id: 'new_users', label: '✨ New Joined (Last 7 Days)', highlight: true },
    { id: 'active_today', label: 'Active Today (Daily)' },
    { id: 'active_7d', label: 'Active (Week / 7 Days)' },
    { id: 'active_15d', label: 'Active (15 Days)' },
    { id: 'active_monthly', label: 'Active (Monthly)' },
    { id: 'inactive_7d', label: 'Inactive (>7 Days)' },
    { id: 'inactive_14d', label: 'Inactive (>14 Days)' },
    { id: 'never_logged', label: 'Never Logged' },
  ];

  // Theme classes
  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isDark ? 'bg-slate-950/70 text-slate-400' : 'bg-slate-100/90 text-slate-600';
  const tableBorder = isDark ? 'divide-slate-800/70 border-slate-800' : 'divide-slate-200 border-slate-200';
  const inputBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center space-x-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <UsersIcon className="w-6 h-6 text-cyan-500" />
            <span>Artisan Directory & Work Tracking</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
            Track when users join, how long they stay connected, and their daily diamond work habits.
          </p>
        </div>

        <div className={`px-3.5 py-2 rounded-xl border text-xs font-medium self-start sm:self-auto ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          Total Filtered Artisans: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{pagination.total_count}</span>
        </div>
      </div>

      {/* Activity & Cohort Filter Tabs */}
      <div className={`flex flex-wrap gap-2 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {activityTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActivity(tab.id);
              setSearchParams({ activity: tab.id });
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activity === tab.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                : tab.highlight
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by artisan name, mobile number or email..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors border ${inputBg}`}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language filter */}
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-cyan-500 border ${inputBg}`}
          >
            <option value="all">Language: All</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="en">English</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-cyan-500 border ${inputBg}`}
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium">Loading artisans list...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <UsersIcon className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No artisans found</p>
            <p className={`text-xs mt-1 ${textMuted}`}>Try adjusting your search or active cohort filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                <tr>
                  <th className="py-3.5 px-4">Artisan Profile</th>
                  <th className="py-3.5 px-4">Joined Date & Tenure</th>
                  <th className="py-3.5 px-3">Language</th>
                  <th className="py-3.5 px-3">Latest Log</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableBorder}`}>
                {users.map((u) => {
                  const initial = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'A';
                  const isSuspended = u.status === 'suspended';
                  const joinFormatted = formatJoinDateTime(u.created_at);
                  const duration = getConnectedDuration(u.created_at);

                  return (
                    <tr key={u.id} className="hover:bg-slate-500/5 transition-colors group">
                      {/* Profile & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar src={u.profile_image_url} name={u.full_name} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate text-sm">
                              {u.full_name}
                            </p>
                            <p className={`text-xs flex items-center space-x-1.5 mt-0.5 ${textMuted}`}>
                              <span>{u.mobile_number || u.email || 'No contact'}</span>
                              <span className={`text-[10px] uppercase font-semibold px-1 py-0.2 rounded border ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}>
                                {u.auth_provider}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Joined Date & Time + Connected Tenure */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            <span>{joinFormatted}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{duration}</span>
                          </span>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 font-medium">
                          <Globe2 className="w-3 h-3 text-slate-400" />
                          <span>{u.preferred_language === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                        </span>
                      </td>

                      {/* Latest Work Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px]">
                        {u.latest_work_date ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{u.latest_work_date}</span>
                        ) : (
                          <span className={textMuted}>No logs yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          <Link
                            to={`/notifications?userId=${u.id}`}
                            title="Send push notification to this artisan"
                            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              isDark
                                ? 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white border-slate-700 hover:border-amber-500'
                                : 'bg-slate-100 hover:bg-amber-500 text-slate-700 hover:text-white border-slate-200 hover:border-amber-500 shadow-sm'
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            <span>Notify</span>
                          </Link>

                          <Link
                            to={`/users/${u.id}`}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              isDark
                                ? 'bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500'
                                : 'bg-slate-100 hover:bg-cyan-600 text-slate-700 hover:text-white border-slate-200 hover:border-cyan-500 shadow-sm'
                            }`}
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pagination.total_pages > 1 && (
          <div className={`p-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={textMuted}>
              Page <span className="font-bold text-inherit">{page}</span> of{' '}
              <span className="font-bold text-inherit">{pagination.total_pages}</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`p-2 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className={`p-2 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
