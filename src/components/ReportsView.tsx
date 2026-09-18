import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
  IndianRupee,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Clock,
  Sparkles,
  Wallet,
  Activity,
  Award,
  ChevronRight,
  DollarSign,
  Layers,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { GymPartitionData, PaymentRecord, Member } from '../types';

interface ReportsViewProps {
  partition: GymPartitionData;
}

type DateRangeFilter = 'all' | 'this_month' | 'last_30_days' | 'this_year';

export const ReportsView: React.FC<ReportsViewProps> = ({ partition }) => {
  const { members, payments, renewals, plans, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'financial' | 'memberships' | 'plans'>('financial');
  
  // Selected month filter for trajectory: 'all_months' or particular 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>('all_months');

  // Filter payments by selected date range
  const filteredPayments = useMemo(() => {
    const now = new Date('2026-09-17T12:12:17'); // current platform reference
    if (dateFilter === 'this_month') {
      const currentYearMonth = '2026-09';
      return payments.filter((p) => p.date && p.date.startsWith(currentYearMonth));
    }
    if (dateFilter === 'last_30_days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return payments.filter((p) => new Date(p.date) >= thirtyDaysAgo);
    }
    if (dateFilter === 'this_year') {
      return payments.filter((p) => p.date && p.date.startsWith('2026'));
    }
    return payments;
  }, [payments, dateFilter]);

  // Member metrics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const expiringMembers = members.filter(
    (m) => m.status === 'Expiring Soon' || m.status === 'Expires Today'
  ).length;
  const expiredMembers = members.filter((m) => m.status === 'Expired').length;

  const activeRate = totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const churnOrExpiredRate = totalMembers ? Math.round((expiredMembers / totalMembers) * 100) : 0;

  // Financial metrics
  const totalRevenue = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const averageTicket = filteredPayments.length
    ? Math.round(totalRevenue / filteredPayments.length)
    : 0;
  const renewalRevenue = renewals.reduce((acc, r) => acc + (r.amount || 0), 0);

  // Revenue by payment method
  const revenueByMethod = useMemo(() => {
    const acc: { [key: string]: { count: number; amount: number } } = {};
    filteredPayments.forEach((p) => {
      const method = p.paymentMethod || 'Other';
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += p.amount;
    });
    return acc;
  }, [filteredPayments]);

  // Revenue by Plan Popularity & Performance
  const planPerformance = useMemo(() => {
    const planCounts: { [key: string]: { planName: string; membersCount: number; estimatedValue: number } } = {};
    
    // Seed with existing gym plans
    plans.forEach((pl) => {
      planCounts[pl.id] = {
        planName: pl.name,
        membersCount: 0,
        estimatedValue: pl.price,
      };
    });

    members.forEach((m) => {
      if (m.planId && planCounts[m.planId]) {
        planCounts[m.planId].membersCount += 1;
      } else {
        // Fallback for custom or archived plan names
        const key = m.planName || 'Standard Plan';
        if (!planCounts[key]) {
          planCounts[key] = { planName: key, membersCount: 1, estimatedValue: m.amountPaid || 0 };
        } else {
          planCounts[key].membersCount += 1;
        }
      }
    });

    return Object.values(planCounts).sort((a, b) => b.membersCount - a.membersCount);
  }, [plans, members]);

  // Monthly Trajectory Data with past months
  const allPastMonths = [
    { label: 'Apr 2026', prefix: '2026-04' },
    { label: 'May 2026', prefix: '2026-05' },
    { label: 'Jun 2026', prefix: '2026-06' },
    { label: 'Jul 2026', prefix: '2026-07' },
    { label: 'Aug 2026', prefix: '2026-08' },
    { label: 'Sep 2026', prefix: '2026-09' },
  ];

  const monthlyTrajectoryData = useMemo(() => {
    const mapped = allPastMonths.map((m) => {
      const monthPayments = payments.filter((p) => p.date && p.date.startsWith(m.prefix));
      const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const newRegistrations = members.filter((mem) => mem.startDate && mem.startDate.startsWith(m.prefix)).length;
      return {
        label: m.label,
        prefix: m.prefix,
        shortLabel: m.label.split(' ')[0],
        revenue: total,
        transactions: monthPayments.length,
        newMembers: newRegistrations,
      };
    });

    const maxRev = Math.max(...mapped.map((d) => d.revenue), 1);
    const maxMembers = Math.max(...mapped.map((d) => d.newMembers), 1);

    const selectedItem = selectedMonth !== 'all_months'
      ? mapped.find((d) => d.prefix === selectedMonth) || null
      : null;

    return { data: mapped, maxRev, maxMembers, selectedItem };
  }, [payments, members, selectedMonth]);

  // Gender Demographics
  const genderBreakdown = useMemo(() => {
    const counts = { Male: 0, Female: 0, Other: 0, Unspecified: 0 };
    members.forEach((m) => {
      if (m.gender === 'Male') counts.Male += 1;
      else if (m.gender === 'Female') counts.Female += 1;
      else if (m.gender === 'Other') counts.Other += 1;
      else counts.Unspecified += 1;
    });
    return counts;
  }, [members]);

  // Export CSV Handlers
  const exportMembersCSV = () => {
    const headers = [
      'Member ID',
      'Name',
      'Phone',
      'Email',
      'Gender',
      'Plan',
      'Start Date',
      'Expiry Date',
      'Status',
      'Amount Paid',
    ];
    const rows = members.map((m) => [
      m.memberCode,
      `"${m.fullName.replace(/"/g, '""')}"`,
      m.phone,
      m.email || '',
      m.gender || 'Not specified',
      `"${m.planName.replace(/"/g, '""')}"`,
      m.startDate,
      m.expiryDate,
      m.status,
      m.amountPaid,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${gym.name.replace(/\s+/g, '_')}_Members_Audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPaymentsCSV = () => {
    const headers = [
      'Receipt #',
      'Date',
      'Member Name',
      'Plan',
      'Amount',
      'Payment Method',
    ];
    const rows = filteredPayments.map((p) => [
      p.receiptNumber,
      p.date,
      `"${p.memberName.replace(/"/g, '""')}"`,
      `"${p.planName.replace(/"/g, '""')}"`,
      p.amount,
      p.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${gym.name.replace(/\s+/g, '_')}_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7" id="reports-view-container">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive Business Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{gym.name}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revenue tracking, cohort retention, payment method distribution, and plan performance.
          </p>
        </div>

        {/* Date Filter & Export buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('this_month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateFilter === 'this_month'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('last_30_days')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateFilter === 'last_30_days'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('this_year')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateFilter === 'this_year'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2026
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportMembersCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Download full members directory in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Members CSV</span>
            </button>
            <button
              type="button"
              onClick={exportPaymentsCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Download payment ledger in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ledger CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gross Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Collections
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {currency === '₹' ? <IndianRupee className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {currency}{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredPayments.length} recorded entries</span>
            <span className="text-emerald-700 font-medium inline-flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              Direct Paid
            </span>
          </div>
        </div>

        {/* Card 2: Average Ticket Size */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Plan Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {currency}{averageTicket.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">/ member</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Per transaction yield across {plans.length} active plans
          </div>
        </div>

        {/* Card 3: Active Member Retention */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cohort Retention
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {activeRate}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">Active</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{activeMembers} of {totalMembers} enrolled</span>
            <span className="text-slate-400">{expiredMembers} lapsed</span>
          </div>
        </div>

        {/* Card 4: Renewals Yield */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Renewal Success
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {renewals.length}
            </span>
            <span className="text-xs text-slate-400">re-ups</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{currency}{renewalRevenue.toLocaleString('en-IN')} revenue</span>
            <span className="text-amber-600 font-medium">
              {expiringMembers} due soon
            </span>
          </div>
        </div>
      </div>

      {/* Revenue & Membership Trajectory Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs" id="trajectory-chart-section">
        {/* Header with Title, Combined Legend, and Past Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Revenue & Membership Trajectory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly collections alongside new member joiners in one unified view.
            </p>
          </div>

          {/* Right Controls: Legend & Past Months Dropdown */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Unified Series Legend showing both Revenue and New Joiners together */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-slate-900" />
                <span>Revenue ({currency})</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span>New Joiners</span>
              </span>
            </div>

            {/* Filter Past Months by selecting a particular month */}
            <div className="flex items-center gap-2">
              <label htmlFor="select-trajectory-month" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Filter Month:</span>
              </label>
              <select
                id="select-trajectory-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all_months">All Months (6-Month View)</option>
                {allPastMonths.map((m) => (
                  <option key={m.prefix} value={m.prefix}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Highlight Summary Strip */}
        <div className="pt-4 pb-2 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-slate-700">Scope:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-semibold">
              {selectedMonth === 'all_months'
                ? 'Apr 2026 – Sep 2026'
                : allPastMonths.find((m) => m.prefix === selectedMonth)?.label}
            </span>
            {selectedMonth !== 'all_months' && (
              <button
                type="button"
                onClick={() => setSelectedMonth('all_months')}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 ml-1"
              >
                Reset to All Months
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Collections:</span>
              <span className="font-bold text-slate-900">
                {selectedMonth === 'all_months'
                  ? `${currency}${monthlyTrajectoryData.data
                      .reduce((sum, d) => sum + d.revenue, 0)
                      .toLocaleString('en-IN')}`
                  : `${currency}${(monthlyTrajectoryData.selectedItem?.revenue || 0).toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Joiners:</span>
              <span className="font-bold text-emerald-700">
                {selectedMonth === 'all_months'
                  ? `+${monthlyTrajectoryData.data.reduce((sum, d) => sum + d.newMembers, 0)}`
                  : `+${monthlyTrajectoryData.selectedItem?.newMembers || 0}`}{' '}
                members
              </span>
            </div>
          </div>
        </div>

        {/* Unified Chart Visualizer: Displays Revenue and New Joiners Together */}
        <div className="pt-5 pb-2">
          <div className="grid grid-cols-6 gap-2.5 sm:gap-6 items-end h-56">
            {monthlyTrajectoryData.data.map((item) => {
              const isSelected = selectedMonth === item.prefix;
              const isDimmed = selectedMonth !== 'all_months' && !isSelected;
              const isCurrentMonth = item.prefix === '2026-09';

              const revHeight = Math.max(
                Math.round((item.revenue / monthlyTrajectoryData.maxRev) * 100),
                8
              );
              const memHeight = Math.max(
                Math.round((item.newMembers / monthlyTrajectoryData.maxMembers) * 100),
                8
              );

              return (
                <div
                  key={item.label}
                  onClick={() => setSelectedMonth(isSelected ? 'all_months' : item.prefix)}
                  className={`flex flex-col items-center h-full justify-end group cursor-pointer transition-opacity duration-200 ${
                    isDimmed ? 'opacity-35 hover:opacity-75' : 'opacity-100'
                  }`}
                  title={`Click to focus on ${item.label}`}
                >
                  {/* Values header on hover/active */}
                  <div className="text-xs font-mono text-center mb-2 transition-transform duration-200 group-hover:-translate-y-0.5">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {currency}{item.revenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600 font-sans">
                      +{item.newMembers} joiner{item.newMembers === 1 ? '' : 's'}
                    </div>
                  </div>

                  {/* Dual Bars Container Together: Dark Bar for Revenue, Emerald Bar for Joiners */}
                  <div
                    className={`w-full max-w-[62px] rounded-t-2xl p-1.5 flex items-end justify-center gap-1.5 h-40 transition-all ${
                      isSelected
                        ? 'bg-emerald-50/90 ring-2 ring-emerald-500/70 shadow-sm'
                        : 'bg-slate-100/90 group-hover:bg-slate-200/70'
                    }`}
                  >
                    {/* Revenue Bar */}
                    <div
                      className={`w-1/2 rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-black'
                          : isCurrentMonth
                          ? 'bg-slate-900 group-hover:bg-black'
                          : 'bg-slate-800 group-hover:bg-slate-900'
                      }`}
                      style={{ height: `${revHeight}%` }}
                      title={`Revenue: ${currency}${item.revenue.toLocaleString('en-IN')}`}
                    />

                    {/* New Joiners Bar */}
                    <div
                      className={`w-1/2 rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-emerald-600'
                          : 'bg-emerald-500 group-hover:bg-emerald-600'
                      }`}
                      style={{ height: `${memHeight}%` }}
                      title={`New Joiners: ${item.newMembers}`}
                    />
                  </div>

                  {/* Month Label with Active & Selected Badge */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs block font-bold transition-colors ${
                        isSelected ? 'text-emerald-700 underline underline-offset-4' : 'text-slate-700'
                      }`}
                    >
                      {item.shortLabel}
                    </span>
                    {isSelected ? (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
                        Selected
                      </span>
                    ) : isCurrentMonth ? (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-200 text-slate-700">
                        Current
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Month Dedicated Detail Card Strip (No weeks, straightforward month highlights) */}
        {monthlyTrajectoryData.selectedItem && (
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Selected Month Revenue</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {currency}{monthlyTrajectoryData.selectedItem.revenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                {monthlyTrajectoryData.selectedItem.transactions} transactions
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">New Member Enrollments</div>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                  +{monthlyTrajectoryData.selectedItem.newMembers} Joiners
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">enrolled in period</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Average Per-Transaction</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {currency}
                  {monthlyTrajectoryData.selectedItem.transactions > 0
                    ? Math.round(
                        monthlyTrajectoryData.selectedItem.revenue /
                          monthlyTrajectoryData.selectedItem.transactions
                      ).toLocaleString('en-IN')
                    : '0'}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">average ticket</div>
            </div>
          </div>
        )}
      </div>

      {/* Granular Breakdown Section Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Payment Method Settlement Channels */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Settlement Channels</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredPayments.length} txns</span>
          </div>

          <div className="space-y-4">
            {Object.keys(revenueByMethod).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded.</p>
            ) : (
              Object.entries(revenueByMethod)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([method, data]) => {
                  const pct = totalRevenue ? Math.round((data.amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={method} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              method === 'UPI'
                                ? 'bg-indigo-500'
                                : method === 'Cash'
                                ? 'bg-emerald-500'
                                : method === 'Card'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {method}
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">
                            {currency}{data.amount.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1.5">({pct}%)</span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            method === 'UPI'
                              ? 'bg-indigo-500'
                              : method === 'Cash'
                              ? 'bg-emerald-500'
                              : method === 'Card'
                              ? 'bg-blue-500'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {data.count} transaction{data.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Column 2: Membership Health & Roster Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Roster Health Distribution</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{totalMembers} total</span>
          </div>

          <div className="space-y-4">
            {/* Active Members */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Membership
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {activeMembers} ({activeRate}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${activeRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Regular check-ins with valid date coverage</p>
            </div>

            {/* Expiring Soon */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Expiring in ≤ 7 Days
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {expiringMembers} ({totalMembers ? Math.round((expiringMembers / totalMembers) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalMembers ? (expiringMembers / totalMembers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Pending renewal outreach via WhatsApp</p>
            </div>

            {/* Expired / Lapsed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Lapsed / Expired
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {expiredMembers} ({churnOrExpiredRate}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${churnOrExpiredRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Re-engagement campaign candidates</p>
            </div>
          </div>
        </div>

        {/* Column 3: Demographics & Plan Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Plan Adoption Ranking</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{plans.length} options</span>
          </div>

          <div className="space-y-3">
            {planPerformance.slice(0, 4).map((p, idx) => {
              const pct = totalMembers ? Math.round((p.membersCount / totalMembers) * 100) : 0;
              return (
                <div
                  key={p.planName}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{p.planName}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {p.membersCount} members
                    </span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>{pct}% share</span>
                    <span>Tariff: {currency}{p.estimatedValue.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent High-Value Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Accounting Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Verified receipts deposited into the isolated tenant partition.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Logged: {filteredPayments.length} receipts
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No payments recorded matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Receipt #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right pr-1">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-1 font-mono font-medium text-slate-800">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 text-slate-500 font-mono">{p.date}</td>
                    <td className="py-3 font-semibold text-slate-900">{p.memberName}</td>
                    <td className="py-3 text-slate-600">{p.planName}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.paymentMethod === 'UPI'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : p.paymentMethod === 'Cash'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-1 font-mono font-bold text-slate-900">
                      {currency}{p.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
