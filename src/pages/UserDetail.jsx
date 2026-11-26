import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Smartphone, 
  Globe2, 
  Calendar, 
  Gem, 
  IndianRupee, 
  Wallet, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  Clock,
  RotateCw,
  HardDrive,
  Sparkles,
  Megaphone
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';

// Helper to format Date & Time in IST
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

// Helper for tenure
const getConnectedDuration = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const joined = new Date(dateStr);
  const diffMs = now - joined;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Joined just now';
  if (diffHours < 24) return `Joined today (${diffHours} hours ago)`;
  if (diffDays === 1) return 'Joined yesterday';
  if (diffDays < 30) return `Connected for ${diffDays} days`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Connected for 1 month';
  return `Connected for ${diffMonths} months`;
};

const UserDetail = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [upadLogs, setUpadLogs] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work_logs'); // 'work_logs' | 'upad' | 'rates'
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [userRes, workLogsRes, upadRes, ratesRes] = await Promise.allSettled([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/work-logs`, { params: { limit: 50 } }),
        api.get(`/users/${id}/upad-logs`),
        api.get(`/users/${id}/rates`),
      ]);

      if (userRes.status === 'fulfilled') {
        setData(userRes.value.data?.data);
      } else {
        console.error('Failed to fetch user:', userRes.reason);
        setFetchError(userRes.reason?.response?.data?.message || 'Artisan profile not found.');
      }

      if (workLogsRes.status === 'fulfilled') {
        setWorkLogs(workLogsRes.value.data?.data?.logs || []);
      }

      if (upadRes.status === 'fulfilled') {
        setUpadLogs(upadRes.value.data?.data?.upad_logs || []);
      }

      if (ratesRes.status === 'fulfilled') {
        setRates(ratesRes.value.data?.data?.rates || []);
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setFetchError('An unexpected error occurred while loading this artisan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const toggleStatus = async () => {
    if (!data?.user) return;
    const currentStatus = data.user.status || 'active';
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';

    if (!window.confirm(`Are you sure you want to change this artisan's status to ${nextStatus.toUpperCase()}?`)) {
      return;
    }

    setStatusUpdating(true);
    try {
      const res = await api.patch(`/users/${id}/status`, { status: nextStatus });
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, status: res.data?.data?.user?.status },
      }));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update user status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isDark ? 'bg-slate-950/70 text-slate-400' : 'bg-slate-100/90 text-slate-600';
  const tableBorder = isDark ? 'divide-slate-800/70 border-slate-800' : 'divide-slate-200 border-slate-200';

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading artisan details...</p>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
          <User className="w-6 h-6" />
        </div>
        <p className="text-base font-bold">{fetchError || 'Artisan Not Found'}</p>
        <p className={`text-xs mt-1 mb-4 ${textMuted}`}>
          Could not load details for ID: <code className="text-cyan-600 dark:text-cyan-400 px-1 py-0.5 rounded text-[11px]">{id}</code>
        </p>
        <Link
          to="/users"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Artisans Directory</span>
        </Link>
      </div>
    );
  }

  const { user, analytics, device_logs } = data;
  const isSuspended = user.status === 'suspended';
  const latestDevice = device_logs && device_logs.length > 0 ? device_logs[0] : null;
  const netEarnings = Number(analytics?.total_earnings || 0) - Number(analytics?.total_upad || 0);

  const joinDateTimeFormatted = formatJoinDateTime(user.created_at);
  const tenureDuration = getConnectedDuration(user.created_at);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className={`inline-flex items-center space-x-1.5 text-xs font-medium hover:underline transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Artisan Directory</span>
        </Link>
      </div>

      {/* 12-Column Master-Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inspector Rail (4 Cols): Identity, Actions & Device */}
        <div className="lg:col-span-4 space-y-5">
          <div className={`rounded-xl border p-5 space-y-5 transition-colors ${cardBg}`}>
            <div className="flex items-start space-x-3.5">
              <UserAvatar src={user.profile_image_url} name={user.full_name} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold tracking-tight truncate">
                  {user.full_name || 'Unnamed Artisan'}
                </h1>
                <p className={`text-xs mt-0.5 truncate tabular-nums ${textMuted}`}>
                  {user.mobile_number || user.email || 'No contact'}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {isSuspended ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  )}
                  {user.app_mode === 'advance' ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 inline-flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Advance Mode</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                      Simple Mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key-Value Metadata List */}
            <div className={`pt-4 border-t space-y-2.5 text-xs ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={textMuted}>Language</span>
                <span className="font-medium flex items-center space-x-1">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.preferred_language === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textMuted}>Auth Provider</span>
                <span className="font-medium uppercase text-[11px]">{user.auth_provider || 'phone'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textMuted}>Joined</span>
                <span className="font-medium tabular-nums">{joinDateTimeFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textMuted}>Tenure</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{tenureDuration}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`pt-4 border-t flex flex-col gap-2 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <Link
                to={`/notifications?userId=${user.id}`}
                className={`w-full inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-slate-950 hover:bg-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Send Notification</span>
              </Link>

              <button
                onClick={toggleStatus}
                disabled={statusUpdating}
                className={`w-full px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/25'
                }`}
              >
                {statusUpdating
                  ? 'Updating...'
                  : isSuspended
                  ? 'Reactivate Account'
                  : 'Suspend Artisan'}
              </button>
            </div>
          </div>

          {/* Device & Telemetry Card */}
          {latestDevice && (
            <div className={`rounded-xl border p-4 space-y-2.5 text-xs transition-colors ${cardBg}`}>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold">Latest Device</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className={textMuted}>Model</span>
                  <span className="font-medium">{latestDevice.device_brand_model || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMuted}>OS / App</span>
                  <span className="font-medium tabular-nums">
                    {latestDevice.platform} {latestDevice.os_version} · v{latestDevice.app_version || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMuted}>IP Address</span>
                  <span className="font-mono">{latestDevice.ip_address || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMuted}>Last Active</span>
                  <span className="tabular-nums">{new Date(latestDevice.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Main Stage (8 Cols): Ledger Strip + Tabs + Tables */}
        <div className="lg:col-span-8 space-y-5">
          {/* Unified Ledger Summary Strip */}
          <div className={`rounded-xl border grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x overflow-hidden transition-colors ${cardBg} ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-200'
          }`}>
            <div className="p-4">
              <span className={`text-[11px] font-medium ${textMuted}`}>Days Logged</span>
              <p className="text-lg font-semibold mt-1 tabular-nums">{analytics?.total_days_logged || 0}</p>
            </div>

            <div className="p-4">
              <span className={`text-[11px] font-medium ${textMuted}`}>Diamonds</span>
              <p className="text-lg font-semibold mt-1 tabular-nums">
                {Number(analytics?.total_diamonds || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4">
              <span className={`text-[11px] font-medium ${textMuted}`}>Gross Earned</span>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ₹{Number(analytics?.total_earnings || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4">
              <span className={`text-[11px] font-medium ${textMuted}`}>Upad</span>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                ₹{Number(analytics?.total_upad || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4 col-span-2 sm:col-span-1">
              <span className={`text-[11px] font-medium ${textMuted}`}>Net Balance</span>
              <p className="text-lg font-semibold mt-1 tabular-nums">
                ₹{netEarnings.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

      {/* Content Tabs */}
      <div className="space-y-4">
        <div className={`flex items-center space-x-6 border-b ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('work_logs')}
            className={`pb-2.5 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'work_logs'
                ? isDark ? 'border-white text-white' : 'border-slate-900 text-slate-900'
                : `border-transparent ${textMuted} hover:text-slate-700 dark:hover:text-slate-200`
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Work Logs ({workLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upad')}
            className={`pb-2.5 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'upad'
                ? isDark ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-600'
                : `border-transparent ${textMuted} hover:text-slate-700 dark:hover:text-slate-200`
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Upad / Advance ({upadLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`pb-2.5 text-xs font-medium flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'rates'
                ? isDark ? 'border-white text-white' : 'border-slate-900 text-slate-900'
                : `border-transparent ${textMuted} hover:text-slate-700 dark:hover:text-slate-200`
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rate Book ({rates.length})</span>
          </button>
        </div>

        {/* Tab 1: Work Logs Table */}
        {activeTab === 'work_logs' && (
          <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
            {workLogs.length === 0 ? (
              <div className={`py-16 text-center text-xs ${textMuted}`}>
                This artisan has not recorded any diamond work logs yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Work Type</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Rate per Diamond</th>
                      <th className="py-3 px-4 text-right">Total Wages</th>
                      <th className="py-3 px-4 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {workLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3 px-4 font-semibold">{log.work_date}</td>
                        <td className="py-3 px-4 font-medium">
                          {log.work_type_title || 'General Polishing'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {Number(log.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right ${textMuted}`}>
                          ₹{Number(log.rate_per_unit || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(log.total_earnings || 0).toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right text-[11px] ${textMuted}`}>
                          {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upad Logs Table */}
        {activeTab === 'upad' && (
          <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
            {upadLogs.length === 0 ? (
              <div className={`py-16 text-center text-xs ${textMuted}`}>
                No advance cash (Upad) entries logged for this artisan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Advance Amount</th>
                      <th className="py-3 px-4">Description / Remark</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {upadLogs.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3 px-4 font-semibold">{u.upad_date || u.created_at?.slice(0, 10)}</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                          ₹{Number(u.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {u.description || 'Advance / ઉપાડ'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {u.status || 'Received'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right text-[11px] ${textMuted}`}>
                          {new Date(u.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Rate Book Table */}
        {activeTab === 'rates' && (
          <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
            {rates.length === 0 ? (
              <div className={`py-16 text-center text-xs ${textMuted}`}>
                No custom diamond rates configured in this artisan's rate book.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                    <tr>
                      <th className="py-3 px-4">Diamond Work Type</th>
                      <th className="py-3 px-4 text-right">Rate per Unit</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4 text-right">Created On</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {rates.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3 px-4 font-semibold">{r.work_type}</td>
                        <td className="py-3 px-4 text-right font-bold text-cyan-600 dark:text-cyan-400">
                          ₹{Number(r.rate_per_unit).toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 uppercase text-[10px] ${textMuted}`}>
                          {r.unit || 'diamond'}
                        </td>
                        <td className={`py-3 px-4 text-right text-[11px] ${textMuted}`}>
                          {new Date(r.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default UserDetail;
