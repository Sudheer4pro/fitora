import React, { useEffect } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Building,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PaymentRecord, GymAccount } from '../types';

interface ReceiptModalProps {
  payment: PaymentRecord;
  gym: GymAccount;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  gym,
  onClose,
}) => {
  const currency = gym.currencySymbol || '₹';

  const handlePrint = () => {
    window.print();
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
        {/* Actions bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 text-slate-900 bg-white" id="printable-receipt">
          {/* Gym Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-5">
            <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
              {gym.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{gym.address || 'Fitness & Strength Center'}</p>
            <p className="text-xs text-slate-500 font-mono">Tel: {gym.phone} | Gym ID: {gym.gymId}</p>
          </div>

          {/* Receipt Meta */}
          <div className="flex justify-between text-xs text-slate-600">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Receipt No.</span>
              <span className="font-mono font-bold text-slate-900">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase">Date</span>
              <span className="font-mono font-semibold text-slate-900">{payment.date}</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Member:</span>
              <span className="font-bold text-slate-900">{payment.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Membership Plan:</span>
              <span className="font-semibold text-slate-800">{payment.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-medium text-slate-800">{payment.paymentMethod}</span>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="border-t border-b border-slate-200 py-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-700 uppercase">Total Amount Paid</span>
            <span className="text-2xl font-black font-mono text-slate-950">
              {currency}{payment.amount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment Verified & Authorized</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Thank you for training with {gym.name}! Non-refundable & non-transferable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
