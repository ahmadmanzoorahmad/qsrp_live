import React, { createContext, useContext, useState, useEffect } from 'react';
import { userDB, type User, type UserRole, initDB, seedDatabase, resetDemoData, DEMO_USERS } from '../data/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAs: (userId: string) => Promise<void>;
  logout: () => void;
  register: (email: string, name: string, password: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  setDemoMode: (val: boolean) => void;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<void>;
  addUser: (data: { name: string; email: string; password: string; role: UserRole; ministry?: string; designation?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initDB();
        await seedDatabase();

        const storedDemoMode = localStorage.getItem('qsrp_demo_mode');
        setIsDemoMode(storedDemoMode !== 'false');

        const storedUserId = localStorage.getItem('qsrp_user_id');
        if (storedUserId) {
          const userData = await userDB.getById(storedUserId);
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('qsrp_user_id');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem('qsrp_demo_mode', val ? 'true' : 'false');
  };

  const login = async (email: string, password: string) => {
    const userData = await userDB.getByEmail(email);

    if (!userData) {
      throw new Error('No account found with this email address.');
    }

    if (userData.isActive === false) {
      throw new Error('This account has been disabled by an administrator.');
    }

    // Live users (with password field) always require correct password
    if (userData.password) {
      if (userData.password !== password) {
        throw new Error('Incorrect password. Please check your credentials.');
      }
    } else if (!isDemoMode) {
      // In live mode, demo users without passwords cannot login
      throw new Error('This account requires demo mode to be active, or use a live credential account.');
    }
    // In demo mode, users without a password field may use any password

    setUser(userData);
    localStorage.setItem('qsrp_user_id', userData.id);
  };

  const loginAs = async (userId: string) => {
    const userData = await userDB.getById(userId);
    if (!userData) throw new Error('User not found');
    if (userData.isActive === false) throw new Error('This account is disabled');
    setUser(userData);
    localStorage.setItem('qsrp_user_id', userData.id);
  };

  const loginWithGoogle = async () => {
    const demoUser: User = {
      id: `user-google-${Date.now()}`,
      email: `user${Date.now()}@gmail.com`,
      name: 'Google User',
      role: 'public',
      isDemo: isDemoMode,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    try { await userDB.add(demoUser); } catch { /* already exists */ }
    setUser(demoUser);
    localStorage.setItem('qsrp_user_id', demoUser.id);
  };

  const register = async (email: string, name: string, _password: string) => {
    const existingUser = await userDB.getByEmail(email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'public',
      isDemo: isDemoMode,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await userDB.add(newUser);
    setUser(newUser);
    localStorage.setItem('qsrp_user_id', newUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qsrp_user_id');
  };

  const resetDemo = async () => {
    logout();
    await resetDemoData();
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    const userData = await userDB.getById(userId);
    if (!userData) throw new Error('User not found');
    const updated = { ...userData, role };
    await userDB.update(updated);
    if (user?.id === userId) setUser(updated);
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    const userData = await userDB.getById(userId);
    if (!userData) throw new Error('User not found');
    const updated = { ...userData, isActive };
    await userDB.update(updated);
    if (user?.id === userId && !isActive) logout();
  };

  const addUser = async (data: { name: string; email: string; password: string; role: UserRole; ministry?: string; designation?: string }) => {
    const existing = await userDB.getByEmail(data.email);
    if (existing) throw new Error('A user with this email already exists.');
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: data.email,
      name: data.name,
      role: data.role,
      ministry: data.ministry,
      designation: data.designation,
      password: data.password,
      isDemo: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await userDB.add(newUser);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isDemoMode,
      login, loginWithGoogle, loginAs, logout, register,
      resetDemo, setDemoMode, updateUserRole, toggleUserActive, addUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// ── Role Helpers ───────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  public: 'Submitter',
  ministry_reviewer: 'Ministry Reviewer',
  approver: 'Approver',
  legal_committee: 'Legal Committee',
  executive: 'Executive',
  auditor: 'Auditor',
  uploader: 'Uploader',
  admin: 'Admin (PDA)',
  super_admin: 'Super Admin',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  public: 'bg-slate-100 text-slate-700',
  ministry_reviewer: 'bg-blue-100 text-blue-700',
  approver: 'bg-purple-100 text-purple-700',
  legal_committee: 'bg-indigo-100 text-indigo-700',
  executive: 'bg-cyan-100 text-cyan-700',
  auditor: 'bg-teal-100 text-teal-700',
  uploader: 'bg-orange-100 text-orange-700',
  admin: 'bg-amber-100 text-amber-700',
  super_admin: 'bg-red-100 text-red-700',
};

export const canAccessMinistryDashboard = (role?: UserRole) =>
  ['ministry_reviewer', 'approver', 'legal_committee', 'executive', 'auditor', 'admin', 'super_admin'].includes(role || '');

export const canAccessAdminDashboard = (role?: UserRole) =>
  ['executive', 'auditor', 'admin', 'super_admin'].includes(role || '');

export const canManageRoles = (role?: UserRole) =>
  role === 'admin' || role === 'super_admin';

export const canManageDocuments = (role?: UserRole) =>
  ['uploader', 'admin', 'super_admin'].includes(role || '');

export const canReviewTickets = (role?: UserRole) =>
  ['ministry_reviewer', 'approver', 'legal_committee', 'admin', 'super_admin'].includes(role || '');

export const canApproveTickets = (role?: UserRole) =>
  ['approver', 'admin', 'super_admin'].includes(role || '');

export { DEMO_USERS };
