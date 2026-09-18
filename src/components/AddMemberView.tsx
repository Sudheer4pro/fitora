import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  Calendar,
  IndianRupee,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { GymPartitionData, Member } from '../types';
import { calculateExpiryDate, CURRENT_DATE_STRING } from '../lib/storage';

interface AddMemberViewProps {
  partition: GymPartitionData;
  onMemberAdded: (member: Member) => void;
  onCancel: () => void;
}

export const AddMemberView: React.FC<AddMemberViewProps> = ({
  partition,
  onMemberAdded,
  onCancel,
}) => {
  const { plans, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Subscription State
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [startDate, setStartDate] = useState(CURRENT_DATE_STRING);
  const [amountPaid, setAmountPaid] = useState<number>(plans[0]?.price || 1500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'>('Cash');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When selected plan changes, auto-update amount
  const activePlan = plans.find((p) => p.id === selectedPlanId);

  useEffect(() => {
    if (activePlan) {
      setAmountPaid(activePlan.price);
    }
  }, [selectedPlanId]);

  // Calculate projected expiry date
  const calculatedExpiry = activePlan
    ? calculateExpiryDate(startDate, activePlan.durationMonths)
    : calculateExpiryDate(startDate, 1);

  // File Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Capture Simulation/Trigger
  const handleStartCamera = async () => {
    try {
      setShowWebcam(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Fallback: camera permission or mock
      alert('Camera access not supported in this frame. Please choose an image file instead.');
      setShowWebcam(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        setPhotoUrl(canvas.toDataURL('image/jpeg'));
      }
      // Stop video stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
    setShowWebcam(false);
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!phone.trim()) errs.phone = 'Phone Number is required.';
    else if (phone.length < 8) errs.phone = 'Valid phone number is required.';
    if (!selectedPlanId) errs.selectedPlanId = 'Membership plan is required.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (amountPaid < 0) errs.amountPaid = 'Amount cannot be negative.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const newMemberData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        address: address.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        notes: notes.trim() || undefined,
        photoUrl,
        planId: selectedPlanId,
        startDate,
        amountPaid: Number(amountPaid),
        paymentMethod,
      };

      // Call parent handler (which calls storage.addMember)
      onMemberAdded(newMemberData as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="add-member-form-container">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="add-member-title">
          Add New Member
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Register a new member and set up their subscription.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-8">
          {/* Photo Section matching Screenshot 2026-09-17 231814.png */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-10 h-10 text-slate-300" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                id="member-photo-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={handleStartCamera}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam Capture</span>
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="text-xs text-rose-600 hover:underline px-2 py-1"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Webcam Modal if triggered */}
          {showWebcam && (
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
              <p className="text-xs text-slate-300 font-medium">Position your face in the camera preview:</p>
              <video ref={videoRef} autoPlay playsInline className="w-64 h-48 bg-black rounded-lg mx-auto object-cover" />
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setShowWebcam(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Basic Information matching screenshot */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-full-name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="field-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full bg-white border ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2`}
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-phone">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="field-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 7440284265"
                  className={`w-full bg-white border ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2`}
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-dob">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="field-dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-gender">
                  Gender
                </label>
                <select
                  id="field-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-email">
                  Email
                </label>
                <input
                  type="email"
                  id="field-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@email.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-emergency-contact">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  id="field-emergency-contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Relative/Friend phone number"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-address">
                  Address
                </label>
                <textarea
                  id="field-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-notes">
                  Notes
                </label>
                <textarea
                  id="field-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Health remarks, goal (weight loss, bodybuilding), preferences..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Membership Plan & Subscription matching screenshot */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Membership Plan & Subscription
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-membership-plan">
                  Membership Plan *
                </label>
                <select
                  id="field-membership-plan"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {currency}{p.price.toLocaleString()} ({p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'})
                    </option>
                  ))}
                </select>
                {errors.selectedPlanId && (
                  <p className="text-xs text-rose-600 mt-1">{errors.selectedPlanId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-start-date">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="field-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Calculated Expiry Info box matching PRD rule */}
            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Auto-calculated Expiry:</span>
                <strong className="text-slate-900 font-mono text-sm">
                  {new Date(calculatedExpiry).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </span>
              <span className="text-slate-400">
                Duration: {activePlan?.durationMonths || 1} Month(s)
              </span>
            </div>
          </div>

          {/* Payment matching screenshot */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Payment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-amount-paid">
                  Amount Paid ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    id="field-amount-paid"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="field-payment-method">
                  Payment Method
                </label>
                <select
                  id="field-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-member"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0f172a] hover:bg-black rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Add Member'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
