import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AppUser } from '../services/authService';
import { userRepository, notificationRepository } from '../services/dataService';
import { UserProfile, InAppNotification } from '../types';

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  notifications: InAppNotification[];
  unreadNotificationCount: number;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: (role: 'junior' | 'senior' | 'lpu_senior' | 'admin') => Promise<void>;
  register: (
    email: string, 
    pass: string, 
    data: {
      name: string;
      role: 'junior' | 'senior';
      college: string;
      course: string;
      department: string;
      year: number;
      skills?: string[];
      subjects?: string[];
      bio?: string;
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const fetchProfile = async (uid: string, userHint?: AppUser) => {
    try {
      let p = await userRepository.getProfile(uid);
      if (!p) {
        // Auto-heal: If user is authenticated, create a default profile so the user is never in a broken ghost state
        const email = userHint?.email || `${uid}@campus.edu`;
        const autoProfile: UserProfile = {
          id: uid,
          email,
          name: userHint?.displayName || email.split('@')[0] || 'Campus Student',
          role: 'junior',
          college: 'Stanford University',
          course: 'B.Tech / B.E.',
          department: 'Computer Science & Engineering',
          year: 2,
          skills: ['Data Structures & Algorithms', 'Python & Machine Learning'],
          subjects: ['Data Structures', 'Operating Systems'],
          bio: 'Junior student eager to learn and connect with senior campus mentors.',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          rating: 5.0,
          reviewCount: 0,
          mentorshipCount: 0,
          isVerified: true,
          isSuspended: false,
          createdAt: Date.now()
        };
        await userRepository.setProfile(autoProfile);
        p = autoProfile;
      }
      setProfile(p);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    const unsub = authService.subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Notifications listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const unsub = notificationRepository.subscribe(user.uid, (notes) => {
      setNotifications(notes);
    });
    return () => unsub();
  }, [user]);

  const login = async (email: string, pass: string) => {
    const u = await authService.login(email, pass);
    setUser(u);
    await fetchProfile(u.uid, u);
  };

  const loginAsDemo = async (role: 'junior' | 'senior' | 'lpu_senior' | 'admin') => {
    const p = await authService.loginAsDemo(role);
    setUser({
      uid: p.id,
      email: p.email,
      displayName: p.name
    });
    setProfile(p);
  };

  const register = async (email: string, pass: string, data: any) => {
    const p = await authService.register(email, pass, data);
    setUser({
      uid: p.id,
      email: p.email,
      displayName: p.name
    });
    setProfile(p);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user);
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationRepository.markAsRead(id);
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        notifications,
        unreadNotificationCount,
        login,
        loginAsDemo,
        register,
        logout,
        refreshProfile,
        markNotificationRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
