import React, { useEffect, useState } from 'react';
import {
  Users,
  Gem,
  IndianRupee,
  UserCheck,
  TrendingUp,
  RotateCw,
  ArrowUpRight,
  Globe2,
  Clock,
  Sparkles,
  UserPlus,
  Smartphone,
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
  const [activeTab, setActiveTab] = useState('diamonds'); // 'diamonds' | 'earnings' | 'users'
  const [activeUserPeriod, setActiveUserPeriod] = useState('daily'); // 'daily' | 'weekly' | 'fifteen_days' | 'monthly'

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
        <div className={`w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mb-3 ${
          isDark ? 'border-slate-300' : 'border-slate-700'
        }`}></div>
        <p className="text-xs font-medium">Loading operations overview...</p>
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

  // Chart calculations
  const maxDiamonds = Math.max(...dailyTrends.map((t) => t.diamonds_tracked), 10);
  const maxEarnings = Math.max(...dailyTrends.map((t) => t.earnings_tracked), 100);
  const maxUsers = Math.max(...dailyTrends.map((t) => t.active_users), 5);

  const periodTotalDiamonds = dailyTrends.reduce((acc, t) => acc + Number(t.diamonds_tracked || 0), 0);
  const periodTotalEarnings = dailyTrends.reduce((acc, t) => acc + Number(t.earnings_tracked || 0), 0);
  const avgActiveUsers = dailyTrends.length
    ? Math.round(dailyTrends.reduce((acc, t) => acc + Number(t.active_users || 0), 0) / dailyTrends.length)
    : 0;

  const guPct = kpi.total_users > 0 ? Math.round((demographics.gujarati_users / kpi.total_users) * 100) : 0;
  const enPct = 100 - guPct;
  const advancePct = kpi.total_users > 0 ? Math.round(((demographics.advance_mode_users || 0) / kpi.total_users) * 100) : 0;
  const simplePct = 100 - advancePct;

  // Theme helper classes
  const cardBg = isDark
    ? 'bg-[#0e131d] border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isDark ? 'bg-slate-950/60 text-slate-400' : 'bg-slate-50 text-slate-500';
  const tableBorder = isDark ? 'divide-slate-800/70 border-slate-800/80' : 'divide-slate-200 border-slate-200';
  const dividerColor = isDark ? 'border-slate-800/80' : 'border-slate-200';

  const cohortActivitySlug =
    activeUserPeriod === 'daily'
      ? 'active_today'
      : activeUserPeriod === 'weekly'
      ? 'active_7d'
      : activeUserPeriod === 'fifteen_days'
      ? 'active_15d'
      : 'active_monthly';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-xl font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Operations Overview
          </h1>
          <p className={`text-xs mt-0.5 ${textMuted}`}>
            Today’s production metrics, 14-day activity trends, and recent artisan logs.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 self-start sm:self-auto ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Top Unified KPI Ribbon */}
      <div className={`rounded-xl border grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x overflow-hidden ${cardBg} ${
        isDark ? 'divide-slate-800/80' : 'divide-slate-200'
      }`}>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Active Today</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {kpi.active_loggers_today}
            </span>
            <span className={`text-xs tabular-nums ${textMuted}`}>
              / {kpi.total_users}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${textMuted}`}>
            artisans logged today
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Diamonds Today</span>
            <Gem className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {Number(kpi.diamonds_today).toLocaleString('en-IN')}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${textMuted}`}>
            pieces polished today
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Wages Today</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              ₹{Number(kpi.earnings_today).toLocaleString('en-IN')}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${textMuted}`}>
            calculated from rates
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Total Artisans</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {kpi.total_users}
            </span>
            {kpi.new_users_today > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{kpi.new_users_today} today
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-1 ${textMuted}`}>
            registered on platform
          </p>
        </div>
      </div>

      {/* Main 12-Column Asymmetric Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Stage (8 Columns): 14-Day Chart + Recent Work Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* 14-Day Activity Visualizer */}
          <div className={`rounded-xl border p-5 transition-colors ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold tracking-tight">
                    14-Day Production Trend
                  </h2>
                </div>
                <p className={`text-xs mt-0.5 tabular-nums ${textMuted}`}>
                  {activeTab === 'diamonds' && `${periodTotalDiamonds.toLocaleString('en-IN')} total diamonds over 14 days`}
                  {activeTab === 'earnings' && `₹${periodTotalEarnings.toLocaleString('en-IN')} total wages over 14 days`}
                  {activeTab === 'users' && `${avgActiveUsers} avg active artisans per day`}
                </p>
              </div>

              <div className={`inline-flex p-0.5 rounded-lg border text-xs font-medium self-start sm:self-auto ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setActiveTab('diamonds')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'diamonds'
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-xs'
                      : textMuted
                  }`}
                >
                  Diamonds
                </button>
                <button
                  onClick={() => setActiveTab('earnings')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'earnings'
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-xs'
                      : textMuted
                  }`}
                >
                  Wages (₹)
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'users'
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-xs'
                      : textMuted
                  }`}
                >
                  Karigars
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="pt-12 px-1 overflow-x-auto overflow-y-visible">
              <div className={`h-48 flex items-end gap-1.5 sm:gap-2.5 min-w-[460px] border-b pb-2 relative ${dividerColor}`}>
                {/* Subtle horizontal guide lines */}
                <div className={`absolute inset-x-0 top-1/4 border-t border-dashed pointer-events-none ${isDark ? 'border-slate-800/60' : 'border-slate-200/80'}`} />
                <div className={`absolute inset-x-0 top-2/4 border-t border-dashed pointer-events-none ${isDark ? 'border-slate-800/60' : 'border-slate-200/80'}`} />
                <div className={`absolute inset-x-0 top-3/4 border-t border-dashed pointer-events-none ${isDark ? 'border-slate-800/60' : 'border-slate-200/80'}`} />

                {dailyTrends.map((t, idx) => {
                  let value = 0;
                  let max = 1;
                  let colorClass = isDark ? 'bg-sky-500' : 'bg-slate-800';

                  if (activeTab === 'diamonds') {
                    value = t.diamonds_tracked;
                    max = maxDiamonds;
                    colorClass = isDark ? 'bg-sky-500' : 'bg-slate-800';
                  } else if (activeTab === 'earnings') {
                    value = t.earnings_tracked;
                    max = maxEarnings;
                    colorClass = 'bg-emerald-600 dark:bg-emerald-500';
                  } else {
                    value = t.active_users;
                    max = maxUsers;
                    colorClass = 'bg-indigo-600 dark:bg-indigo-500';
                  }

                  const heightPct = Math.max(6, Math.min(82, Math.round((value / max) * 82)));

                  let tooltipAlignClass = 'left-1/2 -translate-x-1/2';
                  let arrowAlignClass = 'left-1/2 -translate-x-1/2';

                  if (idx === 0) {
                    tooltipAlignClass = 'left-0 translate-x-0';
                    arrowAlignClass = 'left-4 translate-x-0';
                  } else if (idx === 1) {
                    tooltipAlignClass = 'left-[-4px] sm:left-1/2 sm:-translate-x-1/2';
                    arrowAlignClass = 'left-6 sm:left-1/2 sm:-translate-x-1/2';
                  } else if (idx === dailyTrends.length - 1) {
                    tooltipAlignClass = 'right-0 left-auto translate-x-0';
                    arrowAlignClass = 'right-4 left-auto translate-x-0';
                  } else if (idx === dailyTrends.length - 2) {
                    tooltipAlignClass = 'right-[-4px] left-auto sm:left-1/2 sm:-translate-x-1/2';
                    arrowAlignClass = 'right-6 left-auto sm:left-1/2 sm:-translate-x-1/2';
                  }

                  return (
                    <div key={t.date} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer z-10">
                      <div
                        className={`absolute opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-y-1 group-hover:translate-y-0 border text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30 ${tooltipAlignClass} ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        style={{ bottom: `calc(${heightPct}% + 10px)` }}
                      >
                        <p className="font-medium text-[10px] text-slate-400 tabular-nums">{t.date}</p>
                        <p className="font-semibold tabular-nums mt-0.5">
                          {activeTab === 'earnings'
                            ? `₹${value.toLocaleString('en-IN')}`
                            : `${value.toLocaleString('en-IN')} ${activeTab === 'users' ? 'Karigars' : 'Diamonds'}`}
                        </p>
                        <div className={`absolute top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 ${arrowAlignClass} ${
                          isDark ? 'border-t-slate-900' : 'border-t-white'
                        }`} />
                      </div>

                      <div
                        className={`w-full rounded-t-sm ${colorClass} transition-opacity duration-150 group-hover:opacity-80`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className={`flex justify-between text-[10px] pt-2 px-0.5 min-w-[460px] tabular-nums ${textMuted}`}>
                <span>{dailyTrends[0]?.date}</span>
                <span>{dailyTrends[Math.floor(dailyTrends.length / 2)]?.date}</span>
                <span className="font-medium">{dailyTrends[dailyTrends.length - 1]?.date} (Today)</span>
              </div>
            </div>
          </div>

          {/* Recent Diamond Work Logs Table */}
          <div className={`rounded-xl border overflow-hidden transition-colors ${cardBg}`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${dividerColor}`}>
              <div>
                <h2 className="text-sm font-semibold tracking-tight flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Recent Work Logs</span>
                </h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Latest diamond entries submitted by artisans.
                </p>
              </div>
              <Link
                to="/users"
                className={`text-xs font-medium inline-flex items-center space-x-1 hover:underline ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <span>All Artisans</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className={`py-12 text-center text-xs ${textMuted}`}>
                No diamond work logs recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`text-[11px] font-medium border-b ${tableHeaderBg} ${tableBorder}`}>
                    <tr>
                      <th className="py-2.5 px-4">Artisan</th>
                      <th className="py-2.5 px-3">Work Type</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-2.5 px-4 font-medium">
                          <div className="flex items-center space-x-2">
                            <UserAvatar src={log.users?.profile_image_url} name={log.users?.full_name} size="xs" />
                            <span className="truncate max-w-[130px]">
                              {log.users?.full_name || log.users?.mobile_number || 'Artisan'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {log.work_type_title || 'General Polishing'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                          {Number(log.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className={`py-2.5 px-3 text-right tabular-nums ${textMuted}`}>
                          ₹{Number(log.rate_per_unit || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{Number(log.total_earnings || 0).toLocaleString('en-IN')}
                        </td>
                        <td className={`py-2.5 px-4 text-right whitespace-nowrap tabular-nums ${textMuted}`}>
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

        {/* Right Inspector Rail (4 Columns): Cohort Pulse + Demographics + Recently Joined */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cohort Pulse Card */}
          <div className={`rounded-xl border p-5 transition-colors ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-tight">Cohort Pulse</h2>
              <Link
                to={`/users?activity=${cohortActivitySlug}`}
                className={`text-xs font-medium inline-flex items-center space-x-0.5 hover:underline ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <span>View</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Period Selector */}
            <div className={`grid grid-cols-4 p-0.5 rounded-lg border text-[11px] font-medium mb-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {[
                { id: 'daily', label: 'Today' },
                { id: 'weekly', label: '7d' },
                { id: 'fifteen_days', label: '15d' },
                { id: 'monthly', label: '30d' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveUserPeriod(p.id)}
                  className={`py-1 rounded-md transition-colors text-center ${
                    activeUserPeriod === p.id
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-xs'
                      : textMuted
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Cohort Figures */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className={`text-xs ${textMuted}`}>Active Artisans</span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-2xl font-semibold tabular-nums">
                      {currentActiveStats.active_users}
                    </span>
                    <span className={`text-xs tabular-nums ${textMuted}`}>
                      / {kpi.total_users}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {currentActiveStats.percentage}% active
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDark ? 'bg-slate-200' : 'bg-slate-900'
                  }`}
                  style={{ width: `${currentActiveStats.percentage}%` }}
                />
              </div>

              <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${dividerColor}`}>
                <div>
                  <span className={`text-[11px] ${textMuted}`}>Diamonds</span>
                  <p className="text-sm font-semibold tabular-nums mt-0.5">
                    {Number(currentActiveStats.diamonds).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className={`text-[11px] ${textMuted}`}>Wages</span>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                    ₹{Number(currentActiveStats.earnings).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className={`rounded-xl border p-5 space-y-4 transition-colors ${cardBg}`}>
            <h2 className="text-sm font-semibold tracking-tight">Platform Breakdown</h2>

            {/* Language */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium flex items-center space-x-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Language</span>
                </span>
                <span className={`tabular-nums ${textMuted}`}>
                  {demographics.gujarati_users} GU · {demographics.english_users} EN
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-sky-500 h-full" style={{ width: `${guPct}%` }} />
                <div className="bg-slate-400 dark:bg-slate-600 h-full" style={{ width: `${enPct}%` }} />
              </div>
            </div>

            {/* App Mode */}
            <div className={`pt-3 border-t ${dividerColor}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>App Mode</span>
                </span>
                <span className={`tabular-nums ${textMuted}`}>
                  {demographics.advance_mode_users || 0} Adv · {demographics.simple_mode_users || 0} Simple
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: `${advancePct}%` }} />
                <div className="bg-slate-400 dark:bg-slate-600 h-full" style={{ width: `${simplePct}%` }} />
              </div>
            </div>

            {/* Auth Provider */}
            <div className={`pt-3 border-t grid grid-cols-2 gap-3 text-xs ${dividerColor}`}>
              <div>
                <span className={`text-[11px] flex items-center space-x-1 ${textMuted}`}>
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile OTP</span>
                </span>
                <p className="text-base font-semibold mt-0.5 tabular-nums">{demographics.phone_users}</p>
              </div>
              <div>
                <span className={`text-[11px] ${textMuted}`}>Google Sign-in</span>
                <p className="text-base font-semibold mt-0.5 tabular-nums">{demographics.google_users}</p>
              </div>
            </div>
          </div>

          {/* Recently Joined Artisans */}
          <div className={`rounded-xl border p-5 transition-colors ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-tight flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-slate-400" />
                <span>Recently Joined</span>
              </h2>
              <Link
                to="/users?activity=new_users"
                className={`text-xs font-medium hover:underline ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                View all
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className={`text-xs py-4 text-center ${textMuted}`}>No users registered yet.</p>
            ) : (
              <div className={`divide-y ${dividerColor}`}>
                {recentUsers.map((u) => {
                  const joinedTime = formatJoinDateTime(u.created_at);
                  const duration = getConnectedDuration(u.created_at);

                  return (
                    <Link
                      key={u.id}
                      to={`/users/${u.id}`}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <UserAvatar src={u.profile_image_url} name={u.full_name} size="sm" />
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <p className="text-xs font-medium group-hover:underline truncate">
                              {u.full_name || 'Artisan'}
                            </p>
                            {u.app_mode === 'advance' && (
                              <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                ADV
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate tabular-nums ${textMuted}`}>
                            {u.mobile_number || u.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {duration}
                        </span>
                        <p className={`text-[10px] tabular-nums ${textMuted}`}>{joinedTime.split(',')[0]}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
