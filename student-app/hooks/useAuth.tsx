import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import type { StudentProfile } from '../lib/types/user';
import type { RegisterFormData } from '../lib/validators/auth';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: StudentProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      // Role-lookup guard (Phase 2, Section 5): a valid Firebase Auth session
      // is not enough — this app only proceeds if a matching student record
      // exists. This stops a driver's or admin's credentials, if somehow
      // entered here, from granting access to the Student app.
      const snapshot = await get(ref(database, `users/students/${user.uid}`));
      if (!snapshot.exists()) {
        await signOut(auth);
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      const studentProfile = snapshot.val() as StudentProfile;
      if (studentProfile.isActive === false) {
        // Deactivated by an admin (Module 5, Students page) — same
        // treatment as an unrecognized account: sign out immediately.
        await signOut(auth);
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      setFirebaseUser(user);
      setProfile(studentProfile);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const snapshot = await get(ref(database, `users/students/${credential.user.uid}`));
    if (snapshot.exists() && (snapshot.val() as StudentProfile).isActive === false) {
      await signOut(auth);
      throw new Error('account-deactivated');
    }
  };

  const register = async (data: RegisterFormData) => {
    const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);

    const newProfile: StudentProfile = {
      uid: credential.user.uid,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      matricNumber: data.matricNumber.trim(),
      phone: data.phone.trim(),
      createdAt: Date.now(),
    };

    await set(ref(database, `users/students/${credential.user.uid}`), newProfile);
    setProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, initializing, login, register, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
