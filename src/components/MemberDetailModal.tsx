import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Member, GymPartitionData } from '../types';

interface MemberDetailModalProps {
  member: Member;
  partition: GymPartitionData;
  onClose: () => void;
  onRenew: (member: Member) => void;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
  onDeleteMember: (memberId: string) => void;
  onWhatsAppReminder: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  partition,
  onClose,
  onRenew,
  onUpdateMember,
  onDeleteMember,
  onWhatsAppReminder,
}) => {
  const { payments, renewals, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(member.fullName);
  const [phone, setPhone] = useState(member.phone);
  const [email, setEmail] = useState(member.email || '');
  const [address, setAddress] = useState(member.address || '');
  const [notes, setNotes] = useState(member.notes || '');

  // Filter payments and renewals for this member
  const memberPayments = payments.filter((p) => p.memberId === member.id);
  const memberRenewals = renewals.filter((r) => r.memberId === member.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMember(member.id, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsEditing(false);
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
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                member.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{member.fullName}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : member.status === 'Expiring Soon'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : member.status === 'Expires Today'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {member.memberCode} · Joined {member.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Edit details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="close-member-detail-btn"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Edit Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Edit Member Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-600 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg"
                >
                  Save Updates
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Membership Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">
                    Current Plan
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {member.planName}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">
                    Start Date
                  </span>
                  <span className="text-sm font-semibold font-mono text-slate-800 mt-1 block">
                    {member.startDate}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">
                    Expiry Date
                  </span>
                  <span className="text-sm font-semibold font-mono text-slate-900 mt-1 block">
                    {member.expiryDate}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">
                    Total Paid
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
                    {currency}{member.amountPaid.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Contact & Profile Details */}
              <div className="space-y-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 py-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{member.phone}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-3 py-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.gender && (
                  <div className="flex items-center gap-3 py-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Gender: {member.gender}</span>
                    {member.dob && <span className="text-slate-400 font-mono">({member.dob})</span>}
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3 py-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{member.address}</span>
                  </div>
                )}
                {member.notes && (
                  <div className="flex items-start gap-3 py-1 border-t border-slate-100 pt-2 mt-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-xs text-slate-600">{member.notes}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment & Renewal History matching PRD Section 12 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Payment & Renewal Ledger
            </h3>
            {memberPayments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No past payments recorded.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Receipt</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{p.receiptNumber}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{p.date}</td>
                        <td className="py-2 px-3 text-slate-700">{p.planName}</td>
                        <td className="py-2 px-3">{p.paymentMethod}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {currency}{p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
                onDeleteMember(member.id);
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium px-2 py-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Member</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onWhatsAppReminder(member);
              }}
              className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Reminder</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRenew(member);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
