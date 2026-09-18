import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import { GymPartitionData, PaymentRecord } from '../types';

interface PaymentsViewProps {
  partition: GymPartitionData;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  partition,
  onViewReceipt,
}) => {
  const { payments, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');

  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.memberName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.planName.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const filteredRevenue = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6" id="payments-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Receipts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete transaction ledger for {gym.name}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Revenue:
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {currency}{totalRevenue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments by member, receipt #, or plan"
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="All">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 text-xs">
                      {pay.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                      {pay.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {pay.memberName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      {pay.planName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {currency}{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(pay)}
                        className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
