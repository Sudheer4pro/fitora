import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  UserPlus,
  UserX,
  CreditCard,
  BarChart2,
  Sliders,
  Settings,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Building,
  Menu,
  X,
  RefreshCw,
  Plus,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  GymAccount,
  UserAccount,
  GymPartitionData,
  Member,
  PaymentRecord,
  MembershipPlan,
} from '../types';
import { storage } from '../lib/storage';
import { FitoraLogo } from './FitoraLogo';
import { DashboardView } from './DashboardView';
import { MembersView } from './MembersView';
import { AddMemberView } from './AddMemberView';
import { ExpiredMembersView } from './ExpiredMembersView';
import { PaymentsView } from './PaymentsView';
import { ReportsView } from './ReportsView';
import { MembershipPlansView } from './MembershipPlansView';
import { SettingsView } from './SettingsView';
import { MemberDetailModal } from './MemberDetailModal';
import { RenewModal } from './RenewModal';
import { ReceiptModal } from './ReceiptModal';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';

interface GymMaintainerPortalProps {
  currentGymId: string;
  currentUser: UserAccount;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
  onSwitchGym?: (newGymId: string) => void;
}

export const GymMaintainerPortal: React.FC<GymMaintainerPortalProps> = ({
  currentGymId,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [partition, setPartition] = useState<GymPartitionData>(() => storage.getPartition(currentGymId));

  // Modal States
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRecord | null>(null);
  const [reminderMember, setReminderMember] = useState<Member | null>(null);

  // Mobile sidebar drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload partition whenever currentGymId changes
  useEffect(() => {
    setPartition(storage.getPartition(currentGymId));
  }, [currentGymId]);

  const refreshCurrentPartition = () => {
    setPartition(storage.getPartition(currentGymId));
  };

  // Member Action Handlers
  const handleMemberAdded = (memberData: any) => {
    const newMember = storage.addMember(currentGymId, memberData);
    refreshCurrentPartition();
    setActiveTab('members');
    showToast(`Member "${newMember.fullName}" successfully registered!`);

    // Optionally show the receipt for the initial payment
    const updatedPartition = storage.getPartition(currentGymId);
    if (updatedPartition.payments.length > 0) {
      setViewingReceipt(updatedPartition.payments[0]);
    }
  };

  const handleUpdateMember = (memberId: string, updates: Partial<Member>) => {
    storage.updateMember(currentGymId, memberId, updates);
    refreshCurrentPartition();
    showToast('Member profile updated.');
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember({ ...selectedMember, ...updates });
    }
  };

  const handleDeleteMember = (memberId: string) => {
    storage.deleteMember(currentGymId, memberId);
    refreshCurrentPartition();
    showToast('Member deleted from records.');
    setSelectedMember(null);
  };

  const handleConfirmRenewal = (
    memberId: string,
    newPlanId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'
  ) => {
    const res = storage.renewMember(currentGymId, memberId, newPlanId, amount, paymentMethod);
    if (res) {
      refreshCurrentPartition();
      showToast(`Membership successfully renewed for ${res.member.fullName}!`);
      // Open receipt automatically
      setViewingReceipt(res.payment);
    }
  };

  // Plan Handlers
  const handleAddPlan = (plan: Omit<MembershipPlan, 'id' | 'gymId'>) => {
    storage.addPlan(currentGymId, plan);
    refreshCurrentPartition();
    showToast(`Plan "${plan.name}" created.`);
  };

  const handleUpdatePlan = (planId: string, updates: Partial<MembershipPlan>) => {
    storage.updatePlan(currentGymId, planId, updates);
    refreshCurrentPartition();
    showToast('Plan updated.');
  };

  const handleDeletePlan = (planId: string) => {
    storage.deletePlan(currentGymId, planId);
    refreshCurrentPartition();
    showToast('Plan removed.');
  };

  const handleUpdateGymInfo = (updates: Partial<GymAccount>) => {
    const currentG = storage.getGymById(currentGymId);
    if (currentG) {
      const updated = { ...currentG, ...updates };
      const partitionData = storage.getPartition(currentGymId);
      partitionData.gym = updated;
      storage.savePartition(currentGymId, partitionData);
      refreshCurrentPartition();
      showToast('Gym details saved.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'expired', label: 'Expired Members', icon: UserX },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'plans', label: 'Membership Plans', icon: Sliders },
    { id: 'settings', label: 'Settings & DB', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row text-slate-900 font-sans" id="gym-maintainer-portal-root">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-lime-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0a0d14] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <FitoraLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar matching Screenshot 2026-09-17 231640.png */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#0a0d14] text-slate-300 flex flex-col justify-between z-30 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } border-r border-slate-800/80`}
        id="sidebar-container"
      >
        <div className="p-5 space-y-6">
          {/* Logo at top */}
          <div className="flex items-center justify-between pl-1">
            <FitoraLogo size="md" />
          </div>

          {/* Current Gym Badge */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              <span>ACTIVE GYM</span>
              <span className="font-mono text-lime-400">{partition.gym.gymId}</span>
            </div>
            <div className="font-bold text-white text-sm mt-1 truncate">
              {partition.gym.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Operator: {currentUser.name}
            </div>
          </div>

          {/* Navigation Links matching Screenshot: active item has neon lime bg with black text */}
          <nav className="space-y-1.5" id="sidebar-navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-[#a3e635] text-black font-bold shadow-md shadow-lime-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#080b11]">
          <button
            type="button"
            id="maintainer-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {partition.gym.name}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Maintainer Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Partition: {partition.gym.id}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>17 Sep 2026</span>
            </div>

            {activeTab !== 'add-member' && (
              <button
                type="button"
                onClick={() => setActiveTab('add-member')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#a3e635] hover:bg-[#92d02a] text-black font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Member</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              partition={partition}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onWhatsAppReminder={(m) => setReminderMember(m)}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              partition={partition}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onDeleteMember={handleDeleteMember}
              onWhatsAppReminder={(m) => setReminderMember(m)}
            />
          )}

          {activeTab === 'add-member' && (
            <AddMemberView
              partition={partition}
              onMemberAdded={handleMemberAdded}
              onCancel={() => setActiveTab('members')}
            />
          )}

          {activeTab === 'expired' && (
            <ExpiredMembersView
              partition={partition}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onWhatsAppReminder={(m) => setReminderMember(m)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              partition={partition}
              onViewReceipt={(p) => setViewingReceipt(p)}
            />
          )}

          {activeTab === 'reports' && <ReportsView partition={partition} />}

          {activeTab === 'plans' && (
            <MembershipPlansView
              partition={partition}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              partition={partition}
              onUpdateGymInfo={handleUpdateGymInfo}
              onPartitionReloaded={refreshCurrentPartition}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          partition={partition}
          onClose={() => setSelectedMember(null)}
          onRenew={(m) => setRenewingMember(m)}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onWhatsAppReminder={(m) => setReminderMember(m)}
        />
      )}

      {renewingMember && (
        <RenewModal
          member={renewingMember}
          partition={partition}
          onClose={() => setRenewingMember(null)}
          onConfirmRenewal={handleConfirmRenewal}
        />
      )}

      {viewingReceipt && (
        <ReceiptModal
          payment={viewingReceipt}
          gym={partition.gym}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {reminderMember && (
        <WhatsAppReminderModal
          member={reminderMember}
          gym={partition.gym}
          onClose={() => setReminderMember(null)}
        />
      )}
    </div>
  );
};
