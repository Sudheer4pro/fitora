import React, { useState, useEffect } from 'react';
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Key,
  Building2,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface InviteDetails {
  maintainerName: string;
  maintainerEmail: string;
  maintainerPhone?: string;
  gymName: string;
  password?: string;
  appUrl?: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invite: InviteDetails | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, invite }) => {
  const [copied, setCopied] = useState(false);
  const [serverSendStatus, setServerSendStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'FAILED'>('IDLE');

  const appUrl = invite?.appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const password = invite?.password || 'Fitora';

  // Auto-attempt backend mail trigger on open
  useEffect(() => {
    if (isOpen && invite) {
      setServerSendStatus('SENDING');
      fetch('/api/send-invite-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintainerName: invite.maintainerName,
          maintainerEmail: invite.maintainerEmail,
          gymName: invite.gymName,
          password: invite.password || 'Fitora',
          appUrl: invite.appUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success) {
            setServerSendStatus('SENT');
          } else {
            setServerSendStatus('FAILED');
          }
        })
        .catch(() => {
          setServerSendStatus('FAILED');
        });
    }
  }, [isOpen, invite?.maintainerEmail, invite?.gymName]);

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

  if (!isOpen || !invite) return null;

  const emailSubject = `Welcome to Fitora - Your Gym Maintainer Login for ${invite.gymName}`;
  const emailBody = `Hi ${invite.maintainerName},

You have been registered as a Gym Maintainer for "${invite.gymName}" on Fitora.

Here are your login credentials to access your isolated gym portal:
🔗 App Portal: ${appUrl}
👤 Login Email: ${invite.maintainerEmail}
🔑 Password: ${password}

Please log in to manage your members, plans, payments, and renewals.

Best regards,
Fitora Administration Team`;

  // Direct Gmail Web Composer URL (opens directly in browser)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    invite.maintainerEmail
  )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Native mail client (mailto:)
  const mailtoUrl = `mailto:${encodeURIComponent(invite.maintainerEmail)}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  // WhatsApp Web / App intent
  const cleanPhone = (invite.maintainerPhone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send?${
    cleanPhone ? `phone=${cleanPhone}&` : ''
  }text=${encodeURIComponent(
    `*Welcome to Fitora!*\n\nHi ${invite.maintainerName}, your Maintainer account for *${invite.gymName}* is ready.\n\n🔗 *Portal Link:* ${appUrl}\n📧 *Email:* ${invite.maintainerEmail}\n🔑 *Password:* ${password}\n\nPlease login to manage your gym.`
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header - Pinned */}
        <div className="bg-[#0b0f19] p-5 sm:p-6 text-white relative shrink-0">
          {/* Prominent High-Visibility Close Button Top Right */}
          <button
            type="button"
            id="invite-modal-top-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/20 hover:bg-white/30 text-white hover:text-white border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer z-10"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="font-semibold">Close</span>
          </button>

          <div className="flex items-center gap-3 pr-20">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">Send Maintainer Invite</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate max-w-[240px] sm:max-w-xs">
                Credentials for <strong className="text-white">{invite.maintainerName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Status notice */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <p className="font-bold">Maintainer Account Provisioned</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Password is set to <strong className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950">Fitora</strong>. Send the invite via Gmail, email app, or WhatsApp below.
              </p>
            </div>
          </div>

          {/* Credentials Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Gym Partition
              </span>
              <span className="font-bold text-slate-900">{invite.gymName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Login Email
              </span>
              <span className="font-mono font-bold text-slate-900">{invite.maintainerEmail}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                Login Password
              </span>
              <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-sm">
                {password}
              </span>
            </div>
          </div>

          {/* Direct Send Action Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Quick Send Options
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Direct Gmail Web composer */}
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold py-3 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send via Gmail Web</span>
                <ExternalLink className="w-3 h-3 text-white/80" />
              </a>

              {/* Native Mail Client */}
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open in Mail App</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* WhatsApp Share */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send on WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-white/80" />
              </a>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Preview */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Message Content
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Fitora Template</span>
            </div>
            <div className="bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
              {emailBody}
            </div>
          </div>
        </div>

        {/* Footer - Pinned */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Password: <strong className="font-mono text-emerald-700 font-bold">{password}</strong></span>
          </span>
          <button
            type="button"
            id="invite-modal-footer-close-btn"
            onClick={onClose}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Window</span>
          </button>
        </div>
      </div>
    </div>
  );
};
