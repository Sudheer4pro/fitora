import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Send,
} from 'lucide-react';
import { Member, GymAccount } from '../types';

interface WhatsAppReminderModalProps {
  member: Member;
  gym: GymAccount;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  member,
  gym,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Formatted date
  const formattedExpiry = new Date(member.expiryDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const isExpired = member.status === 'Expired';

  const defaultMessage = isExpired
    ? `Dear ${member.fullName},\n\nYour gym subscription at *${gym.name}* expired on *${formattedExpiry}*. We miss having you on the workout floor! Renew today to continue your fitness progress and lock in existing member pricing.\n\nReply to this message or visit the front desk.\nContact: ${gym.phone}`
    : `Hi ${member.fullName}! 👋\n\nThis is a friendly reminder from *${gym.name}*. Your *${member.planName}* gym membership is scheduled to expire on *${formattedExpiry}*.\n\nPlease renew at the front desk to ensure uninterrupted workout sessions.\n\nThank you!\n${gym.name} Team (Tel: ${gym.phone})`;

  const [message, setMessage] = useState(defaultMessage);

  const cleanPhone = member.phone.replace(/[^0-9]/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Renewal Notice Reminder</h2>
              <p className="text-xs text-slate-500">
                To {member.fullName} ({member.phone})
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-whatsapp-modal-btn"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>

        {/* Message Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message Content (Editable)
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Status: <strong className="text-slate-800">{member.status}</strong></span>
            <span>Expiry: <strong className="text-slate-800">{formattedExpiry}</strong></span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
