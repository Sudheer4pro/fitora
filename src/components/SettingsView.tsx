import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GymPartitionData, GymAccount } from '../types';
import { storage } from '../lib/storage';

interface SettingsViewProps {
  partition: GymPartitionData;
  onUpdateGymInfo: (updates: Partial<GymAccount>) => void;
  onPartitionReloaded: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  partition,
  onUpdateGymInfo,
  onPartitionReloaded,
}) => {
  const { gym, members, payments, plans, renewals } = partition;

  const [gymName, setGymName] = useState(gym.name);
  const [phone, setPhone] = useState(gym.phone);
  const [email, setEmail] = useState(gym.email);
  const [address, setAddress] = useState(gym.address || '');
  const [currencySymbol, setCurrencySymbol] = useState(gym.currencySymbol || '₹');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGymInfo({
      name: gymName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Backup Export
  const handleExportBackup = () => {
    const jsonStr = storage.exportPartitionJSON(gym.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gym.name.replace(/\s+/g, '_')}_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storage.importPartitionJSON(gym.id, content);
        if (success) {
          alert('Database partition successfully restored!');
          onPartitionReloaded();
        } else {
          alert('Failed to restore. Please check file format.');
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="settings-view-container">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gym Settings & Database</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage gym credentials, currency, and isolated local database partitions.
        </p>
      </div>

      {/* Gym Profile Details */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gym Profile & Branding</h2>
              <p className="text-xs text-slate-500">Unique Gym ID: <span className="font-mono font-semibold text-slate-800">{gym.gymId}</span></p>
            </div>
          </div>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="settings-gym-name">
              Gym Name
            </label>
            <input
              type="text"
              id="settings-gym-name"
              required
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="settings-gym-phone">
              Official Phone
            </label>
            <input
              type="tel"
              id="settings-gym-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="settings-gym-email">
              Contact Email
            </label>
            <input
              type="email"
              id="settings-gym-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="settings-gym-currency">
              Currency Symbol
            </label>
            <select
              id="settings-gym-currency"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="₹">₹ (INR - Indian Rupee)</option>
              <option value="$">$ (USD / International)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="£">£ (GBP - British Pound)</option>
              <option value="AED">AED (Dirhams)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="settings-gym-address">
              Gym Address
            </label>
            <input
              type="text"
              id="settings-gym-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs"
          >
            Update Gym Profile
          </button>
        </div>
      </form>

      {/* Database Partitioning & Offline Backup (PRD Sections 20, 21, 22) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Isolated Database Partitioning & Offline Backup
            </h2>
            <p className="text-xs text-slate-500">
              Zero cross-gym visibility. Safe local offline storage with one-click backup & restore.
            </p>
          </div>
        </div>

        {/* Partition Details Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Partition Key</span>
            <span className="font-mono font-bold text-slate-800">fitora_partition_{gym.id}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Tenant Gym ID</span>
            <span className="font-mono font-bold text-slate-800">{gym.gymId}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Isolated Record Counts</span>
            <span className="font-medium text-slate-800">
              {members.length} Members · {payments.length} Payments · {plans.length} Plans · {renewals.length} Renewals
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">License Status & Renewal</span>
            <span className="font-medium text-emerald-600">
              {gym.licenseStatus} (Renews {new Date(gym.licenseExpiryDate).toLocaleDateString()})
            </span>
          </div>
        </div>

        {/* Backup & Restore Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            id="btn-export-backup"
            onClick={handleExportBackup}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Database Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            id="btn-restore-backup"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Partition from File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
