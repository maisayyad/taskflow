// UI-level permission helpers mirroring section 4 of the SRS.
// IMPORTANT: these only decide which buttons to show. The real enforcement lives in
// firestore.rules - never rely on these for security.

export const isOwner = (project, uid) => Boolean(project && uid && project.ownerId === uid);
export const isMember = (project, uid) =>
  Boolean(project && uid && Array.isArray(project.memberIds) && project.memberIds.includes(uid));

export const canManageProject = isOwner;
export const canCreateTask = isMember;

/** Owner: any task. Member: only tasks they created or that are assigned to them. */
export function canEditTask(project, task, uid) {
  if (!isMember(project, uid)) return false;
  return isOwner(project, uid) || task.createdBy === uid || task.assigneeId === uid;
}

/** Owner: any task. Member: only tasks assigned to them. */
export function canChangeStatus(project, task, uid) {
  if (!isMember(project, uid)) return false;
  return isOwner(project, uid) || task.assigneeId === uid;
}

/** Owner: any task. Member: only tasks they created. */
export function canDeleteTask(project, task, uid) {
  if (!isMember(project, uid)) return false;
  return isOwner(project, uid) || task.createdBy === uid;
}
