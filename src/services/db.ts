import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ModuleItem,
  ActivityItem,
  AttemptRecord,
  UserProfile,
  BadgeItem,
} from '../types';
import {
  DEFAULT_MODULES,
  DEFAULT_ACTIVITIES,
  DEFAULT_BADGES,
  DEFAULT_STUDENTS,
} from '../data/defaultData';

const LOCAL_STORAGE_KEY_MODULES = 'amef_local_modules';
const LOCAL_STORAGE_KEY_ACTIVITIES = 'amef_local_activities';
const LOCAL_STORAGE_KEY_ATTEMPTS = 'amef_local_attempts';
const LOCAL_STORAGE_KEY_STUDENTS = 'amef_local_students';

// Memory/Local cache helpers for robust fallback
function getLocalCache<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota
  }
}

export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Seed Firestore collections with rich initial data if empty
   */
  public async initDatabase(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // Check if modules collection exists in Firestore
      const modSnap = await getDocs(collection(db, 'modules'));
      if (modSnap.empty) {
        console.log('Seeding initial modules into Firestore...');
        for (const mod of DEFAULT_MODULES) {
          await setDoc(doc(db, 'modules', mod.id), mod);
        }
      }

      // Check activities
      const actSnap = await getDocs(collection(db, 'activities'));
      if (actSnap.empty) {
        console.log('Seeding initial activities into Firestore...');
        for (const act of DEFAULT_ACTIVITIES) {
          await setDoc(doc(db, 'activities', act.id), act);
        }
      }

      // Check badges
      const badgeSnap = await getDocs(collection(db, 'badges'));
      if (badgeSnap.empty) {
        for (const badge of DEFAULT_BADGES) {
          await setDoc(doc(db, 'badges', badge.id), badge);
        }
      }

      // Check students
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        for (const std of DEFAULT_STUDENTS) {
          await setDoc(doc(db, 'users', std.uid), std);
        }
      }
    } catch (err) {
      console.warn('Firestore initialization notice (falling back gracefully to local/cached data):', err);
      // Ensure local cache has seed data
      if (!localStorage.getItem(LOCAL_STORAGE_KEY_MODULES)) {
        setLocalCache(LOCAL_STORAGE_KEY_MODULES, DEFAULT_MODULES);
      }
      if (!localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES)) {
        setLocalCache(LOCAL_STORAGE_KEY_ACTIVITIES, DEFAULT_ACTIVITIES);
      }
      if (!localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS)) {
        setLocalCache(LOCAL_STORAGE_KEY_STUDENTS, DEFAULT_STUDENTS);
      }
    }
  }

  // --- MODULES ---
  public async getModules(): Promise<ModuleItem[]> {
    try {
      const q = query(collection(db, 'modules'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => d.data() as ModuleItem);
        setLocalCache(LOCAL_STORAGE_KEY_MODULES, list);
        return list;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'modules');
    }
    return getLocalCache(LOCAL_STORAGE_KEY_MODULES, DEFAULT_MODULES);
  }

  public async saveModule(mod: ModuleItem): Promise<void> {
    try {
      await setDoc(doc(db, 'modules', mod.id), mod);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `modules/${mod.id}`);
    }
    const current = await this.getModules();
    const idx = current.findIndex(m => m.id === mod.id);
    if (idx >= 0) {
      current[idx] = mod;
    } else {
      current.push(mod);
    }
    setLocalCache(LOCAL_STORAGE_KEY_MODULES, current);
  }

  public async deleteModule(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'modules', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `modules/${id}`);
    }
    const current = (await this.getModules()).filter(m => m.id !== id);
    setLocalCache(LOCAL_STORAGE_KEY_MODULES, current);
  }

  // --- ACTIVITIES ---
  public async getActivities(moduleId?: string): Promise<ActivityItem[]> {
    try {
      const snap = await getDocs(collection(db, 'activities'));
      if (!snap.empty) {
        let list = snap.docs.map(d => d.data() as ActivityItem);
        setLocalCache(LOCAL_STORAGE_KEY_ACTIVITIES, list);
        if (moduleId) {
          list = list.filter(a => a.moduleId === moduleId);
        }
        return list.sort((a, b) => a.order - b.order);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'activities');
    }
    let cached = getLocalCache<ActivityItem[]>(LOCAL_STORAGE_KEY_ACTIVITIES, DEFAULT_ACTIVITIES);
    if (moduleId) {
      cached = cached.filter(a => a.moduleId === moduleId);
    }
    return cached.sort((a, b) => a.order - b.order);
  }

  public async getActivityById(id: string): Promise<ActivityItem | null> {
    try {
      const snap = await getDoc(doc(db, 'activities', id));
      if (snap.exists()) {
        return snap.data() as ActivityItem;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `activities/${id}`);
    }
    const all = await this.getActivities();
    return all.find(a => a.id === id) || null;
  }

  public async saveActivity(act: ActivityItem): Promise<void> {
    try {
      await setDoc(doc(db, 'activities', act.id), act);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `activities/${act.id}`);
    }
    const current = await this.getActivities();
    const idx = current.findIndex(a => a.id === act.id);
    if (idx >= 0) {
      current[idx] = act;
    } else {
      current.push(act);
    }
    setLocalCache(LOCAL_STORAGE_KEY_ACTIVITIES, current);
  }

  public async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `activities/${id}`);
    }
    const current = (await this.getActivities()).filter(a => a.id !== id);
    setLocalCache(LOCAL_STORAGE_KEY_ACTIVITIES, current);
  }

  // --- ATTEMPTS & PROGRESS ---
  public async getAttempts(userId?: string): Promise<AttemptRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'attempts'));
      if (!snap.empty) {
        let list = snap.docs.map(d => d.data() as AttemptRecord);
        setLocalCache(LOCAL_STORAGE_KEY_ATTEMPTS, list);
        if (userId) {
          list = list.filter(r => r.userId === userId);
        }
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'attempts');
    }
    let cached = getLocalCache<AttemptRecord[]>(LOCAL_STORAGE_KEY_ATTEMPTS, []);
    if (userId) {
      cached = cached.filter(r => r.userId === userId);
    }
    return cached.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async recordAttempt(attempt: AttemptRecord): Promise<void> {
    try {
      await setDoc(doc(db, 'attempts', attempt.id), attempt);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `attempts/${attempt.id}`);
    }
    const current = await this.getAttempts();
    current.unshift(attempt);
    setLocalCache(LOCAL_STORAGE_KEY_ATTEMPTS, current);
  }

  // --- STUDENTS & USERS ---
  public async getStudents(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const list = snap.docs.map(d => d.data() as UserProfile);
        setLocalCache(LOCAL_STORAGE_KEY_STUDENTS, list);
        return list;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
    return getLocalCache(LOCAL_STORAGE_KEY_STUDENTS, DEFAULT_STUDENTS);
  }

  public async saveStudent(student: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', student.uid), student);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${student.uid}`);
    }
    const current = await this.getStudents();
    const idx = current.findIndex(s => s.uid === student.uid);
    if (idx >= 0) {
      current[idx] = student;
    } else {
      current.push(student);
    }
    setLocalCache(LOCAL_STORAGE_KEY_STUDENTS, current);
  }

  public async updateStudentStatus(uid: string, status: 'active' | 'suspended'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
    const current = await this.getStudents();
    const s = current.find(item => item.uid === uid);
    if (s) {
      s.status = status;
      setLocalCache(LOCAL_STORAGE_KEY_STUDENTS, current);
    }
  }

  public async deleteStudent(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    }
    const current = (await this.getStudents()).filter(s => s.uid !== uid);
    setLocalCache(LOCAL_STORAGE_KEY_STUDENTS, current);
  }

  // --- BADGES ---
  public async getBadges(): Promise<BadgeItem[]> {
    try {
      const snap = await getDocs(collection(db, 'badges'));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as BadgeItem);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'badges');
    }
    return DEFAULT_BADGES;
  }
}

export const dbService = DatabaseService.getInstance();
