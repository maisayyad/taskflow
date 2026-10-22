"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { createUserProfile, ensureUserProfile } from "@/services/users";
import { normalizeEmail } from "@/lib/validation";

const AuthContext = createContext(null);

const snapshotOf = (u) => ({ uid: u.uid, email: u.email, displayName: u.displayName || "" });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase persists the session (IndexedDB) so a refresh keeps the user signed in (US-02).
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }
    const { auth } = getFirebase();
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? snapshotOf(firebaseUser) : null);
      setLoading(false);
    });
  }, []);

  /** FR-01 / FR-04: creates the Auth account, then the public profile document. */
  const register = useCallback(async ({ name, email, password }) => {
    const { auth } = getFirebase();
    const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await createUserProfile(cred.user.uid, { displayName: name, email });
    setUser(snapshotOf(cred.user));
  }, []);

  /** FR-02 */
  const login = useCallback(async ({ email, password }) => {
    const { auth } = getFirebase();
    const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    await ensureUserProfile(cred.user).catch(() => {});
    setUser(snapshotOf(cred.user));
  }, []);

  const logout = useCallback(async () => {
    const { auth } = getFirebase();
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, configured: isFirebaseConfigured, register, login, logout }),
    [user, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
