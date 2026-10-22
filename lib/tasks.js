// Pure task logic: constants, overdue rule, filtering, sorting and statistics.
// Kept free of React/Firebase imports so it can be unit-tested with `npm test`.

import { todayString } from "./dates.js";

export const STATUSES = [
  { value: "todo", label: "To Do", symbol: "○" },
  { value: "in_progress", label: "In Progress", symbol: "◐" },
  { value: "done", label: "Done", symbol: "✓" },
];

export const PRIORITIES = [
  { value: "low", label: "Low", symbol: "▽", rank: 1 },
  { value: "medium", label: "Medium", symbol: "◇", rank: 2 },
  { value: "high", label: "High", symbol: "△", rank: 3 },
];

export const STATUS_VALUES = STATUSES.map((s) => s.value);
export const PRIORITY_VALUES = PRIORITIES.map((p) => p.value);

export const statusInfo = (value) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];
export const priorityInfo = (value) => PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1];

/**
 * Business rule: a task is overdue when its due date is earlier than today
 * (application/local time zone) and its status is not Done.
 */
export function isOverdue(task, today = todayString()) {
  return Boolean(task && task.dueDate && task.dueDate < today && task.status !== "done");
}

/**
 * Client-side filtering (FR-13).
 * filters: { search, status, priority, assignee }  - "all" (or empty) disables a filter;
 * assignee may also be "unassigned" or a user UID.
 */
export function filterTasks(tasks, filters = {}) {
  const search = (filters.search ?? "").trim().toLowerCase();
  const { status = "all", priority = "all", assignee = "all" } = filters;

  return tasks.filter((task) => {
    if (search && !String(task.title ?? "").toLowerCase().includes(search)) return false;
    if (status !== "all" && task.status !== status) return false;
    if (priority !== "all" && task.priority !== priority) return false;
    if (assignee === "unassigned" && task.assigneeId) return false;
    if (assignee !== "all" && assignee !== "unassigned" && task.assigneeId !== assignee) return false;
    return true;
  });
}

export const SORT_OPTIONS = [
  { value: "created", label: "Newest first" },
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "priority", label: "Priority (highest)" },
];

const millis = (ts) => (ts && typeof ts.toMillis === "function" ? ts.toMillis() : Number.MAX_SAFE_INTEGER);

/** Returns a new sorted array (bonus: sorting by deadline or priority). */
export function sortTasks(tasks, sortBy = "created") {
  const copy = [...tasks];
  if (sortBy === "deadline") {
    copy.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1; // tasks without a deadline go last
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (sortBy === "priority") {
    copy.sort((a, b) => priorityInfo(b.priority).rank - priorityInfo(a.priority).rank);
  } else {
    // Pending server timestamps are null locally -> treat as newest.
    copy.sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
  }
  return copy;
}

/** Counts used by the dashboard (FR-14) and project progress. */
export function computeStats(tasks, today = todayString()) {
  const stats = { total: tasks.length, todo: 0, in_progress: 0, done: 0, overdue: 0 };
  for (const task of tasks) {
    if (task.status in stats) stats[task.status] += 1;
    if (isOverdue(task, today)) stats.overdue += 1;
  }
  return stats;
}
