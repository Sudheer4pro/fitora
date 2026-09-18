export type UserRole = 'SUPER_ADMIN' | 'GYM_MAINTAINER' | 'GYM_STAFF';

export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Suspended' | 'Expired';

export interface GymAccount {
  id: string; // unique internal id
  gymId: string; // e.g. "GYM-IRON-01"
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  currencySymbol: string; // e.g. "₹"
  licenseStatus: LicenseStatus;
  licenseExpiryDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface UserAccount {
  id: string;
  gymId: string | null; // null if SUPER_ADMIN
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  avatar?: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  durationDays?: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export type MemberStatus = 'Active' | 'Expiring Soon' | 'Expires Today' | 'Expired';

export interface Member {
  id: string;
  gymId: string;
  memberCode: string; // e.g. "MEM-1001"
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  photoUrl?: string;
  
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  
  amountPaid: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
  
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  planName: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
  date: string; // YYYY-MM-DD
  receiptNumber: string;
  notes?: string;
}

export interface RenewalHistoryRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  previousExpiry: string;
  newExpiry: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  renewalDate: string;
}

export interface GymPartitionData {
  gym: GymAccount;
  members: Member[];
  plans: MembershipPlan[];
  payments: PaymentRecord[];
  renewals: RenewalHistoryRecord[];
}
