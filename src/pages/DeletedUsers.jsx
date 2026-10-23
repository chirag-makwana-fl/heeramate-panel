import React, { useEffect, useState } from 'react';
import { 
  UserX, 
  Search, 
  RotateCw, 
  Calendar, 
  Clock, 
  Smartphone, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

// Helper to format Date & Time in IST (Asia/Kolkata)
const formatDateTimeIST = (dateStr) => {
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

// Helper to calculate relative time since deletion
const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const deleted = new Date(dateStr);
  const diffMs = now - deleted;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Deleted just now';
  if (diffMinutes < 60) return `Deleted ${diffMinutes}m ago`;
  if (diffHours < 24) return `Deleted ${diffHours}h ago`;
  if (diffDays === 1) return 'Deleted yesterday';
  if (diffDays < 30) return `Deleted ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `Deleted ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
};

const DeletedUsers = () => {
  const { isDark } = useTheme();

  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1 });
  const [search, setSearch] = useState('');

  const fetchDeletedUsers = async (targetPage = page, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await api.get('/deleted-users', {
        params: {
          page: targetPage,
          limit: 20,
          search: searchTerm || undefined,
        },
      });

      const list = res.data?.data?.deleted_users || [];
      const pag = res.data?.data?.pagination || { total_count: 0, total_pages: 1 };
      setDeletedUsers(list);
      setPagination(pag);
    } catch (err) {
      console.error('Error fetching deleted users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers(page, search);
  }, [page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchDeletedUsers(1, search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Derived counts
  const googleCount = deletedUsers.filter(u => u.auth_provider === 'google' || u.email).length;
  const phoneCount = deletedUsers.filter(u => u.auth_provider === 'phone' || u.mobile_number).length;

  // Theming classes
  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isDark ? 'bg-slate-950/70 text-slate-400' : 'bg-slate-100/80 text-slate-600';
  const tableBorder = isDark ? 'divide-slate-800 border-slate-800' : 'divide-slate-200 border-slate-200';
  const inputBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-600';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Deleted Accounts
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                  {pagination.total_count} Deleted
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-0.5 ${textMuted}`}>
                Audit log of artisans who deleted their account. Automatically removed if they sign up again.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchDeletedUsers(page, search)}
          disabled={loading}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors self-start sm:self-auto ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Info Callout Banner */}
      <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-cyan-50/60 border-cyan-200/80'
      }`}>
        <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-cyan-900 dark:text-cyan-200">
            Automated Re-registration Sync
          </p>
          <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            When an artisan deletes their account from the mobile app, their profile and activity are removed from the active directory and logged here for compliance and audit. If that same artisan registers again with the same <strong>Email</strong> or <strong>Mobile Number</strong>, their record is automatically removed from this list.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Total Deleted</span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {pagination.total_count}
          </p>
          <span className={`text-[11px] ${textMuted}`}>Account deletions logged</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Google Accounts</span>
          <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
            {googleCount}
          </p>
          <span className={`text-[11px] ${textMuted}`}>Registered via Google Auth</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Phone Accounts</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {phoneCount}
          </p>
          <span className={`text-[11px] ${textMuted}`}>Registered via Mobile OTP</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Re-Register Sync</span>
          <div className="flex items-center space-x-1.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Auto-Clears on Return
            </span>
          </div>
          <span className={`text-[11px] ${textMuted}`}>Zero manual action needed</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between ${cardBg}`}>
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by artisan name, email address, or mobile number..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-none ${inputBg}`}
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline px-2"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Deleted Users Table / Cards */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
        {loading ? (
          <div className="p-12 text-center">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-cyan-500 mb-2" />
            <p className={`text-sm ${textMuted}`}>Loading deleted accounts...</p>
          </div>
        ) : deletedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserX className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="font-bold text-base">No deleted accounts found</h3>
            <p className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${textMuted}`}>
              {search 
                ? `No deleted accounts matched "${search}". Try clearing the search query.` 
                : 'There are currently no deleted accounts. All registered artisans are active!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                <tr>
                  <th className="py-3 px-4 sm:px-6">Artisan Details</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Auth Method</th>
                  <th className="py-3 px-4">Joined Platform</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Account Deleted At</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableBorder}`}>
                {deletedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-500/5 transition-colors"
                  >
                    {/* Artisan Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm truncate">
                            {user.full_name || 'Artisan'}
                          </p>
                          <p className={`text-[10px] font-mono truncate ${textMuted}`}>
                            ID: {user.original_user_id ? user.original_user_id.slice(0, 8) + '...' : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {user.email ? (
                          <div className="flex items-center space-x-1.5 text-xs">
                            <Mail className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        ) : null}
                        {user.mobile_number ? (
                          <div className="flex items-center space-x-1.5 text-xs">
                            <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{user.mobile_number}</span>
                          </div>
                        ) : null}
                        {!user.email && !user.mobile_number && (
                          <span className={`text-[11px] ${textMuted}`}>No contact stored</span>
                        )}
                      </div>
                    </td>

                    {/* Auth Method */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        user.auth_provider === 'google'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {user.auth_provider === 'google' ? 'Google Sign-In' : 'Phone OTP'}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <Calendar className={`w-3 h-3 ${textMuted}`} />
                        <span>{formatDateTimeIST(user.user_created_at)}</span>
                      </div>
                    </td>

                    {/* Deleted Date & Time */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <p className="font-semibold text-rose-600 dark:text-rose-400 text-xs">
                        {formatDateTimeIST(user.deleted_at)}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${textMuted}`}>
                        {getRelativeTime(user.deleted_at)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.total_pages > 1 && (
          <div className={`p-4 border-t flex items-center justify-between text-xs ${tableBorder}`}>
            <span className={textMuted}>
              Showing page <strong className="font-semibold text-slate-800 dark:text-slate-200">{page}</strong> of{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{pagination.total_pages}</strong> ({pagination.total_count} total)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                  isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages || loading}
                className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                  isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
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

export default DeletedUsers;
