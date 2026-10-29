import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Users,
  AlertTriangle,
  Clock,
  Send,
  Sparkles,
  Megaphone,
  Smartphone,
  Globe2,
  Search,
  ArrowUpRight,
  CheckCircle2,
  RotateCw,
  X,
  ShieldAlert,
  Zap,
  Filter,
  Flame,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  UserX,
  Volume2,
  VolumeX,
  Check
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';

const REENGAGEMENT_TEMPLATES = {
  inactive_7d: {
    cohortKey: 'inactive_7d',
    badge: '7+ Days Inactive',
    badgeColor: 'amber',
    title: 'We miss your daily diamond logs! 💎',
    title_gu: 'આજના હીરા નોંધવાના બાકી છે? 💎',
    body: "We noticed you haven't recorded your work recently. Open HeeraMate today to keep your daily diamond tallies and earnings accurate!",
    body_gu: 'હીરામેટમાં થોડા દિવસથી કામ નોંધાયેલ નથી! તમારી મહેનત અને કમાણીનો ચોક્કસ હિસાબ રાખવા આજે જ નોંધણી કરો.'
  },
  inactive_14d: {
    cohortKey: 'inactive_14d',
    badge: '14+ Days Inactive (High Churn)',
    badgeColor: 'rose',
    title: 'HeeraMate misses you! Check your pending records ✍️',
    title_gu: 'હીરામેટ પરિવારમાં તમારી ખોટ વર્તાય છે! ✍️',
    body: "It has been over two weeks since your last entry. Log back in to review your rates, previous wages, and current diamond entries.",
    body_gu: 'છેલ્લા ૧૪ દિવસથી તમારું કામ નોંધાયું નથી. તમારી દૈનિક મહેનત, ઉપાડ અને કમાણીનો હિસાબ જાળવવા એપ ખોલો.'
  },
  never_logged: {
    cohortKey: 'never_logged',
    badge: 'Never Logged Work',
    badgeColor: 'purple',
    title: 'Ready to track your diamond work with HeeraMate? 🚀',
    title_gu: 'હીરામેટ સાથે હીરાની ગણતરી શરૂ કરો! 🚀',
    body: 'Set up your diamond polishing rate and record your very first day to start tracking your daily wages automatically.',
    body_gu: 'હીરામેટમાં સ્વાગત છે! તમારો ભાવ સેટ કરો અને આજે જ પ્રથમ દિવસનું કામ નોંધીને તમારી કમાણીનો હિસાબ શરૂ કરો.'
  }
};

const Retention = () => {
  const { isDark } = useTheme();

  // Metrics state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Artisans List state
  const [activeCohort, setActiveCohort] = useState('inactive_7d'); // 'inactive_7d' | 'inactive_14d' | 'never_logged'
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Push Trigger Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('cohort'); // 'cohort' | 'single'
  const [targetCohort, setTargetCohort] = useState('inactive_7d');
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [pushTitle, setPushTitle] = useState('');
  const [pushTitleGu, setPushTitleGu] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushBodyGu, setPushBodyGu] = useState('');
  const [forceNotification, setForceNotification] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Styling helpers
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';

  // 1. Fetch Retention KPIs
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const res = await api.get('/users/retention-metrics');
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load retention metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // 2. Fetch Users by Cohort
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users', {
        params: {
          page,
          limit: 12,
          search: search.trim() || undefined,
          activity: activeCohort,
          language: language !== 'all' ? language : undefined,
          status: 'active'
        }
      });
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        setPagination(res.data.data.pagination || { total_count: 0, total_pages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch cohort users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [page, search, activeCohort, language]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open modal for entire cohort
  const handleOpenCohortPush = (cohortKey) => {
    const tmpl = REENGAGEMENT_TEMPLATES[cohortKey] || REENGAGEMENT_TEMPLATES.inactive_7d;
    setModalMode('cohort');
    setTargetCohort(cohortKey);
    setSelectedArtisan(null);
    setPushTitle(tmpl.title);
    setPushTitleGu(tmpl.title_gu);
    setPushBody(tmpl.body);
    setPushBodyGu(tmpl.body_gu);
    setForceNotification(false);
    setSendResult(null);
    setModalOpen(true);
  };

  // Open modal for single artisan
  const handleOpenSinglePush = (artisan) => {
    // Choose template based on artisan's inactivity
    let tmplKey = 'inactive_7d';
    if (!artisan.has_ever_logged) {
      tmplKey = 'never_logged';
    } else if (artisan.days_inactive >= 14) {
      tmplKey = 'inactive_14d';
    }
    const tmpl = REENGAGEMENT_TEMPLATES[tmplKey];

    setModalMode('single');
    setSelectedArtisan(artisan);
    setTargetCohort(tmplKey);
    setPushTitle(tmpl.title);
    setPushTitleGu(tmpl.title_gu);
    setPushBody(tmpl.body);
    setPushBodyGu(tmpl.body_gu);
    setForceNotification(false);
    setSendResult(null);
    setModalOpen(true);
  };

  // Dispatch Re-engagement Push
  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('Please provide title and message body.');
      return;
    }

    setSendingPush(true);
    setSendResult(null);

    try {
      const payload = {
        title: pushTitle.trim(),
        title_gu: pushTitleGu.trim() || undefined,
        body: pushBody.trim(),
        body_gu: pushBodyGu.trim() || undefined,
        type: 'general',
        target_group: modalMode === 'single' ? 'specific' : targetCohort,
        user_id: modalMode === 'single' ? selectedArtisan?.id : undefined,
        force_notification: forceNotification
      };

      const res = await api.post('/notifications/broadcast', payload);
      if (res.data?.success) {
        setSendResult({
          success: true,
          message: res.data.message || 'Push notifications dispatched successfully!',
          data: res.data.data
        });
        fetchMetrics();
      } else {
        setSendResult({
          success: false,
          message: res.data?.message || 'Failed to dispatch notification'
        });
      }
    } catch (err) {
      console.error('Send push error:', err);
      setSendResult({
        success: false,
        message: err.response?.data?.message || 'An error occurred while sending push notifications'
      });
    } finally {
      setSendingPush(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border ${cardBg} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${headingColor}`}>
                  Artisan Retention & Inactivity Engine
                </h1>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  Identify inactive diamond artisans, mitigate churn, and trigger 1-click friendly re-engagement reminders.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                fetchMetrics();
                fetchUsers();
              }}
              disabled={metricsLoading || loadingUsers}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${metricsLoading || loadingUsers ? 'animate-spin text-cyan-500' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <Link
              to="/notifications"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-600 text-white flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 7+ Days Inactive */}
        <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-semibold ${textMuted}`}>Inactive &gt; 7 Days</p>
              <h3 className={`text-2xl font-black mt-1 ${headingColor}`}>
                {metricsLoading ? '...' : (metrics?.inactive_7d ?? 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {metrics?.total_users ? `${Math.round(((metrics.inactive_7d || 0) / metrics.total_users) * 100)}% of total` : '0%'}
            </span>
            <span className={`text-[11px] ${textMuted}`}>Needs check-in</span>
          </div>
        </div>

        {/* 14+ Days Inactive (High Churn Risk) */}
        <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-semibold ${textMuted}`}>Inactive &gt; 14 Days</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                {metricsLoading ? '...' : (metrics?.inactive_14d ?? 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              High Churn Risk
            </span>
            <span className={`text-[11px] ${textMuted}`}>Re-activation target</span>
          </div>
        </div>

        {/* Never Logged Any Work */}
        <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-semibold ${textMuted}`}>Never Logged Work</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {metricsLoading ? '...' : (metrics?.never_logged ?? 0)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Onboarding Gap
            </span>
            <span className={`text-[11px] ${textMuted}`}>Zero entries</span>
          </div>
        </div>

        {/* 7-Day Consistency Rate */}
        <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-semibold ${textMuted}`}>Active Consistency (7d)</p>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {metricsLoading ? '...' : `${metrics?.retention_rate_7d ?? 0}%`}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {metrics?.active_7d ?? 0} active artisans
            </span>
            <span className={`text-[11px] ${textMuted}`}>Active recently</span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Re-engagement Triggers */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <h2 className={`text-sm sm:text-base font-bold ${headingColor}`}>
            1-Click Cohort Re-engagement Launches
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 7-Day Inactive */}
          <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all`}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                  Cohort 1 • 7+ Days Inactive
                </span>
                <span className={`text-xs font-semibold ${textMuted}`}>
                  {metrics?.inactive_7d ?? 0} Artisans
                </span>
              </div>
              <h3 className={`text-sm font-bold ${headingColor}`}>
                Friendly Check-in Reminder
              </h3>
              <p className={`text-xs leading-relaxed ${textMuted}`}>
                "We noticed you haven't recorded your work recently! Open HeeraMate today to keep your tallies accurate."
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenCohortPush('inactive_7d')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger 7-Day Push</span>
              </button>
            </div>
          </div>

          {/* Card 2: 14-Day Inactive */}
          <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm flex flex-col justify-between hover:border-rose-500/40 transition-all`}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                  Cohort 2 • 14+ Days Inactive
                </span>
                <span className={`text-xs font-semibold ${textMuted}`}>
                  {metrics?.inactive_14d ?? 0} Artisans
                </span>
              </div>
              <h3 className={`text-sm font-bold ${headingColor}`}>
                High-Priority Re-activation Push
              </h3>
              <p className={`text-xs leading-relaxed ${textMuted}`}>
                "HeeraMate misses you! Don't lose track of your hard-earned wages and daily diamond counts."
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenCohortPush('inactive_14d')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger 14-Day Push</span>
              </button>
            </div>
          </div>

          {/* Card 3: Never Logged */}
          <div className={`p-5 rounded-3xl border ${cardBg} shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-all`}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20">
                  Cohort 3 • Never Logged
                </span>
                <span className={`text-xs font-semibold ${textMuted}`}>
                  {metrics?.never_logged ?? 0} Artisans
                </span>
              </div>
              <h3 className={`text-sm font-bold ${headingColor}`}>
                Onboarding Assistance Push
              </h3>
              <p className={`text-xs leading-relaxed ${textMuted}`}>
                "Welcome to HeeraMate! Need help getting started? Add your diamond rate and log your first entry."
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenCohortPush('never_logged')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger Onboarding Push</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inactive Artisan Follow-up Directory */}
      <div className={`rounded-3xl border ${cardBg} shadow-sm overflow-hidden`}>
        {/* Tabs & Search Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Cohort Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setActiveCohort('inactive_7d');
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeCohort === 'inactive_7d'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Inactive (&gt;7 Days)</span>
                {metrics?.inactive_7d !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    activeCohort === 'inactive_7d' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {metrics.inactive_7d}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveCohort('inactive_14d');
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeCohort === 'inactive_14d'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Inactive (&gt;14 Days)</span>
                {metrics?.inactive_14d !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    activeCohort === 'inactive_14d' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {metrics.inactive_14d}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveCohort('never_logged');
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeCohort === 'never_logged'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Never Logged Work</span>
                {metrics?.never_logged !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    activeCohort === 'never_logged' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {metrics.never_logged}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Cohort Send Button */}
            <button
              onClick={() => handleOpenCohortPush(activeCohort)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white flex items-center space-x-1.5 self-start md:self-auto shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Push to This Cohort ({pagination.total_count})</span>
            </button>
          </div>

          {/* Search & Language Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search inactive artisan by name, mobile, or email..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Globe2 className={`w-4 h-4 shrink-0 ${textMuted}`} />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setPage(1);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">All Languages</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inactive Artisans Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-100 text-slate-500 bg-slate-50/70'
              }`}>
                <th className="py-3 px-4">Artisan</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Inactivity Period</th>
                <th className="py-3 px-4">Last Work Date</th>
                <th className="py-3 px-4">Push Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loadingUsers ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <RotateCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto" />
                    <p className={`mt-2 text-xs font-semibold ${textMuted}`}>Loading inactive artisans...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className={`mt-2 text-sm font-bold ${headingColor}`}>No inactive artisans in this cohort!</p>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>
                      {search ? 'Try clearing your search term.' : 'All artisans have logged work consistently.'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const hasToken = Boolean(u.fcm_token && u.fcm_token.length > 10);
                  const isNotificationsAllowed = u.notifications_enabled !== false;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors`}
                    >
                      {/* Artisan Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar src={u.profile_image_url} name={u.full_name} size="sm" />
                          <div>
                            <Link
                              to={`/users/${u.id}`}
                              className={`font-bold hover:text-cyan-500 transition-colors ${headingColor}`}
                            >
                              {u.full_name || 'Unnamed Artisan'}
                            </Link>
                            <p className={`text-[11px] ${textMuted}`}>
                              {u.mobile_number || u.email || 'No phone'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Preferred Language */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.preferred_language === 'gu'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {u.preferred_language === 'gu' ? 'GU (ગુજરાતી)' : 'EN (English)'}
                        </span>
                      </td>

                      {/* Inactivity Duration Pill */}
                      <td className="py-3.5 px-4">
                        {!u.has_ever_logged ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Never logged work
                          </span>
                        ) : u.days_inactive >= 14 ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {u.days_inactive} days inactive
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {u.days_inactive} days inactive
                          </span>
                        )}
                      </td>

                      {/* Last Recorded Work Date */}
                      <td className="py-3.5 px-4">
                        <span className={`font-mono text-[11px] ${textMuted}`}>
                          {u.latest_work_date || 'No logs recorded'}
                        </span>
                      </td>

                      {/* FCM Push Token Status */}
                      <td className="py-3.5 px-4">
                        {hasToken ? (
                          isNotificationsAllowed ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Smartphone className="w-3 h-3" />
                              <span>Push Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <VolumeX className="w-3 h-3" />
                              <span>Muted</span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            <span>In-App Only</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenSinglePush(u)}
                            title="Send Personal Re-engagement Reminder"
                            className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 hover:text-white border border-cyan-500/20 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/users/${u.id}`}
                            title="View Full Artisan Profile"
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className={textMuted}>
              Showing page {page} of {pagination.total_pages} ({pagination.total_count} inactive artisans)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Re-engagement Push Confirmation / Dispatch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 space-y-5 ${cardBg} max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-bold ${headingColor}`}>
                    {modalMode === 'single'
                      ? 'Send Re-engagement Push to Artisan'
                      : `Dispatch Re-engagement Push to Cohort`}
                  </h2>
                  <p className={`text-xs ${textMuted}`}>
                    {modalMode === 'single'
                      ? `Targeting ${selectedArtisan?.full_name || 'selected artisan'}`
                      : `Targeting cohort: ${REENGAGEMENT_TEMPLATES[targetCohort]?.badge}`}
                  </p>
                </div>
              </div>
              <button
                disabled={sendingPush}
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Artisan Card if Single */}
            {modalMode === 'single' && selectedArtisan && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <UserAvatar src={selectedArtisan.profile_image_url} name={selectedArtisan.full_name} size="sm" />
                  <div>
                    <p className={`font-bold ${headingColor}`}>{selectedArtisan.full_name}</p>
                    <p className={textMuted}>{selectedArtisan.mobile_number || selectedArtisan.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedArtisan.preferred_language === 'gu'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                  }`}>
                    {selectedArtisan.preferred_language === 'gu' ? 'Gujarati' : 'English'}
                  </span>
                </div>
              </div>
            )}

            {/* Language-segregated editable inputs */}
            <div className="space-y-4 text-xs">
              {/* English Version */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">EN</span>
                  <span>English Notification (Delivered to English users):</span>
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>Title</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>Body</label>
                  <textarea
                    rows="2"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Gujarati Version */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px]">GU</span>
                  <span>ગુજરાતી આવૃત્તિ (Delivered to Gujarati users):</span>
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>ગુજરાતી શીર્ષક (Title)</label>
                  <input
                    type="text"
                    value={pushTitleGu}
                    onChange={(e) => setPushTitleGu(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>ગુજરાતી સંદેશ (Body)</label>
                  <textarea
                    rows="2"
                    value={pushBodyGu}
                    onChange={(e) => setPushBodyGu(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Force Notification Toggle */}
              <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                forceNotification
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <Zap className={`w-4 h-4 ${forceNotification ? 'text-amber-500' : textMuted}`} />
                  <div>
                    <p className={`font-bold ${headingColor}`}>Force Push Delivery</p>
                    <p className={`text-[11px] ${textMuted}`}>
                      Deliver even if the artisan has muted in-app notification toggles
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={forceNotification}
                  onChange={(e) => setForceNotification(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
              </label>
            </div>

            {/* Results Banner */}
            {sendResult && (
              <div className={`p-4 rounded-2xl border text-xs ${
                sendResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}>
                <div className="flex items-center space-x-2 font-bold">
                  {sendResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{sendResult.message}</span>
                </div>
                {sendResult.data && sendResult.data.fcm && (
                  <p className="mt-1 text-[11px] opacity-90">
                    FCM Push Status: {sendResult.data.fcm.success_count} delivered successfully ({sendResult.data.fcm.gu_sent} GU, {sendResult.data.fcm.en_sent} EN).
                  </p>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={sendingPush}
                onClick={() => setModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Close
              </button>
              <button
                type="button"
                disabled={sendingPush}
                onClick={handleSendPush}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white flex items-center space-x-2 shadow-sm transition-all"
              >
                {sendingPush ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Re-engagement Push</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retention;
