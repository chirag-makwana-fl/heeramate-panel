import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  Image,
  Globe2,
  Film,
  Zap,
  Sliders,
  Check,
  Flame,
  ArrowRight,
  Upload
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

const DIWALI_FULLSCREEN_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .diwali-stage {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 28%, #2e0854 0%, #150229 55%, #080012 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 55px 24px 35px;
      overflow: hidden;
    }
    .sparkle {
      position: absolute;
      border-radius: 50%;
      background: #ffd700;
      box-shadow: 0 0 10px #ffb703, 0 0 20px #ffd700;
      opacity: 0;
      animation: floatSparkle 3s ease-in-out infinite;
    }
    @keyframes floatSparkle {
      0% { opacity: 0; transform: translateY(0) scale(0.5); }
      50% { opacity: 0.9; transform: translateY(-35px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-70px) scale(0.2); }
    }
    .top-lanterns {
      display: flex;
      justify-content: space-around;
      width: 100%;
      max-width: 280px;
    }
    .lantern {
      font-size: 26px;
      animation: swing 3s ease-in-out infinite alternate;
      transform-origin: top center;
    }
    .lantern:nth-child(2) { animation-delay: 0.5s; font-size: 32px; }
    .lantern:nth-child(3) { animation-delay: 1s; }
    @keyframes swing {
      0% { transform: rotate(-8deg); }
      100% { transform: rotate(8deg); }
    }
    .diya-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 15px 0;
    }
    .glow-aura {
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 183, 3, 0.45) 0%, rgba(247, 127, 0, 0.15) 50%, transparent 75%);
      filter: blur(20px);
      animation: pulseAura 2s ease-in-out infinite alternate;
    }
    @keyframes pulseAura {
      0% { transform: scale(0.85); opacity: 0.7; }
      100% { transform: scale(1.15); opacity: 1; }
    }
    .diya-flame {
      width: 26px;
      height: 44px;
      background: linear-gradient(to bottom, #ffffff 0%, #ffea00 30%, #ff5400 70%, #d62828 100%);
      border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%;
      box-shadow: 0 0 25px #ffb703, 0 0 50px #ff7b00;
      animation: flicker 0.15s ease-in-out infinite alternate;
      margin-bottom: -6px;
      z-index: 2;
    }
    @keyframes flicker {
      0% { transform: scale(1) rotate(-1deg); }
      100% { transform: scale(1.06) rotate(1.5deg); }
    }
    .diya-base {
      width: 130px;
      height: 48px;
      background: linear-gradient(135deg, #e76f51 0%, #d62828 45%, #9d0208 100%);
      border-radius: 0 0 100px 100px;
      box-shadow: inset 0 3px 6px rgba(255, 230, 119, 0.7), 0 8px 24px rgba(0, 0, 0, 0.6);
      border-top: 3px solid #ffb703;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .diya-base::after {
      content: '✦  ✦  ✦';
      color: #ffd700;
      font-size: 10px;
      letter-spacing: 5px;
      opacity: 0.8;
    }
    .text-block {
      text-align: center;
      z-index: 5;
    }
    .headline-en {
      font-size: 26px;
      font-weight: 900;
      background: linear-gradient(135deg, #ffffff 0%, #ffd166 50%, #f77f00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
      filter: drop-shadow(0 2px 10px rgba(255, 183, 3, 0.4));
    }
    .headline-gu {
      font-size: 17px;
      font-weight: 700;
      color: #ffe6a7;
      margin-bottom: 6px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
    }
    .sub-wishes {
      font-size: 12px;
      color: #cbd5e1;
      max-width: 260px;
      margin: 0 auto;
      line-height: 1.4;
      opacity: 0.9;
    }
    .brand-emblem {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 215, 0, 0.25);
    }
    .brand-emblem span {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffd700;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="diwali-stage">
    <div class="sparkle" style="top:25%; left:18%; width:5px; height:5px; animation-delay:0.2s;"></div>
    <div class="sparkle" style="top:38%; left:82%; width:6px; height:6px; animation-delay:1.1s;"></div>
    <div class="sparkle" style="top:58%; left:12%; width:4px; height:4px; animation-delay:0.7s;"></div>
    <div class="sparkle" style="top:68%; left:85%; width:6px; height:6px; animation-delay:1.8s;"></div>
    <div class="sparkle" style="top:18%; left:75%; width:5px; height:5px; animation-delay:2.3s;"></div>

    <div class="top-lanterns">
      <div class="lantern">🏮</div>
      <div class="lantern">🪔</div>
      <div class="lantern">🏮</div>
    </div>

    <div class="diya-container">
      <div class="glow-aura"></div>
      <div class="diya-flame"></div>
      <div class="diya-base"></div>
    </div>

    <div class="text-block">
      <h1 class="headline-en">Happy Diwali</h1>
      <p class="headline-gu">શુભ દિપાવલી અને નૂતન વર્ષાભિનંદન</p>
      <p class="sub-wishes">May the festival of lights bring prosperity, wealth & shining success to your life.</p>
    </div>

    <div class="brand-emblem">
      <span>💎 HEERAMATE</span>
    </div>
  </div>
</body>
</html>`;

const FESTIVAL_PRESETS = [
  {
    key: 'christmas',
    label: '🎄 Christmas Special (25 Dec)',
    title: 'Christmas Celebration 2026',
    defaultType: 'lottie',
    defaultUrl: 'https://assets9.lottiefiles.com/packages/lf20_tiv1es20.json',
    bgColor: '#0B1329',
    greeting_en: 'Merry Christmas & Happy Holidays! 🎄',
    greeting_gu: 'નાતાલ અને તહેવારોની હાર્દિક શુભકામનાઓ! 🎄',
    duration: 3,
    startDate: '2026-12-20T00:00',
    endDate: '2026-12-26T23:59'
  },
  {
    key: 'new_year',
    label: '🎆 New Year 2027 (1 Jan)',
    title: 'Happy New Year 2027 Celebration',
    defaultType: 'lottie',
    defaultUrl: 'https://assets2.lottiefiles.com/packages/lf20_1LhV2w.json',
    bgColor: '#0A0E1A',
    greeting_en: 'Wishing You a Prosperous New Year 2027! ✨',
    greeting_gu: 'નવા વર્ષ ૨૦૨૭ ની હાર્દિક શુભકામનાઓ! ✨',
    duration: 3,
    startDate: '2026-12-31T00:00',
    endDate: '2027-01-02T23:59'
  },
  {
    key: 'uttarayan',
    label: '🪁 Uttarayan / Makar Sankranti (14 Jan)',
    title: 'Uttarayan Kite Festival',
    defaultType: 'html_raw',
    defaultUrl: '',
    html_sample: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:white;text-align:center;background:radial-gradient(circle, #0284c7 0%, #0369a1 100%);padding:20px;">
  <div style="font-size:70px;animation:float 2s ease-in-out infinite;">🪁</div>
  <h1 style="font-size:26px;margin:15px 0 5px;font-weight:bold;">Kai Po Che!</h1>
  <p style="font-size:14px;opacity:0.9;">Wishing you soaring heights this Uttarayan</p>
  <style>@keyframes float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-20px) rotate(10deg); } }</style>
</div>`,
    bgColor: '#0284C7',
    greeting_en: 'Happy Makar Sankranti & Uttarayan! 🪁',
    greeting_gu: 'ઉત્તરાયણ અને મકરસંક્રાંતિની હાર્દિક શુભેચ્છાઓ! 🪁',
    duration: 3,
    startDate: '2027-01-13T00:00',
    endDate: '2027-01-15T23:59'
  },
  {
    key: 'republic_day',
    label: '🇮🇳 Republic Day (26 Jan)',
    title: 'Republic Day Celebration',
    defaultType: 'lottie',
    defaultUrl: 'https://assets10.lottiefiles.com/packages/lf20_9cz0qpmc.json',
    bgColor: '#0F172A',
    greeting_en: 'Happy Republic Day! Proud to Build for Artisans 🇮🇳',
    greeting_gu: 'પ્રજાસત્તાક દિનની હાર્દિક શુભકામનાઓ! 🇮🇳',
    duration: 3,
    startDate: '2027-01-25T00:00',
    endDate: '2027-01-26T23:59'
  },
  {
    key: 'diwali',
    label: '🪔 Diwali (Full Screen HTML)',
    title: 'Happy Diwali & Saal Mubarak Celebration',
    defaultType: 'html_raw',
    defaultUrl: '',
    html_sample: DIWALI_FULLSCREEN_HTML,
    is_full_screen: true,
    bgColor: '#080012',
    greeting_en: 'Happy Diwali & Prosperous New Year! 🪔',
    greeting_gu: 'દિવાળી અને સાલમુબારકની હાર્દિક શુભકામનાઓ! 🪔',
    duration: 4,
    startDate: '2026-11-08T00:00',
    endDate: '2026-11-13T23:59'
  }
];

const SAMPLE_HTML_SNIPPET = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:system-ui,-apple-system,sans-serif;color:white;text-align:center;background:radial-gradient(circle at top, #1e293b, #0f172a);padding:24px;box-sizing:border-box;">
  <div style="font-size:64px;filter:drop-shadow(0 0 20px #38bdf8);animation:pulse 2s infinite;">💎</div>
  <h2 style="font-size:24px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;">HeeraMate Festive</h2>
  <p style="font-size:13px;color:#94a3b8;line-height:1.5;">Empowering Diamond Artisans Everyday</p>
  <style>
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  </style>
</div>`;

const SplashManager = () => {
  const { isDark } = useTheme();

  // Splashes State
  const [splashes, setSplashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected for Phone Simulator
  const [previewSplash, setPreviewSplash] = useState(null);
  const [previewLang, setPreviewLang] = useState('en'); // 'en' | 'gu'
  const [simulatorPlaying, setSimulatorPlaying] = useState(false);
  const [simulatorCountdown, setSimulatorCountdown] = useState(0);

  // Modal State (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formKey, setFormKey] = useState('christmas');
  const [formContentType, setFormContentType] = useState('lottie'); // 'lottie' | 'html_url' | 'html_raw' | 'image'
  const [formContentUrl, setFormContentUrl] = useState('');
  const [formHtmlContent, setFormHtmlContent] = useState('');
  const [formBgColor, setFormBgColor] = useState('#0F172A');
  const [formGreetingEn, setFormGreetingEn] = useState('');
  const [formGreetingGu, setFormGreetingGu] = useState('');
  const [formDuration, setFormDuration] = useState(3);
  const [formAllowSkip, setFormAllowSkip] = useState(true);
  const [formClickUrl, setFormClickUrl] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formPriority, setFormPriority] = useState(10);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFullScreen, setFormIsFullScreen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Handle local file selection (Lottie .json, image .png/.jpg/.gif)
  const handleLocalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLottie = formContentType === 'lottie';
    const isImage = formContentType === 'image';

    if (isLottie) {
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        alert('Please select a valid .json Lottie animation file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          JSON.parse(content); // syntax validation
          // Convert to data URI for direct standalone embedding
          const dataUri = `data:application/json;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(content)))}`;
          setFormContentUrl(dataUri);
          setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        } catch (err) {
          alert('Invalid JSON file format: ' + err.message);
        }
      };
      reader.readAsText(file);
    } else if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormContentUrl(event.target.result);
        setUploadedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Theme Helpers
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const inputBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

  // 1. Fetch all splash campaigns
  const fetchSplashes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/splash-screens');
      if (res.data?.success) {
        const list = res.data.data.splashes || [];
        setSplashes(list);

        // Select first or currently active splash for simulator if none selected
        if (!previewSplash && list.length > 0) {
          const activeOne = list.find(s => s.schedule_status === 'active') || list[0];
          setPreviewSplash(activeOne);
        }
      }
    } catch (err) {
      console.error('fetchSplashes error:', err);
      setError(err.response?.data?.message || 'Failed to load splash campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplashes();
  }, []);

  // Simulator playback effect
  const countdownTimerRef = useRef(null);
  const playSimulator = () => {
    if (!previewSplash) return;
    const dur = previewSplash.display_duration_seconds || 3;
    setSimulatorPlaying(true);
    setSimulatorCountdown(dur);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setSimulatorCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setSimulatorPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Toggle active switch
  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/splash-screens/${id}/toggle`);
      if (res.data?.success) {
        setSplashes(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
        if (previewSplash && previewSplash.id === id) {
          setPreviewSplash(prev => ({ ...prev, is_active: !prev.is_active }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle splash screen');
    }
  };

  // Delete splash
  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete splash campaign "${title}"?`)) return;
    try {
      const res = await api.delete(`/splash-screens/${id}`);
      if (res.data?.success) {
        setSplashes(prev => prev.filter(s => s.id !== id));
        if (previewSplash && previewSplash.id === id) {
          setPreviewSplash(splashes.find(s => s.id !== id) || null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete splash screen');
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormKey('christmas');
    setFormContentType('lottie');
    setFormContentUrl('https://assets9.lottiefiles.com/packages/lf20_tiv1es20.json');
    setFormHtmlContent(SAMPLE_HTML_SNIPPET);
    setFormBgColor('#0B1329');
    setFormGreetingEn('Merry Christmas & Happy Holidays! 🎄');
    setFormGreetingGu('નાતાલ અને તહેવારોની હાર્દિક શુભકામનાઓ! 🎄');
    setFormDuration(3);
    setFormAllowSkip(true);
    setFormClickUrl('');
    setFormStartDate('2026-12-20T00:00');
    setFormEndDate('2026-12-26T23:59');
    setFormPriority(10);
    setFormIsActive(true);
    setFormIsFullScreen(false);
    setUploadedFileName('');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (splash, e) => {
    e.stopPropagation();
    setEditingId(splash.id);
    setFormTitle(splash.title);
    setFormKey(splash.festival_key || 'custom');
    setFormContentType(splash.content_type || 'lottie');
    setFormContentUrl(splash.content_url || '');
    setFormHtmlContent(splash.html_content || SAMPLE_HTML_SNIPPET);
    setFormBgColor(splash.background_color || '#0F172A');
    setFormGreetingEn(splash.greeting_en || '');
    setFormGreetingGu(splash.greeting_gu || '');
    setFormDuration(splash.display_duration_seconds || 3);
    setFormAllowSkip(splash.allow_skip !== false);
    setFormClickUrl(splash.click_action_url || '');

    // Format for datetime-local input
    const fmt = (d) => {
      if (!d) return '';
      const date = new Date(d);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormStartDate(fmt(splash.start_date));
    setFormEndDate(fmt(splash.end_date));
    setFormPriority(splash.priority || 1);
    setFormIsActive(splash.is_active !== false);
    setFormIsFullScreen(!!splash.is_full_screen);
    setUploadedFileName('');
    setShowModal(true);
  };

  // Apply a preset
  const handleApplyPreset = (preset) => {
    setFormKey(preset.key);
    setFormTitle(preset.title);
    setFormContentType(preset.defaultType);
    setFormContentUrl(preset.defaultUrl || '');
    if (preset.html_sample) setFormHtmlContent(preset.html_sample);
    setFormBgColor(preset.bgColor);
    setFormGreetingEn(preset.greeting_en);
    setFormGreetingGu(preset.greeting_gu);
    setFormDuration(preset.duration);
    setFormStartDate(preset.startDate);
    setFormEndDate(preset.endDate);
    setFormIsFullScreen(!!preset.is_full_screen);
    setUploadedFileName('');
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle || !formStartDate || !formEndDate) {
      alert('Please fill in required fields: Title, Start Date, End Date');
      return;
    }

    if (formContentType === 'html_raw' && !formHtmlContent.trim()) {
      alert('Please provide HTML/CSS code');
      return;
    }

    if (formContentType !== 'html_raw' && !formContentUrl.trim()) {
      alert('Please provide Content URL (Lottie, HTML page, or Image)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        festival_key: formKey,
        content_type: formContentType,
        content_url: formContentType === 'html_raw' ? null : formContentUrl,
        html_content: formContentType === 'html_raw' ? formHtmlContent : null,
        background_color: formBgColor,
        greeting_en: formGreetingEn,
        greeting_gu: formGreetingGu,
        display_duration_seconds: parseInt(formDuration) || 3,
        allow_skip: formAllowSkip,
        click_action_url: formClickUrl || null,
        start_date: new Date(formStartDate).toISOString(),
        end_date: new Date(formEndDate).toISOString(),
        priority: !isNaN(parseInt(formPriority)) ? parseInt(formPriority) : 0,
        is_active: formIsActive,
        is_full_screen: formIsFullScreen
      };

      if (editingId) {
        const res = await api.put(`/splash-screens/${editingId}`, payload);
        if (res.data?.success) {
          setSplashes(prev => prev.map(s => s.id === editingId ? res.data.data.splash : s));
          setPreviewSplash(res.data.data.splash);
          setShowModal(false);
        }
      } else {
        const res = await api.post('/splash-screens', payload);
        if (res.data?.success) {
          setSplashes(prev => [res.data.data.splash, ...prev]);
          setPreviewSplash(res.data.data.splash);
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('handleSave error:', err);
      const msg = err.response?.data?.message || err.response?.statusText || err.message || (err.response?.status === 404 ? 'Backend route not found (404). Please ensure the backend is running and updated.' : 'Failed to save splash screen');
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // Format dates for display
  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const opts = { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' };
    return `${s.toLocaleDateString('en-IN', opts)} - ${e.toLocaleDateString('en-IN', opts)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className={`p-6 rounded-3xl border ${cardBg} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${headingColor}`}>
                  Festival & Dynamic Splash Engine
                </h1>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  Schedule live festival animations (Lottie, HTML5 pages, or banners) for HeeraMate artisans.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={fetchSplashes}
              disabled={loading}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white flex items-center space-x-1.5 shadow-sm transition-all shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Festival Splash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Campaigns List (Left) + Live Phone Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Campaigns List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold uppercase tracking-wider ${headingColor} flex items-center space-x-2`}>
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>Scheduled Festival Themes ({splashes.length})</span>
            </h2>
            <span className={`text-xs ${textMuted}`}>Click card to preview live</span>
          </div>

          {loading ? (
            <div className={`p-12 rounded-3xl border ${cardBg} text-center space-y-3`}>
              <RotateCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto" />
              <p className={`text-xs ${textMuted}`}>Loading splash themes...</p>
            </div>
          ) : splashes.length === 0 ? (
            <div className={`p-12 rounded-3xl border ${cardBg} text-center space-y-4`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${headingColor}`}>No Festival Splash Themes</h3>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Create your first theme (e.g. Christmas, New Year, or Uttarayan) to surprise artisans.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-white inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Festive Theme</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {splashes.map((splash) => {
                const isSelected = previewSplash?.id === splash.id;
                const status = splash.schedule_status; // 'active' | 'upcoming' | 'past' | 'disabled'

                return (
                  <div
                    key={splash.id}
                    onClick={() => {
                      setPreviewSplash(splash);
                      setSimulatorPlaying(false);
                    }}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                        : `${cardBg} hover:border-slate-300 dark:hover:border-slate-700`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Status & Format Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          {/* Schedule Status Badge */}
                          {status === 'active' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>LIVE NOW</span>
                            </span>
                          )}
                          {status === 'upcoming' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              UPCOMING
                            </span>
                          )}
                          {status === 'past' && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              PAST / EXPIRED
                            </span>
                          )}
                          {status === 'disabled' && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              DISABLED
                            </span>
                          )}

                          {/* Content Format Badge */}
                          {splash.is_full_screen && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                              FULL SCREEN
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md uppercase border ${
                            splash.content_type === 'lottie'
                              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                              : splash.content_type === 'html_raw'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : splash.content_type === 'html_url'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                              : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'
                          }`}>
                            {splash.content_type === 'html_raw' ? 'HTML CODE' : splash.content_type}
                          </span>

                          <span className={`text-[11px] ${textMuted}`}>
                            Priority: {splash.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-base font-bold truncate ${headingColor}`}>
                          {splash.title}
                        </h3>

                        {/* Schedule & Duration */}
                        <div className={`text-xs flex items-center space-x-3 ${textMuted}`}>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDateRange(splash.start_date, splash.end_date)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{splash.display_duration_seconds}s duration</span>
                          </span>
                        </div>

                        {/* Bilingual Greetings Preview */}
                        <div className="pt-1.5 space-y-0.5">
                          {splash.greeting_en && (
                            <p className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              🇬🇧 {splash.greeting_en}
                            </p>
                          )}
                          {splash.greeting_gu && (
                            <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              🇮🇳 {splash.greeting_gu}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex flex-col items-end space-y-3">
                        {/* Active toggle */}
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="relative inline-flex items-center cursor-pointer"
                          title={splash.is_active ? 'Disable theme' : 'Enable theme'}
                        >
                          <input
                            type="checkbox"
                            checked={splash.is_active}
                            onChange={(e) => handleToggle(splash.id, e)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => handleOpenEdit(splash, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            title="Edit campaign"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(splash.id, splash.title, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Phone Simulator (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold uppercase tracking-wider ${headingColor} flex items-center space-x-2`}>
              <Smartphone className="w-4 h-4 text-cyan-500" />
              <span>Live Phone Simulator</span>
            </h2>

            {/* Language toggle for preview */}
            <div className={`p-0.5 rounded-xl border flex items-center text-[11px] font-bold ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setPreviewLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  previewLang === 'en' ? 'bg-cyan-500 text-white' : textMuted
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setPreviewLang('gu')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  previewLang === 'gu' ? 'bg-cyan-500 text-white' : textMuted
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>

          {/* Realistic Phone Mockup */}
          <div className="mx-auto w-full max-w-[340px] bg-slate-950 p-3 rounded-[48px] shadow-2xl border-4 border-slate-800/80 ring-1 ring-slate-700/50">
            {/* Phone Screen Outer */}
            <div
              className="relative w-full h-[580px] rounded-[38px] overflow-hidden flex flex-col justify-between select-none"
              style={{ backgroundColor: previewSplash?.background_color || '#0B1329' }}
            >
              {/* Dynamic Island / Top Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              </div>

              {/* Top Controls: Skip Button & Countdown */}
              <div className="relative z-20 pt-8 px-4 flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-white/80 backdrop-blur-md">
                  {simulatorPlaying ? `${simulatorCountdown}s` : `${previewSplash?.display_duration_seconds || 3}s`}
                </span>

                {previewSplash?.allow_skip && (
                  <button className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all">
                    Skip →
                  </button>
                )}
              </div>

              {/* Dynamic Content Renderer */}
              {previewSplash?.is_full_screen ? (
                /* FULL SCREEN EDGE-TO-EDGE MODE */
                <div className="absolute inset-0 w-full h-full z-10 overflow-hidden">
                  {previewSplash.content_type === 'html_raw' ? (
                    <iframe
                      key={`${previewSplash.id}-${simulatorPlaying}`}
                      title="Full Screen HTML"
                      srcDoc={previewSplash.html_content || DIWALI_FULLSCREEN_HTML}
                      className="w-full h-full border-0 pointer-events-none"
                    />
                  ) : previewSplash.content_type === 'html_url' ? (
                    <iframe
                      key={`${previewSplash.id}-${previewSplash.content_url}`}
                      title="Full Screen Web URL"
                      src={previewSplash.content_url}
                      className="w-full h-full border-0 pointer-events-none"
                    />
                  ) : previewSplash.content_type === 'lottie' ? (
                    <iframe
                      key={`${previewSplash.id}-${previewSplash.content_url?.slice(0, 50)}-${simulatorPlaying}`}
                      title="Full Screen Lottie"
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                            <style>
                              body { margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; overflow: hidden; }
                              lottie-player { width: 100%; height: 100%; }
                            </style>
                          </head>
                          <body>
                            <lottie-player id="lottieStage" background="transparent" speed="1" loop autoplay></lottie-player>
                            <script>
                              try {
                                const raw = ${JSON.stringify(previewSplash.content_url || '')};
                                const player = document.getElementById('lottieStage');
                                if (raw.startsWith('data:application/json')) {
                                  const b64 = raw.split(',')[1];
                                  const jsonStr = decodeURIComponent(escape(atob(b64)));
                                  player.load(JSON.parse(jsonStr));
                                } else if (raw) {
                                  player.load(raw);
                                }
                              } catch (e) {
                                console.error('Lottie error:', e);
                              }
                            </script>
                          </body>
                        </html>
                      `}
                      className="w-full h-full border-0 bg-transparent pointer-events-none"
                    />
                  ) : (
                    <img
                      src={previewSplash.content_url}
                      alt={previewSplash.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                /* STANDARD BRANDED CARD MODE */
                <>
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
                    {!previewSplash ? (
                      <div className="text-center text-white/60 space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto text-cyan-400 animate-pulse" />
                        <p className="text-xs font-semibold">Select a splash theme to preview</p>
                      </div>
                    ) : previewSplash.content_type === 'lottie' ? (
                      <iframe
                        key={`${previewSplash.id}-${previewSplash.content_url?.slice(0, 50)}-${simulatorPlaying}`}
                        title="Lottie Player"
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                              <style>
                                body { margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                                lottie-player { width: 100%; max-width: 260px; height: 260px; }
                              </style>
                            </head>
                            <body>
                              <lottie-player id="lottieCard" background="transparent" speed="1" loop autoplay></lottie-player>
                              <script>
                                try {
                                  const raw = ${JSON.stringify(previewSplash.content_url || '')};
                                  const player = document.getElementById('lottieCard');
                                  if (raw.startsWith('data:application/json')) {
                                    const b64 = raw.split(',')[1];
                                    const jsonStr = decodeURIComponent(escape(atob(b64)));
                                    player.load(JSON.parse(jsonStr));
                                  } else if (raw) {
                                    player.load(raw);
                                  }
                                } catch (e) {
                                  console.error('Lottie error:', e);
                                }
                              </script>
                            </body>
                          </html>
                        `}
                        className="w-full h-72 border-0 bg-transparent pointer-events-none"
                      />
                    ) : previewSplash.content_type === 'html_raw' ? (
                      <iframe
                        key={`${previewSplash.id}-${simulatorPlaying}`}
                        title="HTML Splash Sandbox"
                        srcDoc={previewSplash.html_content || SAMPLE_HTML_SNIPPET}
                        className="w-full h-80 rounded-2xl border-0 overflow-hidden"
                      />
                    ) : previewSplash.content_type === 'html_url' ? (
                      <iframe
                        key={`${previewSplash.id}-${previewSplash.content_url}`}
                        title="HTML Page URL"
                        src={previewSplash.content_url}
                        className="w-full h-80 rounded-2xl border-0 overflow-hidden"
                      />
                    ) : (
                      <img
                        src={previewSplash.content_url}
                        alt={previewSplash.title}
                        className="max-h-72 object-contain rounded-2xl shadow-lg"
                      />
                    )}
                  </div>

                  {/* Bottom Festive Greeting & Brand Footer */}
                  <div className="relative z-20 pb-8 px-6 text-center space-y-2">
                    {previewSplash && (
                      <div className="space-y-1 animate-in fade-in">
                        <p className="text-sm font-black text-white drop-shadow-md tracking-tight leading-snug">
                          {previewLang === 'gu'
                            ? previewSplash.greeting_gu || previewSplash.greeting_en
                            : previewSplash.greeting_en || previewSplash.greeting_gu}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-1.5 opacity-60 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white">HeeraMate</span>
                    </div>
                  </div>
                </>
              )}

              {/* iPhone Home Indicator */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-30"></div>
            </div>
          </div>

          {/* Test Replay Button */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={playSimulator}
              disabled={!previewSplash || simulatorPlaying}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white flex items-center space-x-2 shadow-md shadow-cyan-500/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulatorPlaying ? `Playing (${simulatorCountdown}s)...` : 'Simulate Cold Start'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 space-y-5 ${cardBg} max-h-[92vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-bold ${headingColor}`}>
                    {editingId ? 'Edit Festival Splash Screen' : 'New Dynamic Festival Splash'}
                  </h2>
                  <p className={`text-xs ${textMuted}`}>
                    Configure festive graphics, duration, and bilingual greetings for artisans
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            {!editingId && (
              <div className="space-y-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
                  Quick Festival Presets (Click to autofill):
                </span>
                <div className="flex flex-wrap gap-2">
                  {FESTIVAL_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        formKey === preset.key
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                          : isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Title & Festival Key */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    Campaign Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Christmas Celebration 2026"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>Festival Key</label>
                  <input
                    type="text"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="e.g. christmas, new_year"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>
              </div>

              {/* Display Layout Mode Selector */}
              <div>
                <label className={`block font-semibold mb-1.5 ${textMuted}`}>
                  Display Layout Mode <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormIsFullScreen(false)}
                    className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                      !formIsFullScreen
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 shrink-0 mt-0.5 text-cyan-500" />
                    <div>
                      <p className="text-xs font-bold">Standard Branded</p>
                      <p className={`text-[10px] mt-0.5 ${textMuted}`}>Center graphic with HeeraMate logo & greeting below</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormIsFullScreen(true)}
                    className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                      formIsFullScreen
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Sliders className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold">📱 Full Screen Immersive</p>
                      <p className={`text-[10px] mt-0.5 ${textMuted}`}>100% edge-to-edge canvas filling the entire screen</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Content Type Selector */}
              <div>
                <label className={`block font-semibold mb-1.5 ${textMuted}`}>
                  Splash Content Format <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'lottie', label: 'Lottie Animation', icon: Film, sub: '.json vector animation' },
                    { id: 'html_url', label: 'HTML Web Page', icon: Globe2, sub: 'Remote webpage URL' },
                    { id: 'html_raw', label: 'Raw HTML/CSS', icon: Code2, sub: 'Inline custom code' },
                    { id: 'image', label: 'Poster / GIF', icon: Image, sub: 'Static image or gif' }
                  ].map(t => {
                    const Icon = t.icon;
                    const isSel = formContentType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormContentType(t.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSel
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold ring-2 ring-cyan-500/20'
                            : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-2 ${isSel ? 'text-cyan-500' : textMuted}`} />
                        <div>
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className={`text-[10px] ${textMuted}`}>{t.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Content Input depending on content_type */}
              {formContentType === 'html_raw' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block font-semibold ${textMuted}`}>
                      HTML5 / CSS / Canvas Code <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormHtmlContent(SAMPLE_HTML_SNIPPET)}
                      className="text-[11px] text-cyan-500 hover:underline"
                    >
                      Load Sample Snippet
                    </button>
                  </div>
                  <textarea
                    rows="6"
                    required
                    value={formHtmlContent}
                    onChange={(e) => setFormHtmlContent(e.target.value)}
                    placeholder="<div>...</div><style>...</style>"
                    className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                  <p className={`text-[11px] mt-1 ${textMuted}`}>
                    Rendered inside React Native WebView component. Supports CSS animations, Canvas, and SVG.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`block font-semibold ${textMuted}`}>
                      {formContentType === 'lottie'
                        ? 'Lottie JSON Animation *'
                        : formContentType === 'html_url'
                        ? 'Webpage URL (https://...) *'
                        : 'Image / GIF Asset *'}
                    </label>
                  </div>

                  {/* Local File Browser (For Lottie .json and Images/GIFs) */}
                  {(formContentType === 'lottie' || formContentType === 'image') && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/5">
                      <label className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white text-xs font-bold cursor-pointer transition-all shadow-sm shrink-0">
                        <Upload className="w-4 h-4" />
                        <span>Upload Local {formContentType === 'lottie' ? '.json File' : 'Image'}</span>
                        <input
                          type="file"
                          accept={formContentType === 'lottie' ? '.json,application/json' : 'image/*'}
                          onChange={handleLocalFileUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="text-xs truncate">
                        {uploadedFileName ? (
                          <span className="text-emerald-500 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 inline shrink-0" />
                            <span className="truncate">Loaded: {uploadedFileName}</span>
                          </span>
                        ) : (
                          <span className={textMuted}>
                            Select a local file from your computer OR enter a hosted URL below
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      required
                      value={formContentUrl}
                      onChange={(e) => {
                        setFormContentUrl(e.target.value);
                        setUploadedFileName('');
                      }}
                      placeholder={
                        formContentType === 'lottie'
                          ? 'https://assets9.lottiefiles.com/... or upload local .json above'
                          : 'https://...'
                      }
                      className={`w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                    />
                  </div>
                </div>
              )}

              {/* Background Color & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>Splash Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formBgColor}
                      onChange={(e) => setFormBgColor(e.target.value)}
                      className="w-10 h-9 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formBgColor}
                      onChange={(e) => setFormBgColor(e.target.value)}
                      placeholder="#0F172A"
                      className={`flex-1 px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    Display Duration ({formDuration} seconds)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full mt-2 accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2s (Fast)</span>
                    <span>3s (Standard)</span>
                    <span>5s</span>
                    <span>8s (Long)</span>
                  </div>
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    Start Date & Time (IST) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    End Date & Time (IST) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>
              </div>

              {/* Bilingual Greetings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    English Greeting (Optional)
                  </label>
                  <input
                    type="text"
                    value={formGreetingEn}
                    onChange={(e) => setFormGreetingEn(e.target.value)}
                    placeholder="Merry Christmas & Happy Holidays! 🎄"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${textMuted}`}>
                    ગુજરાતી શુભેચ્છા (Gujarati Greeting)
                  </label>
                  <input
                    type="text"
                    value={formGreetingGu}
                    onChange={(e) => setFormGreetingGu(e.target.value)}
                    placeholder="નાતાલની હાર્દિક શુભકામનાઓ! 🎄"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${inputBg}`}
                  />
                </div>
              </div>

              {/* Additional Options: Allow Skip & Active */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAllowSkip}
                    onChange={(e) => setFormAllowSkip(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-400"
                  />
                  <span className={`font-semibold ${headingColor}`}>Allow user to Skip</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-400"
                  />
                  <span className={`font-semibold ${headingColor}`}>Active & Published</span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white flex items-center space-x-2 shadow-sm transition-all"
                >
                  {saving ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Saving Theme...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingId ? 'Update Theme' : 'Publish Festive Theme'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashManager;
