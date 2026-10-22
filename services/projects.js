import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { AppError } from "@/lib/errors";
import { guardedWrite } from "@/lib/network";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { findUserByEmail } from "./users";

const BATCH_SIZE = 400; // Firestore allows 500 operations per batch

const toProject = (snap) => ({ id: snap.id, ...snap.data() });

/** Live list of projects the user owns or belongs to (the owner is always in memberIds). */
export function subscribeToUserProjects(uid, onData, onError) {
  const { db } = getFirebase();
  const q = query(collection(db, "projects"), where("memberIds", "array-contains", uid));
  return onSnapshot(
    q,
    (snap) => {
      const projects = snap.docs.map(toProject);
      projects.sort((a, b) => a.name.localeCompare(b.name));
      onData(projects);
    },
    onError
  );
}

/** Live single project. onData receives a project object, or null when it does not exist. */
export function subscribeToProject(projectId, onData, onError) {
  const { db } = getFirebase();
  return onSnapshot(
    doc(db, "projects", projectId),
    (snap) => onData(snap.exists() ? toProject(snap) : null),
    onError
  );
}

/** FR-05: creates a project owned by `user`. Returns the new project id. */
export async function createProject(user, { name, description }) {
  const { db } = getFirebase();
  const ref = await guardedWrite(() =>
    addDoc(collection(db, "projects"), {
      name: name.trim(),
      description: (description ?? "").trim(),
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return ref.id;
}

/** FR-06: owner-only (enforced by Firestore rules). */
export async function updateProject(projectId, { name, description }) {
  const { db } = getFirebase();
  await guardedWrite(() =>
    updateDoc(doc(db, "projects", projectId), {
      name: name.trim(),
      description: (description ?? "").trim(),
      updatedAt: serverTimestamp(),
    })
  );
}

/**
 * Deleting a project: Firestore does not delete sub-collections automatically, so we first
 * delete every task in batches and only then the project document (documented strategy).
 * The project is deleted last so that, if anything fails midway, the owner can simply retry.
 */
export async function deleteProject(projectId) {
  const { db } = getFirebase();
  const tasksSnap = await getDocs(collection(db, "projects", projectId, "tasks"));
  for (let i = 0; i < tasksSnap.docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    tasksSnap.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
    await guardedWrite(() => batch.commit());
  }
  await guardedWrite(() => deleteDoc(doc(db, "projects", projectId)));
}

/** FR-07: add an existing registered user by email; duplicates are rejected. */
export async function addMemberByEmail(project, email) {
  const { db } = getFirebase();
  if (!isValidEmail(email)) throw new AppError("invalid-email", "Enter a valid email address.");

  const found = await findUserByEmail(email);
  if (!found) {
    throw new AppError(
      "user-not-found",
      `No registered user found for ${normalizeEmail(email)}. Ask them to register first.`
    );
  }
  if (project.memberIds.includes(found.uid)) {
    throw new AppError("duplicate-member", `${found.displayName} is already a member of this project.`);
  }

  await guardedWrite(() =>
    updateDoc(doc(db, "projects", project.id), {
      memberIds: arrayUnion(found.uid),
      updatedAt: serverTimestamp(),
    })
  );
  return found;
}

/**
 * Removes a member and revokes their access. Their tasks are unassigned first
 * (business rule section 13). The owner cannot be removed.
 */
export async function removeMember(project, uid) {
  const { db } = getFirebase();
  if (uid === project.ownerId) {
    throw new AppError(
      "owner-required",
      "The owner cannot be removed from the project. Delete the project instead (ownership transfer is out of scope)."
    );
  }

  const assigned = await getDocs(
    query(collection(db, "projects", project.id, "tasks"), where("assigneeId", "==", uid))
  );
  for (let i = 0; i < assigned.docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    assigned.docs.slice(i, i + BATCH_SIZE).forEach((d) =>
      batch.update(d.ref, { assigneeId: null, updatedAt: serverTimestamp() })
    );
    await guardedWrite(() => batch.commit());
  }

  await guardedWrite(() =>
    updateDoc(doc(db, "projects", project.id), {
      memberIds: arrayRemove(uid),
      updatedAt: serverTimestamp(),
    })
  );
}
