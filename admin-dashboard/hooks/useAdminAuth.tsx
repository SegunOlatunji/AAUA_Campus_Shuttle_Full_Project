'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import type { AdminProfile } from '../lib/types/admin';

interface AdminAuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: AdminProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      // Same role-lookup guard as the mobile apps (Phase 2, Section 5):
      // admins are provisioned manually, never self-registered, so this
      // path either exists or the login is rejected outright.
      const snapshot = await get(ref(database, `users/admins/${user.uid}`));
      if (!snapshot.exists()) {
        await signOut(auth);
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      setFirebaseUser(user);
      setProfile(snapshot.val() as AdminProfile);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AdminAuthContext.Provider value={{ firebaseUser, profile, initializing, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
