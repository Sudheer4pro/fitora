import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { UserAccount } from '../types';
import { storage } from '../lib/storage';

interface AdminCredentialsModalProps {
  adminUser: UserAccount;
  onClose: () => void;
  onUpdated: (updatedAdmin: UserAccount) => void;
}

export const AdminCredentialsModal: React.FC<AdminCredentialsModalProps> = ({
  adminUser,
  onClose,
  onUpdated,
}) => {
  const currentCredentials = storage.getAdminCredentials();
  const [email, setEmail] = useState(adminUser.email);
  const [password, setPassword] = useState(currentCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid admin email address.');
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Admin password must be at least 4 characters long.');
      return;
    }

    const updated = storage.updateAdminCredentials(trimmedEmail, trimmedPassword);
    if (updated) {
      setSuccessNotice('Admin credentials updated successfully!');
      onUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError('Failed to update admin credentials.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      id="admin-credentials-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 relative">
        {/* Top-right X close button */}
        <button
          type="button"
          id="close-admin-credentials-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close modal (Esc)"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <KeyRound className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-950" id="admin-credentials-title">
              Change Admin Credentials
            </h3>
            <p className="text-xs text-slate-500">
              Update the master login email and password used to access the Super Admin Portal.
            </p>
          </div>
        </div>

        {/* Notices */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Admin Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="admin-email-field">
              Admin Login Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="admin-email-field"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used to sign in to the Admin Portal.
            </p>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="admin-password-field">
              New Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-field"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Updating these credentials immediately changes the sign-in requirement on the Admin login screen.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="cancel-admin-credentials-btn"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-admin-credentials-btn"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
