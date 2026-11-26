import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Mail, 
  ShieldAlert, 
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Security = () => {
  const { admin } = useAuth();
  const { isDark } = useTheme();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & feedback
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string }

  // Validation checks
  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword && newPassword === confirmPassword;
  const hasCurrent = currentPassword.trim().length > 0;
  const canSubmit = hasCurrent && isMinLength && isMatching && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setFeedback({ success: false, message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setFeedback({
        success: true,
        message: res.data?.message || 'Password updated successfully! Please use your new password on next login.',
      });

      // Clear fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
      setFeedback({ success: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Theming classes
  const cardBg = isDark
    ? 'bg-[#0e131d] border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400';

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Security & Credentials
        </h1>
        <p className={`text-xs mt-0.5 ${textMuted}`}>
          Manage your App Owner access credentials and account password.
        </p>
      </div>

      {/* 12-Column Settings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail (4 Cols): Session Identity & Recommendations */}
        <div className="lg:col-span-4 space-y-5">
          <div className={`rounded-xl border p-5 space-y-4 ${cardBg}`}>
            <h2 className="text-sm font-semibold tracking-tight">Active Session</h2>
            <div className={`divide-y text-xs ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
              <div className="py-2.5 flex items-center justify-between">
                <span className={textMuted}>Admin Name</span>
                <span className="font-medium truncate max-w-[160px]">{admin?.full_name || 'HeeraMate Owner'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className={textMuted}>Login Email</span>
                <span className="font-medium truncate max-w-[160px]">{admin?.email || '—'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className={textMuted}>Role</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  {admin?.role?.toUpperCase() || 'SUPERADMIN'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className={textMuted}>Status</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Verified</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            isDark ? 'bg-[#0e131d] border-slate-800/80 text-slate-300' : 'bg-amber-50/50 border-amber-200/70 text-slate-700'
          }`}>
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-700 dark:text-amber-400">Security Recommendation</p>
              <p className={`leading-relaxed ${textMuted}`}>
                Use a mix of uppercase, lowercase, numbers, and symbols. Never share owner credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Right Stage (8 Cols): Password Form */}
        <div className="lg:col-span-8 space-y-4">
          {feedback && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              feedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-medium">
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button 
                onClick={() => setFeedback(null)} 
                className="text-xs underline hover:opacity-80 ml-4 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Change Password Form Card */}
          <div className={`rounded-xl border p-5 sm:p-6 transition-colors ${cardBg}`}>
            <div className={`flex items-center space-x-2.5 pb-4 border-b mb-5 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <KeyRound className="w-4 h-4 text-slate-400" />
              <div>
                <h2 className="text-sm font-semibold">Change Account Password</h2>
                <p className={`text-xs ${textMuted}`}>
                  Update your login password for the admin console.
                </p>
              </div>
            </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing admin password"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Validation Checklist */}
          {newPassword && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                {isMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={isMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : textMuted}>
                  At least 6 characters in length
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {isMatching ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={isMatching ? 'text-emerald-600 dark:text-emerald-400 font-medium' : textMuted}>
                  New password and confirmation match
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
