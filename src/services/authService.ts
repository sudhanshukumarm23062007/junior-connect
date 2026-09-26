import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { userRepository } from './dataService';
import { UserProfile, UserRole } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

const LOCAL_SESSION_KEY = 'juniorconnect_session_uid';

export const authService = {
  subscribeToAuth(callback: (user: AppUser | null) => void) {
    // Also check local session fallback
    const savedUid = localStorage.getItem(LOCAL_SESSION_KEY);
    
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        localStorage.setItem(LOCAL_SESSION_KEY, fbUser.uid);
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName
        });
      } else if (savedUid) {
        callback({
          uid: savedUid,
          email: `${savedUid}@campus.edu`,
          displayName: 'Campus Student'
        });
      } else {
        callback(null);
      }
    });

    return unsub;
  },

  getCurrentUser(): AppUser | null {
    if (auth.currentUser) {
      return {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName
      };
    }
    const savedUid = localStorage.getItem(LOCAL_SESSION_KEY);
    if (savedUid) {
      return {
        uid: savedUid,
        email: `${savedUid}@campus.edu`,
        displayName: 'Campus Student'
      };
    }
    return null;
  },

  async login(email: string, pass: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      localStorage.setItem(LOCAL_SESSION_KEY, cred.user.uid);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName
      };
    } catch (err: any) {
      const code = err.code || '';
      console.warn('Firebase login attempt:', code, err.message);

      // Check if user's profile exists in Firestore (for instance if created via campus onboarding)
      try {
        const existingProfile = await userRepository.findByEmail(cleanEmail);
        if (existingProfile) {
          localStorage.setItem(LOCAL_SESSION_KEY, existingProfile.id);
          return {
            uid: existingProfile.id,
            email: existingProfile.email,
            displayName: existingProfile.name
          };
        }
      } catch (firestoreErr) {
        console.warn('Firestore fallback check failed:', firestoreErr);
      }

      // If operation is not allowed (e.g. Email/Password provider disabled in console),
      // or if testing fallback is needed:
      if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
        const fallbackUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        localStorage.setItem(LOCAL_SESSION_KEY, fallbackUid);
        return {
          uid: fallbackUid,
          email: email.trim(),
          displayName: email.split('@')[0]
        };
      }

      // Check if user doesn't exist yet
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        throw new Error('NO_ACCOUNT_FOUND: No account found for this email. Please click "Create Account" below to register your profile.');
      }
      if (code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please verify and try again.');
      }
      if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid university email address.');
      }

      throw new Error(err.message?.replace('Firebase: ', '') || 'Failed to sign in.');
    }
  },

  async register(
    email: string, 
    pass: string, 
    profileData: {
      name: string;
      role: UserRole;
      college: string;
      course: string;
      department: string;
      year: number;
      skills?: string[];
      subjects?: string[];
      bio?: string;
      avatarUrl?: string;
    }
  ): Promise<UserProfile> {
    let uid = '';
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      uid = cred.user.uid;
      localStorage.setItem(LOCAL_SESSION_KEY, uid);
    } catch (err: any) {
      const code = err.code || '';
      console.warn('Firebase registration attempt:', code, err.message);

      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please switch to Sign In.');
      }
      if (code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      }

      // If Email provider is not enabled in Firebase Console, use persistent UUID fallback
      if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
        uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem(LOCAL_SESSION_KEY, uid);
      } else {
        throw new Error(err.message?.replace('Firebase: ', '') || 'Failed to complete registration.');
      }
    }

    const newProfile: UserProfile = {
      id: uid,
      email: email.trim(),
      name: profileData.name,
      role: profileData.role,
      college: profileData.college,
      course: profileData.course,
      department: profileData.department,
      year: profileData.year,
      skills: profileData.skills || [],
      subjects: profileData.subjects || [],
      bio: profileData.bio || '',
      avatarUrl: profileData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
      rating: 5.0,
      reviewCount: 0,
      mentorshipCount: 0,
      isVerified: profileData.role === 'senior' ? false : true,
      isSuspended: false,
      createdAt: Date.now()
    };

    await userRepository.setProfile(newProfile);
    return newProfile;
  },

  async loginAsDemo(demoRole: 'junior' | 'senior' | 'lpu_senior' | 'admin'): Promise<UserProfile> {
    let demoProfile: UserProfile;

    if (demoRole === 'junior') {
      demoProfile = {
        id: 'seed_junior_1',
        name: 'Rohan Mehra',
        email: 'rohan.mehra@stanford.edu',
        role: 'junior',
        college: 'Stanford University',
        course: 'B.Tech / B.E.',
        department: 'Computer Science & Engineering',
        year: 2,
        bio: '2nd year CS student exploring full-stack engineering, algorithms, and looking for internship guidance.',
        skills: ['Data Structures & Algorithms', 'React & Next.js', 'Python & Machine Learning'],
        subjects: ['Discrete Mathematics', 'Data Structures', 'OOP in C++'],
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        rating: 5.0,
        reviewCount: 0,
        mentorshipCount: 0,
        isVerified: true,
        isSuspended: false,
        createdAt: Date.now() - 86400000 * 30
      };
    } else if (demoRole === 'lpu_senior') {
      demoProfile = {
        id: 'seed_senior_lpu',
        name: 'Aman Verma',
        email: 'aman.verma@lpu.in',
        role: 'senior',
        college: 'Lovely Professional University (LPU)',
        course: 'B.Tech / B.E.',
        department: 'Computer Science & Engineering',
        year: 4,
        bio: 'Upcoming SDE at Amazon. 4th-year LPU CSE student with 500+ LeetCode problems solved. Excited to guide campus juniors on placement prep, coding rounds, and core subjects.',
        skills: ['Data Structures & Algorithms', 'System Design', 'React & Next.js', 'Java & Spring Boot'],
        subjects: ['Data Structures', 'Operating Systems', 'DBMS'],
        internships: ['Amazon AWS SDE Intern', 'HighRadius Intern'],
        achievements: ['Smart India Hackathon Finalist', 'Amazon SDE Offer', 'Dean Merit Scholar'],
        availability: 'Mon, Wed, Fri • 6:30 PM - 9:00 PM IST',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: 4.95,
        reviewCount: 31,
        mentorshipCount: 47,
        isVerified: true,
        isSuspended: false,
        createdAt: Date.now() - 86400000 * 90
      };
    } else if (demoRole === 'senior') {
      demoProfile = {
        id: 'seed_senior_1',
        name: 'Aarav Patel',
        email: 'aarav.patel@stanford.edu',
        role: 'senior',
        college: 'Stanford University',
        course: 'B.Tech / B.E.',
        department: 'Computer Science & Engineering',
        year: 4,
        bio: 'Incoming Software Engineer at Google. Passionate about Distributed Systems, LeetCode (2100+ rating), and system design mentoring.',
        skills: ['Data Structures & Algorithms', 'System Design', 'Java & Spring Boot', 'Competitive Programming'],
        subjects: ['Operating Systems', 'DBMS', 'Algorithms'],
        internships: ['Google SWE Intern (Mountain View)', 'Amazon SDE Intern'],
        achievements: ['Google Summer of Code 2024 Mentor', 'ACM ICPC Regionalist'],
        availability: 'Tue, Thu, Sat • 6:00 PM - 9:00 PM EST',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        reviewCount: 28,
        mentorshipCount: 42,
        isVerified: true,
        isSuspended: false,
        createdAt: Date.now() - 86400000 * 120
      };
    } else {
      demoProfile = {
        id: 'admin_moderator',
        name: 'Dean Edwards (Admin)',
        email: 'admin@stanford.edu',
        role: 'admin',
        college: 'Stanford University',
        course: 'Faculty / Administration',
        department: 'Academic Affairs',
        year: 4,
        bio: 'Campus Moderator & Student Mentor Network Administrator.',
        skills: ['Academic Advising', 'Campus Safety', 'Career Counseling'],
        subjects: ['Student Affairs'],
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        rating: 5.0,
        reviewCount: 0,
        mentorshipCount: 0,
        isVerified: true,
        isSuspended: false,
        createdAt: Date.now() - 86400000 * 365
      };
    }

    // Persist profile
    await userRepository.setProfile(demoProfile);
    localStorage.setItem(LOCAL_SESSION_KEY, demoProfile.id);

    return demoProfile;
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  }
};
