// Client-side validation mirroring section 10.1 of the SRS (and the Firestore rules).
// Every validator returns an object of { field: "message" }; an empty object means valid.

import { isValidDateString } from "./dates.js";
import { PRIORITY_VALUES, STATUS_VALUES } from "./tasks.js";

export const LIMITS = {
  projectName: { min: 3, max: 80 },
  taskTitle: { min: 3, max: 120 },
  description: { max: 1000 },
  displayName: { min: 2, max: 60 },
  passwordMin: 8,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();
export const isValidEmail = (email) => EMAIL_RE.test(normalizeEmail(email));

export function validateRegistration({ name, email, password }) {
  const errors = {};
  const n = String(name ?? "").trim();
  if (!n) errors.name = "Name is required.";
  else if (n.length < LIMITS.displayName.min || n.length > LIMITS.displayName.max)
    errors.name = `Name must be ${LIMITS.displayName.min}-${LIMITS.displayName.max} characters.`;

  if (!String(email ?? "").trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  const p = String(password ?? "");
  if (!p) errors.password = "Password is required.";
  else if (p.length < LIMITS.passwordMin || !/[A-Za-z]/.test(p) || !/\d/.test(p))
    errors.password = `Use at least ${LIMITS.passwordMin} characters with letters and numbers.`;

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!String(email ?? "").trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateProject({ name, description }) {
  const errors = {};
  const n = String(name ?? "").trim();
  if (!n) errors.name = "Project name is required.";
  else if (n.length < LIMITS.projectName.min || n.length > LIMITS.projectName.max)
    errors.name = `Project name must be ${LIMITS.projectName.min}-${LIMITS.projectName.max} characters.`;
  if (String(description ?? "").trim().length > LIMITS.description.max)
    errors.description = `Description can be at most ${LIMITS.description.max} characters.`;
  return errors;
}

/**
 * memberIds: UIDs of the project members; the assignee must be one of them (FR-12).
 */
export function validateTask({ title, description, status, priority, dueDate, assigneeId }, memberIds = []) {
  const errors = {};
  const t = String(title ?? "").trim();
  if (!t) errors.title = "Task title is required.";
  else if (t.length < LIMITS.taskTitle.min || t.length > LIMITS.taskTitle.max)
    errors.title = `Title must be ${LIMITS.taskTitle.min}-${LIMITS.taskTitle.max} characters.`;

  if (String(description ?? "").trim().length > LIMITS.description.max)
    errors.description = `Description can be at most ${LIMITS.description.max} characters.`;

  if (!STATUS_VALUES.includes(status)) errors.status = "Choose a valid status.";
  if (!PRIORITY_VALUES.includes(priority)) errors.priority = "Choose a valid priority.";

  if (dueDate && !isValidDateString(dueDate)) errors.dueDate = "Enter a valid date.";

  if (assigneeId && !memberIds.includes(assigneeId))
    errors.assigneeId = "The assignee must be a member of this project.";

  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
