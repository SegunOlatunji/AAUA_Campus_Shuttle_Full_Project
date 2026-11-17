import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, database, firebaseConfig } from '../lib/firebase';
import type { DriverProfile } from '../lib/types/driver';

interface DriverAuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: DriverProfile | null;
  initializing: boolean;
  requestOtp: (phone: string, fullName: string) => Promise<void>;
  confirmOtp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextValue | undefined>(undefined);

export function DriverAuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Not component state on purpose: a fresh confirmationResult/pending name
  // is only ever needed transiently between requestOtp() and confirmOtp(),
  // and refs avoid a stray re-render mid-flow.
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const pendingNameRef = useRef<string>('');
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      const snapshot = await get(ref(database, `users/drivers/${user.uid}`));
      if (!snapshot.exists()) {
        // Verified phone number but no driver record — shouldn't normally
        // happen since confirmOtp() creates the record, but guard anyway.
        setFirebaseUser(null);
        setProfile(null);
        setInitializing(false);
        return;
      }

      setFirebaseUser(user);
      setProfile(snapshot.val() as DriverProfile);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const requestOtp = async (phone: string, fullName: string) => {
    if (!recaptchaVerifier.current) {
      throw new Error('Verification is not ready yet. Please try again.');
    }
    pendingNameRef.current = fullName.trim();
    confirmationRef.current = await signInWithPhoneNumber(auth, phone.trim(), recaptchaVerifier.current);
  };

  const confirmOtp = async (code: string) => {
    if (!confirmationRef.current) {
      throw new Error('Request a verification code first.');
    }

    const result = await confirmationRef.current.confirm(code);
    const uid = result.user.uid;

    const existing = await get(ref(database, `users/drivers/${uid}`));

    if (!existing.exists()) {
      // First-time verification: create a pending driver record. It cannot
      // go online or write shuttle data until an admin approves it — see
      // Addendum 1, Section 2 and the Security Rules in database.rules.json.
      const newProfile: DriverProfile = {
        uid,
        phone: result.user.phoneNumber ?? '',
        fullName: pendingNameRef.current,
        approvalStatus: 'pending',
        assignedShuttleId: null,
        status: 'offline',
        createdAt: Date.now(),
      };
      await set(ref(database, `users/drivers/${uid}`), newProfile);
      setProfile(newProfile);
    } else {
      setProfile(existing.val() as DriverProfile);
    }

    setFirebaseUser(result.user);
    confirmationRef.current = null;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <DriverAuthContext.Provider
      value={{ firebaseUser, profile, initializing, requestOtp, confirmOtp, logout }}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification
      />
      {children}
    </DriverAuthContext.Provider>
  );
}

export function useDriverAuth(): DriverAuthContextValue {
  const context = useContext(DriverAuthContext);
  if (!context) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
}
