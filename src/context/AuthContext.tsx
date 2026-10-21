import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { dbService } from '../services/db';
import { DEFAULT_STUDENTS } from '../data/defaultData';

export const ADMIN_EMAIL = 'henriquebiala7@gmail.com';

export function calculateLevel(xp: number): string {
  if (xp >= 1800) return 'Mestre Digital';
  if (xp >= 1100) return 'Utilizador Competente';
  if (xp >= 600) return 'Aprendiz Informático';
  if (xp >= 250) return 'Explorador Digital';
  return 'Iniciante Digital';
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  isStudent: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  loginWithGoogle: () => Promise<void>;
  loginAsStudent: (studentUid: string) => void;
  loginAsAdminDemo: () => void;
  logout: () => Promise<void>;
  updateUserXpAndStreak: (earnedXp: number, passed: boolean) => Promise<void>;
  loseHeart: () => void;
  refillHearts: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('amef_theme') === 'dark';
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('amef_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('amef_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Initial load & Firebase Auth listener
  useEffect(() => {
    const init = async () => {
      await testConnection();
      await dbService.initDatabase();

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const email = firebaseUser.email || '';
          const isUserAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          const profile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Utilizador AMEF',
            email: email,
            role: isUserAdmin ? 'admin' : 'student',
            status: 'active',
            avatar: isUserAdmin ? '👨🏽‍🏫' : '🧑🏾‍💻',
            xp: isUserAdmin ? 2500 : 150,
            level: isUserAdmin ? 'Mestre Digital' : 'Iniciante Digital',
            streakDays: 1,
            lastActiveDate: 'Hoje',
            badges: isUserAdmin ? ['badge-first-step', 'badge-shortcut-ace', 'badge-explorer'] : ['badge-first-step'],
            hearts: 5,
            createdAt: new Date().toISOString(),
          };

          // Save to Firestore users
          await dbService.saveStudent(profile);
          setCurrentUser(profile);
        } else {
          // If no active Firebase user, check if we had a saved local demo session or default to the primary student
          const savedUid = localStorage.getItem('amef_active_user_uid');
          if (savedUid) {
            const students = await dbService.getStudents();
            const found = students.find(s => s.uid === savedUid);
            if (found) {
              setCurrentUser(found);
              setLoading(false);
              return;
            }
          }
          // Default start in demo with Aluno Manuel Domingos so application is immediately playable!
          setCurrentUser(DEFAULT_STUDENTS[0]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    init().catch(console.error);
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar com a Google.';
      setError(msg);
    }
  };

  const loginAsStudent = async (studentUid: string) => {
    setError(null);
    const students = await dbService.getStudents();
    const student = students.find(s => s.uid === studentUid) || DEFAULT_STUDENTS.find(s => s.uid === studentUid);
    if (student) {
      setCurrentUser(student);
      localStorage.setItem('amef_active_user_uid', student.uid);
    }
  };

  const loginAsAdminDemo = () => {
    setError(null);
    const adminUser: UserProfile = {
      uid: 'admin-henrique-amef',
      name: 'Henrique Biala (Admin)',
      email: ADMIN_EMAIL,
      role: 'admin',
      status: 'active',
      avatar: '👨🏽‍🏫',
      xp: 3200,
      level: 'Mestre Digital',
      streakDays: 14,
      lastActiveDate: 'Hoje',
      badges: ['badge-first-step', 'badge-shortcut-ace', 'badge-streak-fire', 'badge-explorer', 'badge-office-hero', 'badge-cyber-shield'],
      hearts: 5,
      createdAt: '2026-10-01T00:00:00Z',
    };
    setCurrentUser(adminUser);
    localStorage.setItem('amef_active_user_uid', adminUser.uid);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    localStorage.removeItem('amef_active_user_uid');
    // Switch to first student default for continuous exploration
    setCurrentUser(DEFAULT_STUDENTS[0]);
  };

  const updateUserXpAndStreak = async (earnedXp: number, passed: boolean) => {
    if (!currentUser) return;
    const newXp = currentUser.xp + earnedXp;
    const newLevel = calculateLevel(newXp);
    const updated: UserProfile = {
      ...currentUser,
      xp: newXp,
      level: newLevel,
      streakDays: passed ? currentUser.streakDays + 1 : currentUser.streakDays,
      lastActiveDate: 'Hoje',
    };
    setCurrentUser(updated);
    localStorage.setItem('amef_active_user_uid', updated.uid);
    await dbService.saveStudent(updated);
  };

  const loseHeart = () => {
    if (!currentUser) return;
    const newHearts = Math.max(0, (currentUser.hearts ?? 5) - 1);
    const updated = { ...currentUser, hearts: newHearts };
    setCurrentUser(updated);
    dbService.saveStudent(updated);
  };

  const refillHearts = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, hearts: 5 };
    setCurrentUser(updated);
    dbService.saveStudent(updated);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isStudent = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isStudent,
        darkMode,
        toggleDarkMode,
        loginWithGoogle,
        loginAsStudent,
        loginAsAdminDemo,
        logout,
        updateUserXpAndStreak,
        loseHeart,
        refillHearts,
        loading,
        error,
        clearError: () => setError(null),
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
