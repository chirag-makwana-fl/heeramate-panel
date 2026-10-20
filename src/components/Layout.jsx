import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Gem, 
  Activity,
  Calendar,
  Sun,
  Moon,
  Menu,
  X,
  Megaphone,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/users', label: 'Artisans & Activity', icon: Users },
    { to: '/notifications', label: 'Broadcast Push', icon: Megaphone },
    { to: '/faqs', label: 'Help & FAQs', icon: HelpCircle },
  ];

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium'
  }).format(new Date());

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`p-5 border-b flex items-center justify-between ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                HeeraMate
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Owner
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Diamond Artisan Platform</p>
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
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className={`px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Monitoring & Management
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
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Card & Logout */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center space-x-2.5 mb-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {admin?.full_name ? admin.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {admin?.full_name || 'App Owner'}
            </p>
            <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {admin?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 border-r shrink-0 flex-col sticky top-0 h-screen ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className={`relative w-72 max-w-[80vw] h-full shadow-2xl flex flex-col z-10 ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className={`h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur border-b transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-slate-100'
            : 'bg-white/80 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
              <Activity className="w-4 h-4 text-cyan-500 animate-pulse shrink-0" />
              <span className="truncate hidden sm:inline">Live User Monitoring & Tracking</span>
              <span className="sm:hidden font-bold text-cyan-600 dark:text-cyan-400">HeeraMate</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Date Badge */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayStr} (IST)</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-semibold ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden lg:inline text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* Status indicator */}
            <div className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="hidden xs:inline">Live</span>
            </div>
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
