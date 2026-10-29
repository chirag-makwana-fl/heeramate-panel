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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/users"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artisans Directory</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${cardBg}`}>
        <div className="flex items-center space-x-4">
          <UserAvatar src={user.profile_image_url} name={user.full_name} size="lg" />
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold tracking-tight">
                {user.full_name || 'Unnamed Artisan'}
              </h1>
              {isSuspended ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Suspended
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>

            <div className={`flex flex-wrap items-center gap-3 text-xs mt-1.5 ${textMuted}`}>
              <span className="font-medium">
                {user.mobile_number || user.email || 'No contact'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Language: {user.preferred_language === 'gu' ? 'ગુજરાતી' : 'English'}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined: {joinDateTimeFormatted}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>{tenureDuration}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <Link
            to={`/notifications?userId=${user.id}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Send Notification</span>
          </Link>

          <button
            onClick={toggleStatus}
            disabled={statusUpdating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isSuspended
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/30'
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Days Logged */}
        <div className={`rounded-xl border p-4 transition-all ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Days Logged</span>
          <p className="text-2xl font-bold mt-1">{analytics?.total_days_logged || 0}</p>
          <p className={`text-[11px] mt-0.5 ${textMuted}`}>consistent working days</p>
        </div>

        {/* Diamonds Tracked */}
        <div className={`rounded-xl border p-4 transition-all ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Total Diamonds</span>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {Number(analytics?.total_diamonds || 0).toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-0.5 ${textMuted}`}>pieces recorded</p>
        </div>

        {/* Total Earnings */}
        <div className={`rounded-xl border p-4 transition-all ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Total Earned</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{Number(analytics?.total_earnings || 0).toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-0.5 ${textMuted}`}>gross calculated wages</p>
        </div>

        {/* Total Upad */}
        <div className={`rounded-xl border p-4 transition-all ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Advance (Upad)</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ₹{Number(analytics?.total_upad || 0).toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-0.5 ${textMuted}`}>cash / online advances</p>
        </div>

        {/* Net Balance */}
        <div className={`rounded-xl border p-4 col-span-2 md:col-span-1 transition-all ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>Net Balance</span>
          <p className="text-2xl font-bold mt-1">
            ₹{netEarnings.toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-0.5 ${textMuted}`}>earned minus advance</p>
        </div>
      </div>

      {/* Device & Telemetry Info */}
      {latestDevice && (
        <div className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 text-xs transition-all ${cardBg}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold">
                {latestDevice.device_brand_model || 'Unknown Device'} • {latestDevice.platform} {latestDevice.os_version}
              </p>
              <p className={`text-[11px] ${textMuted}`}>
                App Version: {latestDevice.app_version || 'N/A'} • IP: {latestDevice.ip_address || 'N/A'}
              </p>
            </div>
          </div>
          <div className={`text-[11px] ${textMuted}`}>
            Last active: {new Date(latestDevice.created_at).toLocaleString('en-IN')}
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="space-y-4">
        <div className={`flex items-center space-x-2 border-b pb-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('work_logs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'work_logs'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                : textMuted
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Daily Work Logs ({workLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upad')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'upad'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : textMuted
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Upad / Advance Logs ({upadLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'rates'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                : textMuted
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
  );
};

export default UserDetail;
