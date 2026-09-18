import React, { useState, useEffect } from 'react';
import {
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  ExternalLink,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import { storage } from '../lib/storage';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onAutoFillPassword?: (password: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onAutoFillPassword,
}) => {
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveredInfo, setRecoveredInfo] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    gymName?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmailInput(defaultEmail);
      setStatus('IDLE');
      setErrorMessage(null);
      setRecoveredInfo(null);
    }
  }, [isOpen, defaultEmail]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('SENDING');

    // 1. Check Admin credentials
    const adminCreds = storage.getAdminCredentials();
    const users = storage.getAllUsers();
    const gyms = storage.getAllGyms();

    let accountName = 'Administrator';
    let accountPassword = '';
    let accountRole = 'Super Admin';
    let accountGymName: string | undefined = undefined;

    if (cleanEmail === adminCreds.email.toLowerCase() || cleanEmail === 'admin@fitora.com') {
      accountName = 'Super Administrator';
      accountPassword = adminCreds.password;
      accountRole = 'Super Admin';
    } else {
      // Check Maintainer / Users
      const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (foundUser) {
        accountName = foundUser.name;
        accountPassword = foundUser.password || 'Fitora';
        accountRole = foundUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gym Maintainer';
        if (foundUser.gymId) {
          const gym = gyms.find((g) => g.id === foundUser.gymId);
          accountGymName = gym?.name;
        }
      } else {
        // Look in first maintainer as fallback or error
        setErrorMessage(`No account found registered with ${cleanEmail}. Please check the email or contact support.`);
        setStatus('ERROR');
        return;
      }
    }

    const info = {
      name: accountName,
      email: cleanEmail,
      password: accountPassword,
      role: accountRole,
      gymName: accountGymName,
    };

    setRecoveredInfo(info);

    // Call recovery email endpoint
    try {
      await fetch('/api/send-password-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: cleanEmail,
          recipientName: accountName,
          password: accountPassword,
          role: accountRole,
          gymName: accountGymName,
          appUrl: window.location.origin,
        }),
      });
    } catch {
      // Non-blocking fetch
    }

    setStatus('SENT');
  };

  const appUrl = window.location.origin;
  const emailSubject = `Your Fitora Login Password & Account Recovery`;
  const emailBody = recoveredInfo
    ? `Hi ${recoveredInfo.name},

You recently requested your password for your Fitora account.

Here are your account login details:
👤 Email: ${recoveredInfo.email}
🔑 Password: ${recoveredInfo.password}
🏷️ Account Type: ${recoveredInfo.role}${recoveredInfo.gymName ? `\n🏢 Gym: ${recoveredInfo.gymName}` : ''}
🔗 Login Portal: ${appUrl}

If you did not request this, you can safely disregard this email or update your password in Settings.

Best regards,
Fitora Security & Support Team`
    : '';

  const gmailUrl = recoveredInfo
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        recoveredInfo.email
      )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : '#';

  const mailtoUrl = recoveredInfo
    ? `mailto:${encodeURIComponent(recoveredInfo.email)}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header - Pinned */}
        <div className="bg-[#0b0f19] p-5 sm:p-6 text-white relative shrink-0">
          <button
            type="button"
            id="forgot-password-modal-top-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer z-10"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="font-semibold">Close</span>
          </button>

          <div className="flex items-center gap-3 pr-20">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Forgot Password?</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                We'll retrieve and email your login password immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {status !== 'SENT' ? (
            <form onSubmit={handleRecover} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter the email address registered with your account (Admin or Maintainer), and we will send your password directly to your inbox.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. maintainer@gym.com or admin@fitora.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'SENDING'}
                className="w-full bg-[#0f172a] hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'SENDING' ? (
                  <span>Searching & Sending...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Password to My Mail</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold text-sm text-emerald-900">Password Dispatched to Email!</p>
                  <p className="text-emerald-800 leading-relaxed">
                    Your password has been successfully sent to <strong className="font-mono text-emerald-950">{recoveredInfo?.email}</strong>.
                  </p>
                </div>
              </div>

              {/* Password Preview Box */}
              {recoveredInfo && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                    <span className="text-slate-500 font-medium">Account User</span>
                    <span className="font-bold text-slate-900">{recoveredInfo.name}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                    <span className="text-slate-500 font-medium">Account Role</span>
                    <span className="font-semibold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                      {recoveredInfo.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      Recovered Password
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-sm">
                      {recoveredInfo.password}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Open In Email Client
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Gmail</span>
                    <ExternalLink className="w-3 h-3 text-white/80" />
                  </a>

                  <a
                    href={mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mail App</span>
                  </a>
                </div>

                {onAutoFillPassword && recoveredInfo && (
                  <button
                    type="button"
                    onClick={() => {
                      onAutoFillPassword(recoveredInfo.password);
                      onClose();
                    }}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Auto-Fill Password & Log In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Pinned */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Fitora Account Security</span>
          </span>
          <button
            type="button"
            id="forgot-password-modal-footer-close-btn"
            onClick={onClose}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-black px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
