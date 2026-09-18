import {
  GymAccount,
  UserAccount,
  MembershipPlan,
  Member,
  MemberStatus,
  PaymentRecord,
  RenewalHistoryRecord,
  GymPartitionData,
} from '../types';

export const CURRENT_DATE_STRING = '2026-09-17'; // Aligned to user's PRD & screenshots

const STORAGE_KEY_GYMS = 'fitora_master_gyms';
const STORAGE_KEY_USERS = 'fitora_master_users';
const STORAGE_KEY_ADMIN_CREDS = 'fitora_admin_credentials';
const PARTITION_PREFIX = 'fitora_partition_';

// Calculate member status based on current reference date
export function calculateMemberStatus(expiryDateStr: string, refDateStr = CURRENT_DATE_STRING): MemberStatus {
  if (!expiryDateStr) return 'Active';
  const expiry = new Date(expiryDateStr);
  const ref = new Date(refDateStr);
  
  // Set both to midnight UTC for clean day difference
  expiry.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - ref.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires Today';
  if (diffDays > 0 && diffDays <= 7) return 'Expiring Soon';
  return 'Active';
}

export function calculateExpiryDate(startDateStr: string, months: number): string {
  const date = new Date(startDateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

// Initial Seed Data
const INITIAL_GYMS: GymAccount[] = [
  {
    id: 'gym_iron_01',
    gymId: 'GYM-IRON-01',
    name: 'Iron Core Fitness',
    ownerName: 'iamsudheer786',
    email: 'iamsudheer786@gmail.com',
    phone: '7550284265',
    address: '12-B Fitness Hub, Central Avenue',
    currencySymbol: '₹',
    licenseStatus: 'Active',
    licenseExpiryDate: '2027-10-17',
    createdAt: '2026-01-10',
  },
  {
    id: 'gym_apex_02',
    gymId: 'GYM-APEX-02',
    name: 'Apex Performance Lab',
    ownerName: 'Marcus Vance',
    email: 'marcus@apexfit.com',
    phone: '9123456780',
    address: '88 Olympic Blvd, Suite 4',
    currencySymbol: '$',
    licenseStatus: 'Active',
    licenseExpiryDate: '2027-04-30',
    createdAt: '2026-02-15',
  },
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_admin',
    gymId: null,
    name: 'System Admin',
    email: 'admin@email.com',
    phone: '9876543210',
    password: 'password123',
    role: 'SUPER_ADMIN',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'user_maintainer_1',
    gymId: 'gym_iron_01',
    name: 'iamsudheer786',
    email: 'iamsudheer786@gmail.com',
    phone: '7550284265',
    password: 'Fitora',
    role: 'GYM_MAINTAINER',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'user_maintainer_2',
    gymId: 'gym_apex_02',
    name: 'Marcus Vance',
    email: 'marcus@apexfit.com',
    phone: '9123456780',
    password: 'Fitora',
    role: 'GYM_MAINTAINER',
    status: 'Active',
    createdAt: '2026-02-15',
  },
];

function getInitialIronCorePartition(): GymPartitionData {
  const plans: MembershipPlan[] = [
    {
      id: 'plan_1m',
      gymId: 'gym_iron_01',
      name: '1 Month Standard',
      durationMonths: 1,
      price: 1500,
      description: 'Standard access with gym equipment and locker.',
      isActive: true,
    },
    {
      id: 'plan_3m',
      gymId: 'gym_iron_01',
      name: '3 Months Gold',
      durationMonths: 3,
      price: 4000,
      description: 'Full cardio, heavy weights, and fitness consultation.',
      isActive: true,
    },
    {
      id: 'plan_6m',
      gymId: 'gym_iron_01',
      name: '6 Months Pro',
      durationMonths: 6,
      price: 7500,
      description: 'Comprehensive strength training and nutrition guide.',
      isActive: true,
    },
    {
      id: 'plan_12m',
      gymId: 'gym_iron_01',
      name: '12 Months VIP',
      durationMonths: 12,
      price: 13500,
      description: 'All-inclusive annual pass with steam & sauna.',
      isActive: true,
    },
  ];

  const members: Member[] = [
    {
      id: 'mem_iron_1',
      gymId: 'gym_iron_01',
      memberCode: 'MEM-1001',
      fullName: 'fdsfg',
      phone: '7440284265',
      email: 'fdsfg@member.com',
      gender: 'Male',
      dob: '1998-05-12',
      address: 'Near West Gate Park',
      notes: 'Prefers evening strength workouts.',
      planId: 'plan_3m',
      planName: '3 Months Gold',
      startDate: '2026-08-10',
      expiryDate: '2026-11-10',
      amountPaid: 4000,
      paymentMethod: 'Cash',
      status: 'Active',
      createdAt: '2026-08-10',
      updatedAt: '2026-08-10',
    },
    {
      id: 'mem_iron_2',
      gymId: 'gym_iron_01',
      memberCode: 'MEM-1002',
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul.s@example.com',
      gender: 'Male',
      dob: '1995-11-04',
      address: 'Block C, Sector 14',
      emergencyContact: '9876500000',
      notes: 'Expiring in 4 days. Contacted for renewal.',
      planId: 'plan_1m',
      planName: '1 Month Standard',
      startDate: '2026-08-21',
      expiryDate: '2026-09-21',
      amountPaid: 1500,
      paymentMethod: 'UPI',
      status: 'Expiring Soon',
      createdAt: '2026-08-21',
      updatedAt: '2026-08-21',
    },
    {
      id: 'mem_iron_3',
      gymId: 'gym_iron_01',
      memberCode: 'MEM-1003',
      fullName: 'Pooja Verma',
      phone: '9811223344',
      email: 'pooja.v@example.com',
      gender: 'Female',
      dob: '2000-02-18',
      address: 'Greenwood Apartments #302',
      emergencyContact: '9811009988',
      notes: 'Expires today! Call in afternoon.',
      planId: 'plan_1m',
      planName: '1 Month Standard',
      startDate: '2026-08-17',
      expiryDate: '2026-09-17',
      amountPaid: 1500,
      paymentMethod: 'UPI',
      status: 'Expires Today',
      createdAt: '2026-08-17',
      updatedAt: '2026-08-17',
    },
    {
      id: 'mem_iron_4',
      gymId: 'gym_iron_01',
      memberCode: 'MEM-1004',
      fullName: 'Vikram Singh',
      phone: '9988776655',
      email: 'vikram.singh@example.com',
      gender: 'Male',
      dob: '1992-09-29',
      address: '45 Lake View Road',
      emergencyContact: '9988001122',
      notes: 'Expired member. Offered 10% discount on renewal.',
      planId: 'plan_6m',
      planName: '6 Months Pro',
      startDate: '2026-02-15',
      expiryDate: '2026-08-15',
      amountPaid: 7500,
      paymentMethod: 'Card',
      status: 'Expired',
      createdAt: '2026-02-15',
      updatedAt: '2026-08-16',
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'pay_iron_1',
      gymId: 'gym_iron_01',
      memberId: 'mem_iron_1',
      memberName: 'fdsfg',
      planName: '3 Months Gold',
      amount: 4000,
      paymentMethod: 'Cash',
      date: '2026-08-10',
      receiptNumber: 'RCP-2026-001',
      notes: 'Initial admission & subscription fee',
    },
    {
      id: 'pay_iron_2',
      gymId: 'gym_iron_01',
      memberId: 'mem_iron_2',
      memberName: 'Rahul Sharma',
      planName: '1 Month Standard',
      amount: 1500,
      paymentMethod: 'UPI',
      date: '2026-08-21',
      receiptNumber: 'RCP-2026-002',
      notes: 'Online UPI payment',
    },
    {
      id: 'pay_iron_3',
      gymId: 'gym_iron_01',
      memberId: 'mem_iron_3',
      memberName: 'Pooja Verma',
      planName: '1 Month Standard',
      amount: 1500,
      paymentMethod: 'UPI',
      date: '2026-08-17',
      receiptNumber: 'RCP-2026-003',
      notes: 'UPI Reference ID #8892110',
    },
    {
      id: 'pay_iron_4',
      gymId: 'gym_iron_01',
      memberId: 'mem_iron_4',
      memberName: 'Vikram Singh',
      planName: '6 Months Pro',
      amount: 7500,
      paymentMethod: 'Card',
      date: '2026-02-15',
      receiptNumber: 'RCP-2026-004',
      notes: 'POS Card swipe',
    },
  ];

  const renewals: RenewalHistoryRecord[] = [];

  return {
    gym: INITIAL_GYMS[0],
    members,
    plans,
    payments,
    renewals,
  };
}

function getInitialApexPartition(): GymPartitionData {
  const plans: MembershipPlan[] = [
    {
      id: 'plan_apex_basic',
      gymId: 'gym_apex_02',
      name: 'Sprint Monthly',
      durationMonths: 1,
      price: 90,
      description: 'Monthly open floor access.',
      isActive: true,
    },
    {
      id: 'plan_apex_crossfit',
      gymId: 'gym_apex_02',
      name: 'Elite Quarterly',
      durationMonths: 3,
      price: 250,
      description: 'Unlimited functional conditioning + recovery lounge.',
      isActive: true,
    },
  ];

  const members: Member[] = [
    {
      id: 'mem_apex_1',
      gymId: 'gym_apex_02',
      memberCode: 'APX-010',
      fullName: 'Elena Rostova',
      phone: '555-0199',
      email: 'elena@apexmember.com',
      gender: 'Female',
      dob: '1996-07-22',
      address: '404 Metro Towers',
      planId: 'plan_apex_crossfit',
      planName: 'Elite Quarterly',
      startDate: '2026-07-01',
      expiryDate: '2026-10-01',
      amountPaid: 250,
      paymentMethod: 'Card',
      status: 'Active',
      createdAt: '2026-07-01',
      updatedAt: '2026-07-01',
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'pay_apex_1',
      gymId: 'gym_apex_02',
      memberId: 'mem_apex_1',
      memberName: 'Elena Rostova',
      planName: 'Elite Quarterly',
      amount: 250,
      paymentMethod: 'Card',
      date: '2026-07-01',
      receiptNumber: 'APX-RCP-101',
    },
  ];

  return {
    gym: INITIAL_GYMS[1],
    members,
    plans,
    payments,
    renewals: [],
  };
}

// Master Storage Layer
export const storage = {
  init() {
    if (typeof window === 'undefined') return;
    
    // Seed Gyms if missing
    if (!localStorage.getItem(STORAGE_KEY_GYMS)) {
      localStorage.setItem(STORAGE_KEY_GYMS, JSON.stringify(INITIAL_GYMS));
    }
    
    // Seed Users if missing
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    }
    
    // Seed Iron Core Partition
    const ironKey = `${PARTITION_PREFIX}gym_iron_01`;
    if (!localStorage.getItem(ironKey)) {
      localStorage.setItem(ironKey, JSON.stringify(getInitialIronCorePartition()));
    }
    
    // Seed Apex Partition
    const apexKey = `${PARTITION_PREFIX}gym_apex_02`;
    if (!localStorage.getItem(apexKey)) {
      localStorage.setItem(apexKey, JSON.stringify(getInitialApexPartition()));
    }
  },

  // Admin Gym Management
  getAllGyms(): GymAccount[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEY_GYMS);
      return data ? JSON.parse(data) : INITIAL_GYMS;
    } catch {
      return INITIAL_GYMS;
    }
  },

  getGymById(gymId: string): GymAccount | undefined {
    return this.getAllGyms().find((g) => g.id === gymId || g.gymId === gymId);
  },

  getAllUsers(): UserAccount[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      const parsed: UserAccount[] = data ? JSON.parse(data) : INITIAL_USERS;
      return parsed.map((u) => {
        if (!u.password) {
          return { ...u, password: u.role === 'SUPER_ADMIN' ? 'password123' : 'Fitora' };
        }
        return u;
      });
    } catch {
      return INITIAL_USERS;
    }
  },

  getAdminCredentials(): { email: string; password: string } {
    this.init();
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_CREDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    const adminUser = this.getAllUsers().find((u) => u.role === 'SUPER_ADMIN');
    return {
      email: adminUser?.email || 'admin@email.com',
      password: 'password123',
    };
  },

  updateAdminCredentials(newEmail: string, newPassword?: string): UserAccount | null {
    const users = this.getAllUsers();
    const adminIndex = users.findIndex((u) => u.role === 'SUPER_ADMIN');
    if (adminIndex === -1) return null;

    users[adminIndex].email = newEmail;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    const currentCreds = this.getAdminCredentials();
    const updatedCreds = {
      email: newEmail,
      password: newPassword !== undefined ? newPassword : currentCreds.password,
    };
    localStorage.setItem(STORAGE_KEY_ADMIN_CREDS, JSON.stringify(updatedCreds));

    return users[adminIndex];
  },

  createGymAndMaintainer(
    gymName: string,
    maintainerName: string,
    email: string,
    phone: string,
    licenseDurationMonths: number = 12,
    customGymCode?: string
  ): { gym: GymAccount; user: UserAccount } {
    const gyms = this.getAllGyms();
    const users = this.getAllUsers();
    
    const newId = `gym_${Date.now()}`;
    const gymCode = customGymCode || `GYM-${Math.floor(100 + Math.random() * 900)}`;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + licenseDurationMonths);
    const expiryDateStr = expiry.toISOString().split('T')[0];

    const newGym: GymAccount = {
      id: newId,
      gymId: gymCode,
      name: gymName,
      ownerName: maintainerName,
      email,
      phone,
      currencySymbol: '₹',
      licenseStatus: 'Active',
      licenseExpiryDate: expiryDateStr,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      gymId: newId,
      name: maintainerName,
      email,
      phone,
      password: 'Fitora',
      role: 'GYM_MAINTAINER',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Initialize clean isolated partition for this gym
    const newPartition: GymPartitionData = {
      gym: newGym,
      members: [],
      plans: [
        {
          id: `plan_${Date.now()}_1`,
          gymId: newId,
          name: 'Monthly Standard',
          durationMonths: 1,
          price: 1500,
          description: '1 month basic access',
          isActive: true,
        },
        {
          id: `plan_${Date.now()}_2`,
          gymId: newId,
          name: 'Quarterly Gold',
          durationMonths: 3,
          price: 4000,
          description: '3 months full fitness access',
          isActive: true,
        },
      ],
      payments: [],
      renewals: [],
    };

    gyms.push(newGym);
    users.push(newUser);

    localStorage.setItem(STORAGE_KEY_GYMS, JSON.stringify(gyms));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(`${PARTITION_PREFIX}${newId}`, JSON.stringify(newPartition));

    return { gym: newGym, user: newUser };
  },

  updateGymLicense(gymId: string, status: 'Active' | 'Expiring Soon' | 'Suspended' | 'Expired', newExpiry?: string) {
    const gyms = this.getAllGyms();
    const idx = gyms.findIndex((g) => g.id === gymId);
    if (idx !== -1) {
      gyms[idx].licenseStatus = status;
      if (newExpiry) gyms[idx].licenseExpiryDate = newExpiry;
      localStorage.setItem(STORAGE_KEY_GYMS, JSON.stringify(gyms));
    }
  },

  deleteMaintainerAccount(userId: string, deletePartitionToo: boolean = true) {
    let users = this.getAllUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    users = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    if (deletePartitionToo && targetUser.gymId) {
      let gyms = this.getAllGyms();
      gyms = gyms.filter((g) => g.id !== targetUser.gymId);
      localStorage.setItem(STORAGE_KEY_GYMS, JSON.stringify(gyms));
      localStorage.removeItem(`${PARTITION_PREFIX}${targetUser.gymId}`);
    }
  },

  deleteGymPartition(gymId: string) {
    let gyms = this.getAllGyms();
    gyms = gyms.filter((g) => g.id !== gymId);
    localStorage.setItem(STORAGE_KEY_GYMS, JSON.stringify(gyms));

    let users = this.getAllUsers();
    users = users.filter((u) => u.gymId !== gymId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    localStorage.removeItem(`${PARTITION_PREFIX}${gymId}`);
  },

  // Partition Access & Mutation
  getPartition(gymId: string): GymPartitionData {
    this.init();
    const key = `${PARTITION_PREFIX}${gymId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed: GymPartitionData = JSON.parse(raw);
        // Refresh dynamic statuses based on CURRENT_DATE_STRING
        parsed.members = parsed.members.map((m) => ({
          ...m,
          status: calculateMemberStatus(m.expiryDate),
        }));
        return parsed;
      } catch (e) {
        console.error('Error parsing gym partition:', e);
      }
    }

    // Fallback if not found
    const gym = this.getGymById(gymId) || INITIAL_GYMS[0];
    return {
      gym,
      members: [],
      plans: [],
      payments: [],
      renewals: [],
    };
  },

  savePartition(gymId: string, data: GymPartitionData) {
    const key = `${PARTITION_PREFIX}${gymId}`;
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Member CRUD inside Partition
  addMember(
    gymId: string,
    memberInput: {
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
      startDate: string;
      amountPaid: number;
      paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
    }
  ): Member {
    const partition = this.getPartition(gymId);
    const plan = partition.plans.find((p) => p.id === memberInput.planId);
    const durationMonths = plan ? plan.durationMonths : 1;
    const expiryDate = calculateExpiryDate(memberInput.startDate, durationMonths);
    const status = calculateMemberStatus(expiryDate);
    
    const memberCode = `MEM-${1000 + partition.members.length + 1}`;
    const newMemberId = `mem_${Date.now()}`;

    const newMember: Member = {
      id: newMemberId,
      gymId,
      memberCode,
      fullName: memberInput.fullName,
      phone: memberInput.phone,
      email: memberInput.email,
      gender: memberInput.gender,
      dob: memberInput.dob,
      address: memberInput.address,
      emergencyContact: memberInput.emergencyContact,
      notes: memberInput.notes,
      photoUrl: memberInput.photoUrl,
      planId: memberInput.planId,
      planName: plan ? plan.name : 'Custom Plan',
      startDate: memberInput.startDate,
      expiryDate,
      amountPaid: memberInput.amountPaid,
      paymentMethod: memberInput.paymentMethod,
      status,
      createdAt: memberInput.startDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Also create initial payment record
    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      gymId,
      memberId: newMemberId,
      memberName: newMember.fullName,
      planName: newMember.planName,
      amount: newMember.amountPaid,
      paymentMethod: newMember.paymentMethod,
      date: newMember.startDate,
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(partition.payments.length + 1).padStart(3, '0')}`,
      notes: 'Initial Membership Registration',
    };

    partition.members.unshift(newMember);
    partition.payments.unshift(newPayment);
    this.savePartition(gymId, partition);

    return newMember;
  },

  updateMember(gymId: string, memberId: string, updates: Partial<Member>): Member | null {
    const partition = this.getPartition(gymId);
    const idx = partition.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;

    const existing = partition.members[idx];
    const updated: Member = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (updates.expiryDate) {
      updated.status = calculateMemberStatus(updates.expiryDate);
    }

    partition.members[idx] = updated;
    this.savePartition(gymId, partition);
    return updated;
  },

  renewMember(
    gymId: string,
    memberId: string,
    newPlanId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other',
    renewalStartDate?: string
  ): { member: Member; payment: PaymentRecord; renewal: RenewalHistoryRecord } | null {
    const partition = this.getPartition(gymId);
    const idx = partition.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;

    const member = partition.members[idx];
    const plan = partition.plans.find((p) => p.id === newPlanId);
    const durationMonths = plan ? plan.durationMonths : 1;
    
    // Renewal start date: either current expiry (if in future) or today (if expired)
    const baseDate = renewalStartDate || (new Date(member.expiryDate) > new Date(CURRENT_DATE_STRING) ? member.expiryDate : CURRENT_DATE_STRING);
    const newExpiryDate = calculateExpiryDate(baseDate, durationMonths);
    const previousExpiry = member.expiryDate;

    // Update member
    member.planId = newPlanId;
    member.planName = plan ? plan.name : member.planName;
    member.startDate = baseDate;
    member.expiryDate = newExpiryDate;
    member.status = calculateMemberStatus(newExpiryDate);
    member.updatedAt = new Date().toISOString().split('T')[0];

    // Payment record
    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      planName: member.planName,
      amount,
      paymentMethod,
      date: CURRENT_DATE_STRING,
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(partition.payments.length + 1).padStart(3, '0')}`,
      notes: `Membership Renewal (${plan?.name || 'Standard'})`,
    };

    // Renewal record
    const renewal: RenewalHistoryRecord = {
      id: `ren_${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      previousExpiry,
      newExpiry: newExpiryDate,
      planName: member.planName,
      amount,
      paymentMethod,
      renewalDate: CURRENT_DATE_STRING,
    };

    partition.members[idx] = member;
    partition.payments.unshift(payment);
    partition.renewals.unshift(renewal);
    this.savePartition(gymId, partition);

    return { member, payment, renewal };
  },

  deleteMember(gymId: string, memberId: string) {
    const partition = this.getPartition(gymId);
    partition.members = partition.members.filter((m) => m.id !== memberId);
    this.savePartition(gymId, partition);
  },

  // Plan CRUD
  addPlan(gymId: string, plan: Omit<MembershipPlan, 'id' | 'gymId'>): MembershipPlan {
    const partition = this.getPartition(gymId);
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      gymId,
    };
    partition.plans.push(newPlan);
    this.savePartition(gymId, partition);
    return newPlan;
  },

  updatePlan(gymId: string, planId: string, updates: Partial<MembershipPlan>): MembershipPlan | null {
    const partition = this.getPartition(gymId);
    const idx = partition.plans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;
    partition.plans[idx] = { ...partition.plans[idx], ...updates };
    this.savePartition(gymId, partition);
    return partition.plans[idx];
  },

  deletePlan(gymId: string, planId: string) {
    const partition = this.getPartition(gymId);
    partition.plans = partition.plans.filter((p) => p.id !== planId);
    this.savePartition(gymId, partition);
  },

  // Backup & Restore
  exportPartitionJSON(gymId: string): string {
    const partition = this.getPartition(gymId);
    return JSON.stringify(partition, null, 2);
  },

  importPartitionJSON(gymId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.gym || !Array.isArray(parsed.members) || !Array.isArray(parsed.plans)) {
        throw new Error('Invalid partition backup structure.');
      }
      this.savePartition(gymId, parsed);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },
};
