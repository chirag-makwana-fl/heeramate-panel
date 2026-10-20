import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Gem, 
  IndianRupee, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  RotateCw, 
  ArrowUpRight,
  Globe2,
  Wallet,
  Clock,
  Sparkles,
  UserPlus,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';

// Helper for Join Date & Time in IST
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

const getConnectedDuration = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const joined = new Date(dateStr);
  const diffMs = now - joined;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}m ago`;
};

const Dashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'diamonds' | 'earnings' | 'users'
  const [activeUserPeriod, setActiveUserPeriod] = useState('daily'); // 'daily' | 'fifteen_days' | 'monthly'

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/dashboard/overview');
      setData(res.data?.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading live platform metrics...</p>
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const demographics = data?.demographics || {};
  const dailyTrends = data?.daily_trends || [];
  const recentLogs = data?.recent_logs || [];
  const recentUsers = data?.recent_users || [];
  const activeSummary = data?.active_summary || {
    daily: { active_users: kpi.active_loggers_today || 0, diamonds: kpi.diamonds_today || 0, earnings: kpi.earnings_today || 0, percentage: 0 },
    weekly: { active_users: 0, diamonds: 0, earnings: 0, percentage: 0 },
    fifteen_days: { active_users: 0, diamonds: 0, earnings: 0, percentage: 0 },
    monthly: { active_users: 0, diamonds: 0, earnings: 0, percentage: 0 }
  };

  const currentActiveStats = activeSummary[activeUserPeriod] || activeSummary.daily;

  // Maximum values for charts
  const maxDiamonds = Math.max(...dailyTrends.map((t) => t.diamonds_tracked), 10);
  const maxEarnings = Math.max(...dailyTrends.map((t) => t.earnings_tracked), 100);
  const maxUsers = Math.max(...dailyTrends.map((t) => t.active_users), 5);

  const guPct = kpi.total_users > 0 ? Math.round((demographics.gujarati_users / kpi.total_users) * 100) : 0;
  const enPct = 100 - guPct;

  // Theme helper classes
  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isDark ? 'bg-slate-950/70 text-slate-400' : 'bg-slate-100/80 text-slate-600';
  const tableBorder = isDark ? 'divide-slate-800/70 border-slate-800' : 'divide-slate-200 border-slate-200';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center space-x-2.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Artisan Activity & Monitoring</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live
            </span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
            Real-time tracking of diamond polishing logs, active karigar cohorts, and earnings.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors disabled:opacity-50 self-start sm:self-auto ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-500' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* NEW: Dedicated Active Users Multi-Period Widget */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-inherit">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
              <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center space-x-2">
                <span>Active Artisans Cohort</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                  Real Activity
                </span>
              </h2>
              <p className={`text-xs ${textMuted}`}>
                Artisans who recorded diamond work in the selected time window.
              </p>
            </div>
          </div>

          {/* Timeframe Switcher Tabs */}
          <div className={`inline-flex p-1 rounded-xl border self-start sm:self-auto text-xs font-semibold ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveUserPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeUserPeriod === 'daily'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Daily (Today)
            </button>
            <button
              onClick={() => setActiveUserPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeUserPeriod === 'weekly'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Week (7 Days)
            </button>
            <button
              onClick={() => setActiveUserPeriod('fifteen_days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeUserPeriod === 'fifteen_days'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              15 Days
            </button>
            <button
              onClick={() => setActiveUserPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeUserPeriod === 'monthly'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Monthly (30 Days)
            </button>
          </div>
        </div>

        {/* Active Stats Metric Row */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Karigars */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Active Karigars ({activeUserPeriod === 'daily' ? 'Today' : activeUserPeriod === 'weekly' ? '7d' : activeUserPeriod === 'fifteen_days' ? '15d' : '30d'})
            </span>
            <div className="flex items-baseline space-x-2 mt-1.5">
              <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
                {currentActiveStats.active_users}
              </span>
              <span className={`text-xs ${textMuted}`}>
                / {kpi.total_users} artisans
              </span>
            </div>
            {/* Progress percentage bar */}
            <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${currentActiveStats.percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
              {currentActiveStats.percentage}% active engagement rate
            </p>
          </div>

          {/* Diamonds Tracked in Period */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Diamonds Polished
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1.5">
              <span className="text-3xl font-extrabold">
                {Number(currentActiveStats.diamonds).toLocaleString('en-IN')}
              </span>
              <span className={`text-xs ${textMuted}`}>pieces</span>
            </div>
            <p className={`text-[11px] mt-1.5 ${textMuted}`}>
              Total piece-rate work submitted
            </p>
          </div>

          {/* Wages Generated in Period */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Artisan Wages
            </span>
            <div className="flex items-baseline space-x-1 mt-1.5">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{Number(currentActiveStats.earnings).toLocaleString('en-IN')}
              </span>
            </div>
            <p className={`text-[11px] mt-1.5 ${textMuted}`}>
              Calculated automatically from rates
            </p>
          </div>

          {/* Quick Filter Link */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Cohort Directory
              </span>
              <p className="text-xs mt-1 font-medium">
                View all artisans in this active cohort with full profiles.
              </p>
            </div>
            <Link
              to={`/users?activity=${
                activeUserPeriod === 'daily'
                  ? 'active_today'
                  : activeUserPeriod === 'weekly'
                  ? 'active_7d'
                  : activeUserPeriod === 'fifteen_days'
                  ? 'active_15d'
                  : 'active_monthly'
              }`}
              className="mt-3 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <span>Explore Active List</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Today Focus) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Loggers Today */}
        <div className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Active Today</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {kpi.active_loggers_today}
            </div>
            <p className={`text-xs mt-1 ${textMuted}`}>
              out of <span className="font-bold">{kpi.total_users}</span> registered artisans
            </p>
          </div>
        </div>

        {/* Diamonds Tracked Today */}
        <div className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Diamonds Today</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Gem className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {Number(kpi.diamonds_today).toLocaleString('en-IN')}
            </div>
            <p className={`text-xs mt-1 ${textMuted}`}>
              polishing pieces recorded today
            </p>
          </div>
        </div>

        {/* Earnings Tracked Today */}
        <div className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Earnings Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{Number(kpi.earnings_today).toLocaleString('en-IN')}
            </div>
            <p className={`text-xs mt-1 ${textMuted}`}>
              total artisan wages calculated
            </p>
          </div>
        </div>

        {/* Registered Artisans */}
        <div className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Total Artisans</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight">
              {kpi.total_users}
            </div>
            <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              +{kpi.new_users_today} joined today
            </p>
          </div>
        </div>
      </div>

      {/* 14-Day Activity Trend Visualizer */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>14-Day Daily Work Tracking Activity</span>
            </h2>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              Daily consistency of diamond artisans logging piece-work.
            </p>
          </div>

          <div className={`inline-flex p-1 rounded-xl border text-xs font-medium ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('diamonds')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'diamonds'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Diamonds Tracked
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'earnings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Earnings (₹)
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : textMuted
              }`}
            >
              Active Karigars
            </button>
          </div>
        </div>

        {/* Chart Bars with ample headroom and edge-aware tooltips */}
        <div className="pt-14 px-3 sm:px-4 overflow-x-auto overflow-y-visible">
          <div className={`h-52 flex items-end gap-2 sm:gap-3 min-w-[500px] border-b pb-2 relative ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            {dailyTrends.map((t, idx) => {
              let value = 0;
              let max = 1;
              let colorClass = 'bg-cyan-500';

              if (activeTab === 'diamonds') {
                value = t.diamonds_tracked;
                max = maxDiamonds;
                colorClass = 'bg-gradient-to-t from-cyan-600 to-cyan-400';
              } else if (activeTab === 'earnings') {
                value = t.earnings_tracked;
                max = maxEarnings;
                colorClass = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
              } else {
                value = t.active_users;
                max = maxUsers;
                colorClass = 'bg-gradient-to-t from-violet-600 to-violet-400';
              }

              // Keep bars max 78% height so hover tooltip has 22% guaranteed headroom above
              const heightPct = Math.max(8, Math.min(78, Math.round((value / max) * 78)));

              // Calculate edge alignment to prevent first & last tooltips from getting cut off
              let tooltipAlignClass = 'left-1/2 -translate-x-1/2';
              let arrowAlignClass = 'left-1/2 -translate-x-1/2';

              if (idx === 0) {
                // First bar: align left to prevent clipping on left edge
                tooltipAlignClass = 'left-0 translate-x-0';
                arrowAlignClass = 'left-4 translate-x-0';
              } else if (idx === 1) {
                tooltipAlignClass = 'left-[-4px] sm:left-1/2 sm:-translate-x-1/2';
                arrowAlignClass = 'left-6 sm:left-1/2 sm:-translate-x-1/2';
              } else if (idx === dailyTrends.length - 1) {
                // Last bar: align right to prevent clipping on right edge
                tooltipAlignClass = 'right-0 left-auto translate-x-0';
                arrowAlignClass = 'right-4 left-auto translate-x-0';
              } else if (idx === dailyTrends.length - 2) {
                tooltipAlignClass = 'right-[-4px] left-auto sm:left-1/2 sm:-translate-x-1/2';
                arrowAlignClass = 'right-6 left-auto sm:left-1/2 sm:-translate-x-1/2';
              }

              return (
                <div key={t.date} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer">
                  {/* Floating Tooltip with edge-aware alignment, arrow, border, and solid background */}
                  <div className={`absolute opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-y-2 group-hover:translate-y-0 border text-[11px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap z-30 ${tooltipAlignClass} ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white shadow-slate-950/90'
                      : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/80 ring-1 ring-black/5'
                  }`}
                  style={{ bottom: `calc(${heightPct}% + 12px)` }}
                  >
                    <p className="font-bold text-[11px]">{t.date}</p>
                    <p className={`font-extrabold mt-0.5 ${
                      activeTab === 'earnings' ? 'text-emerald-500' : activeTab === 'users' ? 'text-violet-500' : 'text-cyan-500'
                    }`}>
                      {activeTab === 'earnings'
                        ? `₹${value.toLocaleString('en-IN')}`
                        : `${value.toLocaleString('en-IN')} ${activeTab === 'users' ? 'Active Karigars' : 'Diamonds Tracked'}`}
                    </p>
                    {/* Tooltip arrow dynamically aligned with the bar */}
                    <div className={`absolute top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 ${arrowAlignClass} ${
                      isDark ? 'border-t-slate-900' : 'border-t-white'
                    }`} />
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-lg ${colorClass} transition-all duration-300 group-hover:brightness-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Date Labels */}
          <div className={`flex justify-between text-[10px] pt-2 px-1 min-w-[500px] ${textMuted}`}>
            <span>{dailyTrends[0]?.date}</span>
            <span>{dailyTrends[Math.floor(dailyTrends.length / 2)]?.date}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{dailyTrends[dailyTrends.length - 1]?.date} (Today)</span>
          </div>
        </div>
      </div>

      {/* Grid: Demographics + New Artisans Joined + Live Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recently Joined + Demographics */}
        <div className="space-y-6">
          {/* Recently Joined Artisans Card */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>Recently Joined Artisans</span>
              </h2>
              <Link to="/users?activity=new_users" className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                View New
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className={`text-xs py-4 text-center ${textMuted}`}>No users registered yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentUsers.map((u) => {
                  const initial = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'A';
                  const joinedTime = formatJoinDateTime(u.created_at);
                  const duration = getConnectedDuration(u.created_at);

                  return (
                    <Link
                      key={u.id}
                      to={`/users/${u.id}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
                        isDark
                          ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <UserAvatar src={u.profile_image_url} name={u.full_name} size="sm" />
                        <div className="truncate">
                          <p className="text-xs font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                            {u.full_name || 'Artisan'}
                          </p>
                          <p className={`text-[10px] truncate ${textMuted}`}>
                            {u.mobile_number || u.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {duration}
                        </span>
                        <p className={`text-[9px] mt-0.5 ${textMuted}`}>{joinedTime.split(',')[0]}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Demographics */}
          <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 transition-all ${cardBg}`}>
            <h2 className="text-sm font-semibold tracking-tight flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-cyan-500" />
              <span>Language & Platform</span>
            </h2>

            {/* Language Preference */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium">Language</span>
                <span className={textMuted}>
                  {demographics.gujarati_users} Gujarati / {demographics.english_users} English
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-cyan-500 h-full"
                  style={{ width: `${guPct}%` }}
                />
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${enPct}%` }}
                />
              </div>
            </div>

            {/* Registration Provider */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[11px] ${textMuted}`}>Mobile OTP</span>
                  <p className="text-base font-bold mt-0.5">{demographics.phone_users}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[11px] ${textMuted}`}>Google Sign-in</span>
                  <p className="text-base font-bold mt-0.5">{demographics.google_users}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Recent Work Logs Feed */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>Recent Diamond Logs Feed</span>
              </h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                Latest diamond piece-work entries submitted by artisans.
              </p>
            </div>
            <Link
              to="/users"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium inline-flex items-center space-x-1"
            >
              <span>Explore Users</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className={`py-12 text-center text-sm ${textMuted}`}>
              No diamond work logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase tracking-wider text-[10px] border-b ${tableHeaderBg} ${tableBorder}`}>
                  <tr>
                    <th className="py-3 px-3">Artisan</th>
                    <th className="py-3 px-3">Work Type</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-3 text-right">Rate</th>
                    <th className="py-3 px-3 text-right">Total (₹)</th>
                    <th className="py-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3 px-3 font-medium flex items-center space-x-2">
                        <UserAvatar src={log.users?.profile_image_url} name={log.users?.full_name} size="xs" />
                        <span className="truncate max-w-[120px]">
                          {log.users?.full_name || log.users?.mobile_number || 'Artisan'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {log.work_type_title || 'General Polishing'}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">
                        {Number(log.quantity).toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3 px-3 text-right ${textMuted}`}>
                        ₹{Number(log.rate_per_unit || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(log.total_earnings || 0).toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3 px-3 text-right whitespace-nowrap ${textMuted}`}>
                        {log.work_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
