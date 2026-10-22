import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { guardedWrite } from "@/lib/network";

const tasksRef = (db, projectId) => collection(db, "projects", projectId, "tasks");

/** Live list of a project's tasks. Filtering/search/sorting happen client-side (section 10.2). */
export function subscribeToTasks(projectId, onData, onError) {
  const { db } = getFirebase();
  return onSnapshot(
    tasksRef(db, projectId),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

const clean = (values) => ({
  title: values.title.trim(),
  description: (values.description ?? "").trim(),
  status: values.status,
  priority: values.priority,
  assigneeId: values.assigneeId || null,
  dueDate: values.dueDate || null,
});

/** FR-08. Initial status defaults to "todo" in the form. */
export async function createTask(projectId, user, values) {
  const { db } = getFirebase();
  const ref = await guardedWrite(() =>
    addDoc(tasksRef(db, projectId), {
      ...clean(values),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return ref.id;
}

/** FR-09 / FR-11: updates permitted fields (rules decide who may change what). */
export async function updateTask(projectId, taskId, values) {
  const { db } = getFirebase();
  await guardedWrite(() =>
    updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
      ...clean(values),
      updatedAt: serverTimestamp(),
    })
  );
}

/** Quick status change from the task card. */
export async function updateTaskStatus(projectId, taskId, status) {
  const { db } = getFirebase();
  await guardedWrite(() =>
    updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
      status,
      updatedAt: serverTimestamp(),
    })
  );
}

/** FR-10: owner or task creator (rules). */
export async function deleteTask(projectId, taskId) {
  const { db } = getFirebase();
  await guardedWrite(() => deleteDoc(doc(db, "projects", projectId, "tasks", taskId)));
}
