'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  userEmail: string;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithToken: (token: string, email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  ownerEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        let email = currentUser.email || '';
        if (!email) {
          try {
            const tokenResult = await currentUser.getIdTokenResult();
            email = (tokenResult.claims.email as string) || '';
          } catch (err: unknown) {
            console.warn('[Auth] Failed to retrieve email claim from token:', err);
          }
        }
        setUserEmail(email);
        setUser(currentUser);
        setLoading(false);
      } else {
        setUser(null);
        setUserEmail('');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithToken = async (token: string, email?: string) => {
    if (email) setUserEmail(email);
    await signInWithCustomToken(auth, token);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const effectiveEmail = userEmail || user?.email || '';
  const isOwner = Boolean(
    effectiveEmail && ownerEmail && effectiveEmail.toLowerCase() === ownerEmail.toLowerCase(),
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userEmail,
        loading,
        signInWithGoogle,
        signInWithToken,
        signOut,
        isOwner,
        ownerEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
