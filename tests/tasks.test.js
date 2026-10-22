import assert from "node:assert/strict";
import { test } from "node:test";
import { computeStats, filterTasks, isOverdue, sortTasks } from "../lib/tasks.js";

const TODAY = "2026-10-21";

const tasks = [
  { id: "1", title: "Build navbar", status: "in_progress", priority: "high", assigneeId: "u2", dueDate: "2026-10-25" },
  { id: "2", title: "Create login page", status: "todo", priority: "medium", assigneeId: "u1", dueDate: null },
  { id: "3", title: "Test responsive layout", status: "done", priority: "low", assigneeId: "u2", dueDate: "2026-10-01" },
  { id: "4", title: "Fix overdue bug", status: "todo", priority: "high", assigneeId: null, dueDate: "2026-10-20" },
];

test("overdue: due before today and not done", () => {
  assert.equal(isOverdue(tasks[3], TODAY), true); // yesterday, to do
  assert.equal(isOverdue(tasks[2], TODAY), false); // past but Done
  assert.equal(isOverdue(tasks[0], TODAY), false); // future
  assert.equal(isOverdue(tasks[1], TODAY), false); // no due date
  assert.equal(isOverdue({ status: "todo", dueDate: TODAY }, TODAY), false); // due today is not overdue
});

test("stats: counts agree with the task records (US-08)", () => {
  assert.deepEqual(computeStats(tasks, TODAY), { total: 4, todo: 2, in_progress: 1, done: 1, overdue: 1 });
  assert.deepEqual(computeStats([], TODAY), { total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 });
});

test("TC-11: filter high priority", () => {
  const result = filterTasks(tasks, { priority: "high" });
  assert.deepEqual(result.map((t) => t.id), ["1", "4"]);
});

test("TC-12: search by title keyword is case-insensitive", () => {
  assert.deepEqual(filterTasks(tasks, { search: "NAVBAR" }).map((t) => t.id), ["1"]);
  assert.deepEqual(filterTasks(tasks, { search: "  page " }).map((t) => t.id), ["2"]);
});

test("filter by status, assignee and combinations; empty result set", () => {
  assert.deepEqual(filterTasks(tasks, { status: "todo" }).map((t) => t.id), ["2", "4"]);
  assert.deepEqual(filterTasks(tasks, { assignee: "u2" }).map((t) => t.id), ["1", "3"]);
  assert.deepEqual(filterTasks(tasks, { assignee: "unassigned" }).map((t) => t.id), ["4"]);
  assert.deepEqual(filterTasks(tasks, { status: "todo", priority: "high" }).map((t) => t.id), ["4"]);
  assert.deepEqual(filterTasks(tasks, { search: "zzz" }), []);
  assert.equal(filterTasks(tasks, {}).length, 4);
});

test("sorting by deadline puts tasks without a date last; by priority high first", () => {
  assert.deepEqual(sortTasks(tasks, "deadline").map((t) => t.id), ["3", "4", "1", "2"]);
  assert.deepEqual(sortTasks(tasks, "priority").map((t) => t.priority), ["high", "high", "medium", "low"]);
  assert.equal(tasks[0].id, "1"); // input is not mutated
});
