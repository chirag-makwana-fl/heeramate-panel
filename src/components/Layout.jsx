import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Gem, 
  Calendar,
  Sun,
  Moon,
  Menu,
  X,
  Megaphone,
  HelpCircle,
  UserX,
  ShieldCheck,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

const PAGE_TITLES = {
  '/': 'Operations Overview',
  '/users': 'Artisan Directory',
  '/retention': 'Retention & Cohorts',
  '/deleted-accounts': 'Deleted Accounts',
  '/notifications': 'Push Broadcasts',
  '/splash': 'Festival & Splash',
  '/faqs': 'Help & FAQs',
  '/security': 'Security & Access',
};

const Layout = () => {
  const { admin, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [deletedCount, setDeletedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchDeletedCount = async () => {
      try {
        const res = await api.get('/deleted-users/count');
        if (isMounted) {
          setDeletedCount(res.data?.data?.count || 0);
        }
      } catch (_) {}
    };

    fetchDeletedCount();
    const interval = setInterval(fetchDeletedCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/users', label: 'Artisans & Activity', icon: Users },
    { to: '/retention', label: 'Retention & Inactivity', icon: HeartHandshake },
    { to: '/deleted-accounts', label: 'Deleted Accounts', icon: UserX, badge: deletedCount },
    { to: '/notifications', label: 'Broadcast Push', icon: Megaphone },
    { to: '/splash', label: 'Festival & Splash', icon: Sparkles },
    { to: '/faqs', label: 'Help & FAQs', icon: HelpCircle },
    { to: '/security', label: 'Security', icon: ShieldCheck },
  ];

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium'
  }).format(new Date());

  const currentTitle = location.pathname.startsWith('/users/')
    ? 'Artisan Profile'
    : PAGE_TITLES[location.pathname] || 'Operations Console';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`h-14 px-4 border-b flex items-center justify-between shrink-0 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isDark ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'
          }`}>
            <Gem className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <div className="flex items-center space-x-1.5">
              <h1 className={`font-semibold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                HeeraMate
              </h1>
              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                Admin
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Artisan Ledger</p>
          </div>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className={`px-2.5 pb-2 text-[11px] font-medium ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-900 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tabular-nums rounded bg-rose-500/15 text-rose-500">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Card & Logout */}
      <div className={`p-3 border-t ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5 mb-2.5 px-1 overflow-hidden">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs shrink-0 ${
            isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {admin?.full_name ? admin.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className={`text-xs font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {admin?.full_name || 'App Owner'}
            </p>
            <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {admin?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isDark
              ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10'
              : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-150 ${
      isDark ? 'bg-[#0a0d14] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'
    }`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-60 border-r shrink-0 flex-col sticky top-0 h-screen ${
        isDark ? 'bg-[#0e131d] border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`relative w-64 max-w-[80vw] h-full shadow-xl flex flex-col z-10 ${
            isDark ? 'bg-[#0e131d]' : 'bg-white'
          }`}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className={`h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 border-b transition-colors ${
          isDark
            ? 'bg-[#0a0d14]/90 backdrop-blur-md border-slate-800/80 text-slate-100'
            : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <span className="text-sm font-semibold tracking-tight truncate">
              {currentTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Date Badge */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs tabular-nums ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayStr} · IST</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`px-2.5 py-1 rounded-md border transition-colors flex items-center space-x-1.5 text-xs font-medium ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden lg:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
