import React, { useState, useEffect } from 'react';
import { UserAccount, GymAccount } from './types';
import { storage } from './lib/storage';
import { AdminPortal } from './components/AdminPortal';
import { GymMaintainerPortal } from './components/GymMaintainerPortal';
import { LoginView } from './components/LoginView';

export default function App() {
  // Initialize storage seeds
  useEffect(() => {
    storage.init();
  }, []);

  const users = storage.getAllUsers();
  const gyms = storage.getAllGyms();

  // Current session state - starts at LOGIN on page load / refresh
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentGymId, setCurrentGymId] = useState<string>(gyms[0]?.id || 'gym_iron_01');
  
  // Current view: 'ADMIN' | 'MAINTAINER' | 'LOGIN' - starts on 'LOGIN'
  const [currentView, setCurrentView] = useState<'ADMIN' | 'MAINTAINER' | 'LOGIN'>('LOGIN');

  const handleLoginSuccess = (user: UserAccount, targetGymId?: string) => {
    setCurrentUser(user);
    if (user.role === 'SUPER_ADMIN') {
      setCurrentView('ADMIN');
    } else {
      if (targetGymId) {
        setCurrentGymId(targetGymId);
      } else if (user.gymId) {
        setCurrentGymId(user.gymId);
      }
      setCurrentView('MAINTAINER');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
  };

  const handleEnterGymPortal = (gymId: string) => {
    const maintainer = users.find((u) => u.gymId === gymId) || {
      id: `user_gym_${gymId}`,
      gymId,
      name: 'Gym Operator',
      email: 'maintainer@gym.com',
      phone: '9999999999',
      role: 'GYM_MAINTAINER' as const,
      status: 'Active' as const,
      createdAt: '2026-09-17',
    };
    setCurrentUser(maintainer);
    setCurrentGymId(gymId);
    setCurrentView('MAINTAINER');
  };

  const currentGym = gyms.find((g) => g.id === currentGymId) || gyms[0];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Main Content Router */}
      {currentView === 'LOGIN' && (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'ADMIN' && currentUser && (
        <AdminPortal
          currentAdmin={currentUser}
          onLogout={handleLogout}
          onEnterGymPortal={handleEnterGymPortal}
        />
      )}

      {currentView === 'MAINTAINER' && currentUser && (
        <GymMaintainerPortal
          currentGymId={currentGymId}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
