import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { GymPartitionData, MembershipPlan } from '../types';

interface MembershipPlansViewProps {
  partition: GymPartitionData;
  onAddPlan: (plan: Omit<MembershipPlan, 'id' | 'gymId'>) => void;
  onUpdatePlan: (planId: string, updates: Partial<MembershipPlan>) => void;
  onDeletePlan: (planId: string) => void;
}

export const MembershipPlansView: React.FC<MembershipPlansViewProps> = ({
  partition,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}) => {
  const { plans, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  const [isAdding, setIsAdding] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // New Plan form state
  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(1500);
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDurationMonths(1);
    setPrice(1500);
    setDescription('');
    setIsAdding(false);
    setEditingPlanId(null);
  };

  const handleStartEdit = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);
    setName(plan.name);
    setDurationMonths(plan.durationMonths);
    setPrice(plan.price);
    setDescription(plan.description || '');
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price < 0 || durationMonths <= 0) return;

    if (editingPlanId) {
      onUpdatePlan(editingPlanId, {
        name: name.trim(),
        durationMonths: Number(durationMonths),
        price: Number(price),
        description: description.trim(),
      });
    } else {
      onAddPlan({
        name: name.trim(),
        durationMonths: Number(durationMonths),
        price: Number(price),
        description: description.trim(),
        isActive: true,
      });
    }

    resetForm();
  };

  return (
    <div className="space-y-6" id="plans-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Membership Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure subscription durations, pricing, and benefits for {gym.name}.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            id="btn-create-new-plan"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-black text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal or Card */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              {editingPlanId ? 'Edit Plan' : 'Create Membership Plan'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="plan-name-input">
                Plan Name *
              </label>
              <input
                type="text"
                id="plan-name-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 3 Months Gold"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="plan-duration-input">
                Duration (Months) *
              </label>
              <input
                type="number"
                id="plan-duration-input"
                min="1"
                max="60"
                required
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="plan-price-input">
                Price ({currency}) *
              </label>
              <input
                type="number"
                id="plan-price-input"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="plan-description-input">
                Description / Inclusions
              </label>
              <input
                type="text"
                id="plan-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Free locker, steam bath access, trainer guidance"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs"
            >
              {editingPlanId ? 'Save Changes' : 'Add Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              plan.isActive ? 'border-slate-200 shadow-xs' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-base font-bold text-slate-900">{plan.name}</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    plan.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {currency}{plan.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 min-h-[36px]">
                {plan.description || 'Full gym facility access.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => onUpdatePlan(plan.id, { isActive: !plan.isActive })}
                className="text-slate-500 hover:text-slate-800 font-medium"
              >
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStartEdit(plan)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Edit Plan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete plan "${plan.name}"?`)) {
                      onDeletePlan(plan.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
