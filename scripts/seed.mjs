// Seeds the demo data from Appendix A of the SRS using the normal Firebase client SDK,
// so every write goes through the real Firestore security rules.
//
//   npm run seed        (reads .env.local; requires Email/Password auth enabled in Firebase)
//
// Creates:  owner@example.test (Owner) and member@example.test (Member), password below,
//           project "Website Redesign" with the four sample tasks. Safe to run twice.
// These are FICTIONAL demo accounts - never use real personal data.

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const DEMO_PASSWORD = "Demo12345";
const OWNER = { email: "owner@example.test", displayName: "Demo Owner" };
const MEMBER = { email: "member@example.test", displayName: "Demo Member" };
const PROJECT_NAME = "Website Redesign";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (!config.apiKey || !config.projectId || !config.appId) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_* variables. Create .env.local first (see .env.example).");
  process.exit(1);
}

const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Signs in (creating the account the first time) and makes sure the profile document exists. */
async function ensureUser({ email, displayName }) {
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, email, DEMO_PASSWORD);
    await updateProfile(cred.user, { displayName });
    console.log(`created account ${email}`);
  } catch (error) {
    if (error.code !== "auth/email-already-in-use") throw error;
    cred = await signInWithEmailAndPassword(auth, email, DEMO_PASSWORD);
    console.log(`account ${email} already exists`);
  }
  const profileRef = doc(db, "users", cred.user.uid);
  if (!(await getDoc(profileRef)).exists()) {
    await setDoc(profileRef, { displayName, email, createdAt: serverTimestamp() });
  }
  return cred.user.uid;
}

// 1. Member account first (so the owner can add them by UID).
const memberUid = await ensureUser(MEMBER);
await signOut(auth);

// 2. Owner creates the project, adds the member and the sample tasks.
const ownerUid = await ensureUser(OWNER);

const existing = await getDocs(query(collection(db, "projects"), where("memberIds", "array-contains", ownerUid)));
if (existing.docs.some((d) => d.data().name === PROJECT_NAME && d.data().ownerId === ownerUid)) {
  console.log(`project "${PROJECT_NAME}" already exists - nothing more to do`);
} else {
  const projectRef = await addDoc(collection(db, "projects"), {
    name: PROJECT_NAME,
    description: "Demo project: redesign of the company website (fictional data).",
    ownerId: ownerUid,
    memberIds: [ownerUid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(projectRef, { memberIds: arrayUnion(memberUid), updatedAt: serverTimestamp() });

  const tasks = [
    { title: "Build navbar", status: "in_progress", priority: "high", assigneeId: memberUid, dueDate: dateOffset(5), description: "Responsive navigation bar with a mobile menu." },
    { title: "Create login page", status: "todo", priority: "medium", assigneeId: ownerUid, dueDate: dateOffset(7), description: "" },
    { title: "Test responsive layout", status: "done", priority: "low", assigneeId: memberUid, dueDate: null, description: "Check 375px, 768px and 1280px." },
    { title: "Fix overdue bug", status: "todo", priority: "high", assigneeId: memberUid, dueDate: dateOffset(-1), description: "Intentionally overdue (due yesterday) to demonstrate the overdue rule." },
  ];
  for (const task of tasks) {
    await addDoc(collection(db, "projects", projectRef.id, "tasks"), {
      ...task,
      createdBy: ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log(`created project "${PROJECT_NAME}" with ${tasks.length} tasks`);
}

await signOut(auth);
console.log(`\nDemo logins (password: ${DEMO_PASSWORD})\n  Owner : ${OWNER.email}\n  Member: ${MEMBER.email}`);
process.exit(0);
