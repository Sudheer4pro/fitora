import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Bell,
  MessageSquare,
  RefreshCw,
  MoreVertical,
  Edit2,
  Trash2,
  User as UserIcon,
  Phone,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Member, MemberStatus, GymPartitionData } from '../types';

interface MembersViewProps {
  partition: GymPartitionData;
  onNavigate: (tab: string) => void;
  onSelectMember: (member: Member) => void;
  onRenewMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onWhatsAppReminder: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  partition,
  onNavigate,
  onSelectMember,
  onRenewMember,
  onDeleteMember,
  onWhatsAppReminder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | MemberStatus>('All');
  const [selectedMemberMenu, setSelectedMemberMenu] = useState<string | null>(null);

  const { members } = partition;

  // Expiring members count for the notification alert banner
  const expiringMembersCount = members.filter(
    (m) => m.status === 'Expiring Soon' || m.status === 'Expires Today'
  ).length;

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search matching name, phone, or memberCode
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        member.memberCode.toLowerCase().includes(query) ||
        (member.email && member.email.toLowerCase().includes(query));

      // Filter matching status
      const matchesFilter = activeFilter === 'All' || member.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [members, searchQuery, activeFilter]);

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Expiring Soon
          </span>
        );
      case 'Expires Today':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Expires Today
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="members-view-container">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="members-page-title">
            Members
          </h1>
          <p className="text-sm text-slate-500 mt-0.5" id="members-count-subtitle">
            {members.length} total member{members.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          type="button"
          id="btn-add-member-top"
          onClick={() => onNavigate('add-member')}
          className="inline-flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-black text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Expiring Members Banner matching screenshot */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Expiring Members
        </div>
        {expiringMembersCount > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {expiringMembersCount} member{expiringMembersCount > 1 ? 's' : ''} expiring soon
                </p>
                <p className="text-xs text-slate-600">
                  Send payment reminders to ensure continuous gym access.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter('Expiring Soon')}
              className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notify for repayment or renew the subscription</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400 text-sm">
            No members expiring soon.
          </div>
        )}
      </div>

      {/* Search Bar matching screenshot */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id="member-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone or member ID"
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs matching screenshot: All, Active, Expiring Soon, Expires Today, Expired */}
      <div className="flex flex-wrap items-center gap-2" id="member-filter-tabs">
        {(['All', 'Active', 'Expiring Soon', 'Expires Today', 'Expired'] as const).map((tab) => {
          const isSelected = activeFilter === tab;
          let count = 0;
          if (tab === 'All') count = members.length;
          else count = members.filter((m) => m.status === tab).length;

          return (
            <button
              key={tab}
              type="button"
              id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Member Cards List matching Screenshot 2026-09-17 231734.png */}
      <div className="space-y-3" id="members-list-cards">
        {filteredMembers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
            <UserIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-900">No members found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No members matching "${searchQuery}". Try clearing search.`
                : 'No members in this category yet. Click "Add Member" to register your first client.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              id={`member-row-${member.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group"
            >
              {/* Left Side: Avatar & Name & Subtext */}
              <div
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => onSelectMember(member)}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-200">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {member.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono">{member.phone}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{member.planName}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-mono">{member.memberCode}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Expiry info, Status Badge, Quick Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    Expires
                  </span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {new Date(member.expiryDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>{getStatusBadge(member.status)}</div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWhatsAppReminder(member);
                    }}
                    title="Send WhatsApp Reminder"
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenewMember(member);
                    }}
                    title="Renew Membership"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renew</span>
                  </button>

                  {/* Context menu toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMemberMenu(selectedMemberMenu === member.id ? null : member.id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {selectedMemberMenu === member.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMemberMenu(null);
                            onSelectMember(member);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Full Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMemberMenu(null);
                            onRenewMember(member);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Renew Subscription</span>
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMemberMenu(null);
                            if (window.confirm(`Delete member ${member.fullName}?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Member</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
