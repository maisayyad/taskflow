import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { guardedWrite } from "@/lib/network";
import { normalizeEmail } from "@/lib/validation";

/** FR-04: public profile only - display name, email and UID (the document id). No passwords. */
export async function createUserProfile(uid, { displayName, email }) {
  const { db } = getFirebase();
  await guardedWrite(() =>
    setDoc(doc(db, "users", uid), {
      displayName: displayName.trim(),
      email: normalizeEmail(email),
      createdAt: serverTimestamp(),
    })
  );
}

/** Repairs the profile if registration was interrupted after the Auth account was created. */
export async function ensureUserProfile(user) {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    await createUserProfile(user.uid, {
      displayName: user.displayName || (user.email ?? "User").split("@")[0],
      email: user.email ?? "",
    });
  }
}

/** Looks up a registered user by email. Returns { uid, displayName, email } or null. */
export async function findUserByEmail(email) {
  const { db } = getFirebase();
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", normalizeEmail(email)), limit(1))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...d.data() };
}

/** Loads profiles for a list of UIDs. Returns an object { [uid]: { displayName, email } }. */
export async function getProfiles(uids) {
  const { db } = getFirebase();
  const entries = await Promise.all(
    uids.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        return [uid, snap.exists() ? snap.data() : { displayName: "Unknown user", email: "" }];
      } catch {
        return [uid, { displayName: "Unknown user", email: "" }];
      }
    })
  );
  return Object.fromEntries(entries);
}
