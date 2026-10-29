import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bell, 
  Send, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Smartphone, 
  Globe2, 
  Filter, 
  History,
  RotateCw,
  Flame,
  Wrench,
  Megaphone,
  X,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  Zap,
  Check,
  Volume2,
  VolumeX,
  User
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/UserAvatar';

const PRESETS = [
  {
    label: 'Daily Work Reminder (સાંજે કામ નોંધણી)',
    type: 'general',
    title: 'Did you record your diamonds today?',
    title_gu: 'આજના હીરા નોંધવાના બાકી છે?',
    body: "Don't forget to log your daily diamond polishing entries and track your wages.",
    body_gu: 'આજના હીરાનું કામ હમણાં જ નોંધી લો અને તમારી દૈનિક કમાણીનો હિસાબ રાખો.'
  },
  {
    label: '7-Day Inactive Check-in (૭+ દિવસ નિષ્ક્રિય રિમાઇન્ડર)',
    type: 'general',
    title: 'We miss your daily diamond logs! 💎',
    title_gu: 'આજના હીરા નોંધવાના બાકી છે? 💎',
    body: "We noticed you haven't recorded your work recently. Open HeeraMate today to keep your daily diamond tallies accurate!",
    body_gu: 'હીરામેટમાં થોડા દિવસથી કામ નોંધાયેલ નથી! તમારી મહેનત અને કમાણીનો ચોક્કસ હિસાબ રાખવા આજે જ નોંધણી કરો.'
  },
  {
    label: '14-Day Re-activation Alert (૧૪+ દિવસ નિષ્ક્રિય રિકવરી)',
    type: 'general',
    title: 'HeeraMate misses you! Check your pending records ✍️',
    title_gu: 'હીરામેટ પરિવારમાં તમારી ખોટ વર્તાય છે! ✍️',
    body: "It has been over two weeks since your last entry. Log back in to review your rates, previous wages, and current diamond entries.",
    body_gu: 'છેલ્લા ૧૪ દિવસથી તમારું કામ નોંધાયું નથી. તમારી દૈનિક મહેનત, ઉપાડ અને કમાણીનો હિસાબ જાળવવા એપ ખોલો.'
  },
  {
    label: 'Diwali Vacation Wishes (દિવાળી શુભેચ્છા)',
    type: 'general',
    title: 'Happy Diwali & Prosperous New Year!',
    title_gu: 'દિવાળી અને નવા વર્ષની હાર્દિક શુભકામનાઓ!',
    body: 'Wishing you and your family joy and prosperity from the HeeraMate team.',
    body_gu: 'હીરામેટ તરફથી તમને અને તમારા પરિવારને દિવાળી અને નૂતન વર્ષાભિનંદન!'
  },
  {
    label: 'Server Maintenance Notice (સર્વર મેન્ટેનન્સ)',
    type: 'maintenance',
    title: 'Scheduled System Maintenance',
    title_gu: 'નિયમિત સિસ્ટમ મેન્ટેનન્સ',
    body: 'HeeraMate backend will undergo scheduled maintenance tonight. Service will resume shortly.',
    body_gu: 'આજે રાત્રે સિસ્ટમ મેન્ટેનન્સ ચાલશે. સેવા ટૂંક સમયમાં ફરી શરૂ થશે.'
  }
];

const Notifications = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  
  // Form State
  const [title, setTitle] = useState('');
  const [titleGu, setTitleGu] = useState('');
  const [body, setBody] = useState('');
  const [bodyGu, setBodyGu] = useState('');
  const [type, setType] = useState('general');
  const [targetGroup, setTargetGroup] = useState('all'); // 'all' | 'specific' | 'gujarati_only' | 'english_only' | 'active_today'
  const [forceNotification, setForceNotification] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Specific User Search & List State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History State
  const [campaigns, setCampaigns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load initial users list for the specific user selector
  const fetchUsers = async (searchQuery = '') => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users', {
        params: { search: searchQuery.trim(), limit: 15 }
      });
      setUserList(res.data?.data?.users || []);
    } catch (err) {
      console.error('Error fetching users for notification:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // When switching to 'specific' target group, automatically load users
  useEffect(() => {
    if (targetGroup === 'specific') {
      fetchUsers(userSearch);
    }
  }, [targetGroup]);

  // Debounced search when user types in search box
  useEffect(() => {
    if (targetGroup !== 'specific') return;
    const handler = setTimeout(() => {
      fetchUsers(userSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [userSearch]);

  // Handle URL query parameter ?userId=xxx or ?user_id=xxx
  useEffect(() => {
    const urlUserId = searchParams.get('userId') || searchParams.get('user_id');
    if (urlUserId) {
      setTargetGroup('specific');
      api.get(`/users/${urlUserId}`)
        .then((res) => {
          const u = res.data?.data?.user;
          if (u) {
            setSelectedUser(u);
          }
        })
        .catch((err) => console.error('Error pre-loading user from URL param:', err));
    }
  }, [searchParams]);

  const fetchCampaigns = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/notifications/campaigns');
      setCampaigns(res.data?.data?.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchCampaigns();
    }
  }, [activeTab]);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setTitleGu(preset.title_gu);
    setBody(preset.body);
    setBodyGu(preset.body_gu);
    setType(preset.type);
    setFeedback({ success: true, message: 'Preset applied! You can customize before sending.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Step 1: Open Confirmation Modal with Validation
  const handleInitiateSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please provide title and body in English.');
      return;
    }
    if (targetGroup === 'specific' && !selectedUser) {
      alert('Please select an artisan from the list below to send this notification.');
      return;
    }

    // Remind admin if Gujarati is missing for "All Users" so Gujarati users don't miss out on Gujarati
    if (targetGroup === 'all' && (!titleGu.trim() || !bodyGu.trim())) {
      const proceed = window.confirm(
        'Language Reminder:\nYou have not entered the Gujarati title or message.\n\nIf you proceed, Gujarati users will receive the English version as a fallback.\n\nClick OK to proceed with English fallback, or Cancel to enter the Gujarati translation now.'
      );
      if (!proceed) return;
    }

    setShowConfirmModal(true);
  };

  // Step 2: Confirm & Execute Dispatch
  const handleConfirmSend = async () => {
    setSending(true);
    setFeedback(null);

    try {
      const res = await api.post('/notifications/broadcast', {
        title: title.trim(),
        title_gu: titleGu.trim(),
        body: body.trim(),
        body_gu: bodyGu.trim(),
        type,
        target_group: targetGroup,
        user_id: targetGroup === 'specific' ? selectedUser?.id : null,
        force_notification: forceNotification
      });

      setFeedback({
        success: true,
        message: res.data?.message || 'Broadcast notification sent successfully!'
      });

      setShowConfirmModal(false);

      // Clear form
      setTitle('');
      setTitleGu('');
      setBody('');
      setBodyGu('');
      if (targetGroup === 'specific') {
        setSelectedUser(null);
        setUserSearch('');
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      setFeedback({
        success: false,
        message: err.response?.data?.message || 'Failed to send broadcast notification.'
      });
      setShowConfirmModal(false);
    } finally {
      setSending(false);
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

  const audienceOptions = [
    {
      id: 'all',
      title: 'All Users',
      subtitle: 'Broadcast to all registered artisans',
      icon: Users
    },
    {
      id: 'specific',
      title: 'Specific User',
      subtitle: 'Pick an individual artisan to notify',
      icon: User
    },
    {
      id: 'gujarati_only',
      title: 'Gujarati Only',
      subtitle: 'Artisans with Gujarati language (ગુજરાતી)',
      icon: Globe2
    },
    {
      id: 'english_only',
      title: 'English Only',
      subtitle: 'Artisans with English preferred',
      icon: Globe2
    },
    {
      id: 'active_today',
      title: 'Active Today',
      subtitle: 'Artisans who recorded work today',
      icon: Flame
    },
    {
      id: 'inactive_7d',
      title: 'Inactive >7d',
      subtitle: 'Artisans inactive for 7+ days',
      icon: Clock
    },
    {
      id: 'inactive_14d',
      title: 'Inactive >14d',
      subtitle: 'High churn risk (14+ days)',
      icon: UserX
    },
    {
      id: 'never_logged',
      title: 'Never Logged',
      subtitle: 'Artisans with 0 work logs',
      icon: UserX
    }
  ];

  const getTargetGroupLabel = (group) => {
    switch (group) {
      case 'all':
        return 'All Diamond Artisans (બધા કારીગરો)';
      case 'specific':
        return selectedUser 
          ? `Specific: ${selectedUser.full_name || selectedUser.mobile_number || 'Artisan'}`
          : 'Specific Artisan (No artisan selected)';
      case 'gujarati_only':
        return 'Gujarati Speakers Only (ગુજરાતી ભાષા)';
      case 'english_only':
        return 'English Speakers Only';
      case 'active_today':
        return 'Active Artisans Today';
      case 'inactive_7d':
        return 'Inactive Artisans (>7 Days)';
      case 'inactive_14d':
        return 'Inactive Artisans (>14 Days - High Churn Risk)';
      case 'never_logged':
        return 'Never Logged Work Artisans';
      default:
        return group.toUpperCase();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <h1 className={`text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Broadcast Push Notifications
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
            Send announcements, work reminders, greetings, and emergency alerts to all users or specific artisans.
          </p>
        </div>

        {/* Tab switch */}
        <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'compose'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Campaign History</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          feedback.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
        }`}>
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
            {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Composer Form */}
          <div className={`lg:col-span-2 rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
            {/* Quick 1-Click Presets */}
            <div className="mb-6 pb-5 border-b border-inherit">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Quick 1-Click Presets (ઝડપી ટેમ્પલેટ્સ)
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isDark
                        ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleInitiateSend} className="space-y-5">
              {/* TARGET AUDIENCE SELECTION: VISUAL TABS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-cyan-600 dark:text-cyan-400">
                  Step 1: Choose Target Audience (લક્ષિત કારીગરો પસંદ કરો)
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {audienceOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = targetGroup === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTargetGroup(opt.id);
                          if (opt.id !== 'specific') {
                            setSelectedUser(null);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/25 ring-2 ring-cyan-500/20'
                            : isDark
                            ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-cyan-500'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : ''}`}>
                            {opt.title}
                          </p>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-cyan-100' : textMuted}`}>
                            {opt.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC USER PICKER PANEL (Visible when targetGroup === 'specific') */}
              {targetGroup === 'specific' && (
                <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 animate-in fade-in transition-all ${
                  isDark ? 'bg-slate-950/90 border-cyan-500/30' : 'bg-cyan-50/40 border-cyan-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3 border-inherit">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center space-x-1.5 uppercase tracking-wider">
                        <User className="w-4 h-4" />
                        <span>Select Specific Artisan (ચોક્કસ કારીગર પસંદ કરો)</span>
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                        Choose which user should receive this push notification.
                      </p>
                    </div>

                    {selectedUser && (
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 font-semibold"
                      >
                        Change / Reselect
                      </button>
                    )}
                  </div>

                  {/* ACTIVE SELECTED USER BANNER */}
                  {selectedUser ? (
                    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex items-center space-x-3.5">
                        <UserAvatar src={selectedUser.profile_image_url} name={selectedUser.full_name} size="md" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">{selectedUser.full_name || 'Artisan (No Name)'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase">
                              {selectedUser.preferred_language || 'EN'}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${textMuted}`}>
                            {selectedUser.mobile_number} {selectedUser.email ? `• ${selectedUser.email}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Notification Permission Badge */}
                        {selectedUser.notifications_enabled === false ? (
                          <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30">
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Notifications Muted by User</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Notifications Allowed</span>
                          </span>
                        )}

                        {/* Push Token Badge */}
                        {(selectedUser.fcm_token || selectedUser.push_token || selectedUser.latest_device?.push_token) ? (
                          <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/30">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Push Token Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-500 font-semibold border border-slate-500/30">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <span>No Push Token (In-App Only)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* USER SEARCH & SELECTION LIST */
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search artisan by name, mobile number, or email..."
                          className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                        />
                        {loadingUsers && (
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin absolute right-3.5 top-3"></div>
                        )}
                      </div>

                      {/* Clickable Users List */}
                      <div className={`rounded-xl border max-h-64 overflow-y-auto divide-y ${
                        isDark ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
                      }`}>
                        {loadingUsers && userList.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            Loading registered artisans...
                          </div>
                        ) : userList.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No artisans found matching "{userSearch}".
                          </div>
                        ) : (
                          userList.map((u) => {
                            const isMuted = u.notifications_enabled === false;
                            return (
                              <div
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className="p-3 hover:bg-cyan-500/10 cursor-pointer flex items-center justify-between transition-colors group"
                              >
                                <div className="flex items-center space-x-3">
                                  <UserAvatar src={u.profile_image_url} name={u.full_name} size="sm" />
                                  <div>
                                    <p className="text-xs font-bold leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                                      {u.full_name || 'Artisan (No Name)'}
                                    </p>
                                    <p className={`text-[11px] ${textMuted}`}>
                                      {u.mobile_number || u.email || 'No phone'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {/* Language */}
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-500/10 text-slate-400 uppercase">
                                    {u.preferred_language || 'EN'}
                                  </span>

                                  {/* Notification Permission Indicator */}
                                  {isMuted ? (
                                    <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                                      <VolumeX className="w-3 h-3" />
                                      <span>Muted</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                                      <Volume2 className="w-3 h-3" />
                                      <span>Allowed</span>
                                    </span>
                                  )}

                                  {/* Token status */}
                                  {(u.fcm_token || u.push_token || u.latest_device?.push_token) ? (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                                      FCM Ready
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-500 font-medium">
                                      No Token
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    className="ml-2 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold opacity-90 group-hover:opacity-100 transition-all shadow-sm"
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICATION TYPE */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Notification Type (સંદેશ પ્રકાર)
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                >
                  <option value="general">📢 General Broadcast / Daily Reminder</option>
                  <option value="update">✨ New App Feature Update</option>
                  <option value="maintenance">⚠️ System Maintenance / Downtime Notice</option>
                </select>
              </div>

              {/* LANGUAGE-WISE DELIVERY BANNER */}
              <div className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                isDark ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50/80 border-cyan-200 text-cyan-900'
              }`}>
                <Globe2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold flex items-center space-x-1.5">
                    <span>Automatic Language-Wise Delivery</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
                      Bilingual
                    </span>
                  </p>
                  <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                    {targetGroup === 'all'
                      ? 'English users will receive the English notification, and Gujarati users will receive the Gujarati notification automatically on their devices and in-app inbox.'
                      : targetGroup === 'gujarati_only'
                      ? 'This notification will only be sent to Gujarati-speaking artisans in Gujarati.'
                      : targetGroup === 'english_only'
                      ? 'This notification will only be sent to English-speaking artisans in English.'
                      : targetGroup === 'specific'
                      ? `Delivering in ${selectedUser?.preferred_language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'} based on ${selectedUser?.full_name || 'this artisan'}'s profile setting.`
                      : 'Notification text is matched to each artisan’s preferred language.'}
                  </p>
                </div>
              </div>

              {/* TITLE INPUTS (EN & GU) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                    <span>
                      Notification Title (English) <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                      → For English Users
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daily Work Reminder"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                    <span>
                      શીર્ષક (ગુજરાતી શીર્ષક)
                    </span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                      → For Gujarati Users
                    </span>
                  </label>
                  <input
                    type="text"
                    value={titleGu}
                    onChange={(e) => setTitleGu(e.target.value)}
                    placeholder="દા.ત. આજના હીરા નોંધવાના બાકી છે?"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                  />
                </div>
              </div>

              {/* BODY TEXTAREA (EN & GU) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                    <span>
                      Message Body (English) <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                      → For English Users
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter message to show in notification..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 resize-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                    <span>
                      સંદેશ (ગુજરાતી મેસેજ)
                    </span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                      → For Gujarati Users
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={bodyGu}
                    onChange={(e) => setBodyGu(e.target.value)}
                    placeholder="કારીગર માટે ગુજરાતીમાં સંદેશ દાખલ કરો..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 resize-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* FORCE NOTIFICATION TOGGLE & PREFERENCE CONTROL */}
              <div className={`p-4 rounded-xl border transition-all ${
                forceNotification
                  ? isDark 
                    ? 'bg-amber-950/25 border-amber-500/40 shadow-inner' 
                    : 'bg-amber-50/80 border-amber-300 shadow-sm'
                  : isDark 
                    ? 'bg-slate-950 border-slate-800' 
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 pr-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      forceNotification
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold flex items-center space-x-2">
                        <span>Force Notification (Deliver even if notification pref is OFF)</span>
                        {forceNotification && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold uppercase">
                            Forced ON
                          </span>
                        )}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                        If enabled, sends push notifications directly to the device even if the artisan disabled notifications in their app settings.
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={forceNotification}
                      onChange={(e) => setForceNotification(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Contextual warning if specific user has notifications muted */}
                {targetGroup === 'specific' && selectedUser?.notifications_enabled === false && !forceNotification && (
                  <div className="mt-3 pt-3 border-t border-inherit flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Notice: <strong>{selectedUser.full_name}</strong> has turned OFF notifications. They will not receive a push alert unless you turn ON "Force Notification" above.
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Phone Live Preview Card */}
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 transition-all ${cardBg}`}>
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Artisan Phone Preview</h3>
              </div>

              <p className={`text-[11px] mb-3 ${textMuted}`}>
                Simulated view of the notification banner on mobile devices:
              </p>

              {/* Mock Notification Card (English) */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 shadow-xl mb-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="font-bold text-cyan-400 flex items-center space-x-1">
                    <span>💎 HeeraMate</span>
                  </span>
                  <span>just now</span>
                </div>
                <p className="font-bold text-xs text-white">{title || 'Notification Title'}</p>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                  {body || 'Your message will appear here for diamond artisans.'}
                </p>
              </div>

              {/* Mock Notification Card (Gujarati) */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="font-bold text-cyan-400 flex items-center space-x-1">
                    <span>💎 હીરામેટ (ગુજરાતી)</span>
                  </span>
                  <span>હમણાં જ</span>
                </div>
                <p className="font-bold text-xs text-white">{titleGu || title || 'સંદેશ શીર્ષક'}</p>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                  {bodyGu || body || 'તમારો ગુજરાતી સંદેશ અહીં દેખાશે.'}
                </p>
              </div>

              {/* Targeting Info Card */}
              <div className={`mt-4 p-3 rounded-xl border text-[11px] space-y-2 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={textMuted}>Target Audience:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 truncate max-w-[170px]">
                    {getTargetGroupLabel(targetGroup)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={textMuted}>Force Delivery:</span>
                  <span className={`font-bold ${forceNotification ? 'text-amber-500' : 'text-slate-400'}`}>
                    {forceNotification ? 'YES (Bypass Mute)' : 'NO (Standard)'}
                  </span>
                </div>

                {targetGroup === 'specific' && selectedUser && (
                  <div className="flex justify-between items-center pt-1 border-t border-inherit">
                    <span className={textMuted}>User Mute Setting:</span>
                    <span className={`font-bold ${selectedUser.notifications_enabled === false ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {selectedUser.notifications_enabled === false ? 'Muted' : 'Allowed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sent Campaigns History */
        <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
          <div className="p-4 border-b border-inherit flex items-center justify-between">
            <h3 className="text-sm font-bold">Past Broadcast Dispatches</h3>
            <button
              onClick={fetchCampaigns}
              className={`p-1.5 rounded-lg border text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>

          {historyLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading broadcast history...
            </div>
          ) : campaigns.length === 0 ? (
            <div className={`py-16 text-center text-xs ${textMuted}`}>
              No broadcast campaigns sent yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase tracking-wider text-[10px] border-b ${
                  isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-100/90 border-slate-200 text-slate-600'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Target Cohort</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Recipients</th>
                    <th className="py-3 px-4 text-right">Dispatched On</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold">{c.title}</p>
                        {c.title_gu && <p className={`text-[11px] mt-0.5 ${textMuted}`}>{c.title_gu}</p>}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                        {c.target_group}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {c.recipients_count} artisans
                      </td>
                      <td className={`py-3 px-4 text-right text-[11px] ${textMuted}`}>
                        {new Date(c.created_at).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !sending && setShowConfirmModal(false)}
          />

          <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border z-10 space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold">Confirm Broadcast Notification</h2>
                  <p className={`text-xs ${textMuted}`}>Review details before dispatching to users</p>
                </div>
              </div>
              <button
                onClick={() => !sending && setShowConfirmModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Audience Pill & Force Status */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className={`font-semibold ${textMuted}`}>Target:</span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                  {getTargetGroupLabel(targetGroup)}
                </span>
              </div>

              {forceNotification && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  ⚡ Force Push Enabled (Bypasses Mute)
                </span>
              )}
            </div>

            {/* Specific User Detailed Card if target is specific */}
            {targetGroup === 'specific' && selectedUser && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100/80 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3.5">
                  <UserAvatar src={selectedUser.profile_image_url} name={selectedUser.full_name} size="md" />
                  <div>
                    <p className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedUser.full_name || 'Artisan'}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {selectedUser.mobile_number || selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {selectedUser.notifications_enabled === false ? (
                    <span className="text-[10px] px-2.5 py-1 rounded-md font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Notifications Muted in App
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-1 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Notifications Allowed
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Notification Content Preview Box (Language-Segregated) */}
            <div className={`rounded-2xl border p-4 space-y-3.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* English Version */}
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                  <span className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">EN</span>
                    <span>English Version (Delivered to English users):</span>
                  </span>
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{body}</p>
              </div>

              {/* Gujarati Version */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                  <span className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">GU</span>
                    <span>ગુજરાતી આવૃત્તિ (Delivered to Gujarati users):</span>
                  </span>
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{titleGu || title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{bodyGu || body}</p>
              </div>
            </div>

            {/* Confirmation Question Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="text-xs font-bold leading-snug">
                  Are you sure you want to send this to user?
                </p>
                <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                  This notification will be delivered immediately to {targetGroup === 'specific' ? (selectedUser?.full_name || 'the selected artisan') : 'the targeted cohort'} and logged in their notification inbox.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={sending}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  isDark 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancel / Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={sending}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {sending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Yes, Send to Users</span>
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

export default Notifications;
