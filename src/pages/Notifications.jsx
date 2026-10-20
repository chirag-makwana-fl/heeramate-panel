import React, { useEffect, useState } from 'react';
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
  X
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

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
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  
  // Form State
  const [title, setTitle] = useState('');
  const [titleGu, setTitleGu] = useState('');
  const [body, setBody] = useState('');
  const [bodyGu, setBodyGu] = useState('');
  const [type, setType] = useState('general');
  const [targetGroup, setTargetGroup] = useState('all');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History State
  const [campaigns, setCampaigns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  // Step 1: Open Confirmation Modal
  const handleInitiateSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please provide title and body in English.');
      return;
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
        target_group: targetGroup
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

  const getTargetGroupLabel = (group) => {
    switch (group) {
      case 'all':
        return 'All Diamond Artisans (બધા કારીગરો)';
      case 'active_today':
        return 'Active Artisans Today';
      case 'gujarati_only':
        return 'Gujarati Speakers (ગુજરાતી ભાષા)';
      case 'english_only':
        return 'English Speakers';
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
            Send announcements, daily work reminders, festive greetings, and alerts directly to diamond artisans.
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

            <form onSubmit={handleInitiateSend} className="space-y-4">
              {/* Target & Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Target Audience (લક્ષિત વર્ગ)
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                  >
                    <option value="all">All Diamond Artisans (બધા કારીગરો)</option>
                    <option value="active_today">Active Artisans Today</option>
                    <option value="gujarati_only">Gujarati Speakers (ગુજરાતી ભાષા)</option>
                    <option value="english_only">English Speakers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Notification Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-cyan-500 ${inputBg}`}
                  >
                    <option value="general">General Broadcast / Announcement</option>
                    <option value="update">App Feature Update</option>
                    <option value="maintenance">Maintenance / Downtime Notice</option>
                  </select>
                </div>
              </div>

              {/* Title Inputs (EN & GU) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Notification Title (English) <span className="text-rose-500">*</span>
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
                  <label className="block text-xs font-semibold mb-1">
                    શીર્ષક (ગુજરાતી શીર્ષક)
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

              {/* Body Textarea (EN & GU) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Message Body (English) <span className="text-rose-500">*</span>
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
                  <label className="block text-xs font-semibold mb-1">
                    સંદેશ (ગુજરાતી મેસેજ)
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

              {/* Send Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Notification</span>
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

            {/* Target Audience Pill */}
            <div className="flex items-center space-x-2 text-xs">
              <span className={`font-semibold ${textMuted}`}>Target Audience:</span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                {getTargetGroupLabel(targetGroup)}
              </span>
            </div>

            {/* Notification Content Preview Box */}
            <div className={`rounded-2xl border p-4 space-y-3.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* English Version */}
              <div>
                <div className="flex items-center space-x-1.5 mb-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">EN</span>
                  <span>English Title & Message:</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${textMuted}`}>{body}</p>
              </div>

              {/* Gujarati Version if present */}
              {(titleGu || bodyGu) && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 mb-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">GU</span>
                    <span>ગુજરાતી શીર્ષક અને સંદેશ (Gujarati):</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{titleGu || title}</p>
                  <p className={`text-xs mt-1 leading-relaxed ${textMuted}`}>{bodyGu || body}</p>
                </div>
              )}
            </div>

            {/* Confirmation Question Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="text-xs font-bold leading-snug">
                  Are you sure you want to send this to user?
                </p>
                <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                  This notification will be delivered immediately to all selected diamond artisans and saved in their in-app inbox.
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
