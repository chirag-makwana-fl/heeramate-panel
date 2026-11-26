import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Lock, Mail, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 relative transition-colors duration-150 ${
      isDark ? 'bg-[#0a0d14] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'
    }`}>
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-colors flex items-center space-x-1.5 text-xs font-medium ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand header */}
        <div className="mb-6 flex items-center space-x-3">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-900 border-slate-900 text-white'
          }`}>
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-tight">HeeraMate</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Artisan Operations Console
            </p>
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-xl p-6 border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h2 className="text-base font-semibold mb-1">Sign in</h2>
          <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Enter your owner credentials to continue.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-9 pr-3.5 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600 focus:ring-slate-700'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-slate-900/10'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-3.5 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600 focus:ring-slate-700'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-slate-900/10'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {loading ? (
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                  isDark ? 'border-slate-950' : 'border-white'
                }`}></div>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
