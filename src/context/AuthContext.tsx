import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { dbService } from '../services/db';

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
  loginWithStudentCredentials: (email: string) => Promise<boolean>;
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

          // Check if profile exists in database
          const students = await dbService.getStudents();
          const existing = students.find(s => s.uid === firebaseUser.uid || s.email.toLowerCase() === email.toLowerCase());

          const profile: UserProfile = existing
            ? { ...existing, email, role: isUserAdmin ? 'admin' : existing.role }
            : {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || (isUserAdmin ? 'Administrador Chefe' : 'Aluno AMEF'),
                email: email,
                role: isUserAdmin ? 'admin' : 'student',
                status: 'active',
                avatar: isUserAdmin ? '👨🏽‍🏫' : '🧑🏾‍💻',
                xp: isUserAdmin ? 3000 : 0,
                level: isUserAdmin ? 'Mestre Digital' : 'Iniciante Digital',
                streakDays: 1,
                lastActiveDate: 'Hoje',
                badges: isUserAdmin ? ['badge-first-step', 'badge-shortcut-ace', 'badge-explorer'] : [],
                hearts: 5,
                createdAt: new Date().toISOString(),
              };

          // Save to Firestore users
          await dbService.saveStudent(profile);
          setCurrentUser(profile);
          localStorage.setItem('amef_active_user_uid', profile.uid);
        } else {
          // Check if student logged in with local credential
          const savedUid = localStorage.getItem('amef_active_user_uid');
          if (savedUid) {
            const students = await dbService.getStudents();
            const found = students.find(s => s.uid === savedUid && s.status === 'active');
            if (found) {
              setCurrentUser(found);
              setLoading(false);
              return;
            }
          }
          // Not logged in -> must show Login Screen!
          setCurrentUser(null);
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
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setError(
          `O domínio "${domain}" ainda não está autorizado na Consola do Firebase. Adicione "${domain}" em: Authentication > Settings > Authorized Domains no projeto theta-grove-x01dl.`
        );
      } else if (errorObj?.code === 'auth/popup-closed-by-user') {
        setError(null);
      } else {
        const msg = err instanceof Error ? err.message : 'Falha ao autenticar com a Google.';
        setError(msg);
      }
    }
  };

  const loginWithStudentCredentials = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const students = await dbService.getStudents();
      const student = students.find(s => s.email.toLowerCase() === cleanEmail);

      if (!student) {
        setError('Nenhum aluno registado com este endereço de email. Solicite ao Administrador da AMEF a criação da sua conta.');
        return false;
      }

      if (student.status === 'suspended') {
        setError('Esta conta de aluno encontra-se temporariamente suspensa. Contacte a administração da Academia.');
        return false;
      }

      setCurrentUser(student);
      localStorage.setItem('amef_active_user_uid', student.uid);
      return true;
    } catch (err) {
      setError('Erro ao validar credenciais. Tente novamente.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    localStorage.removeItem('amef_active_user_uid');
    setCurrentUser(null);
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
        loginWithStudentCredentials,
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
