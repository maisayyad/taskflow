import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, isValidDateString, todayString } from "../lib/dates.js";
import { canChangeStatus, canDeleteTask, canEditTask } from "../lib/permissions.js";
import { hasErrors, validateLogin, validateProject, validateRegistration, validateTask } from "../lib/validation.js";

const long = (n) => "x".repeat(n);

test("TC-01/TC-02: registration validation", () => {
  assert.equal(hasErrors(validateRegistration({ name: "Sara Ali", email: "sara@example.test", password: "Passw0rd1" })), false);
  assert.ok(validateRegistration({ name: "Sara", email: "not-an-email", password: "Passw0rd1" }).email);
  assert.ok(validateRegistration({ name: "Sara", email: "a@b.co", password: "short1" }).password);
  assert.ok(validateRegistration({ name: "Sara", email: "a@b.co", password: "onlyletters" }).password);
  assert.ok(validateRegistration({ name: "", email: "a@b.co", password: "Passw0rd1" }).name);
});

test("login validation", () => {
  assert.equal(hasErrors(validateLogin({ email: "a@b.co", password: "x" })), false);
  assert.ok(validateLogin({ email: "", password: "" }).email);
  assert.ok(validateLogin({ email: "a@b.co", password: "" }).password);
});

test("project name: required, 3-80 characters; description max 1000", () => {
  assert.ok(validateProject({ name: "" }).name);
  assert.ok(validateProject({ name: "ab" }).name);
  assert.equal(hasErrors(validateProject({ name: "abc" })), false);
  assert.equal(hasErrors(validateProject({ name: long(80) })), false);
  assert.ok(validateProject({ name: long(81) }).name);
  assert.ok(validateProject({ name: "abc", description: long(1001) }).description);
});

test("TC-09: task validation (title, enums, date, assignee must be a member)", () => {
  const ok = { title: "Build navbar", description: "", status: "todo", priority: "high", dueDate: "2026-10-25", assigneeId: "u1" };
  assert.equal(hasErrors(validateTask(ok, ["u1"])), false);
  assert.ok(validateTask({ ...ok, title: "" }, ["u1"]).title);
  assert.ok(validateTask({ ...ok, title: "ab" }, ["u1"]).title);
  assert.ok(validateTask({ ...ok, title: long(121) }, ["u1"]).title);
  assert.ok(validateTask({ ...ok, status: "blocked" }, ["u1"]).status);
  assert.ok(validateTask({ ...ok, priority: "urgent" }, ["u1"]).priority);
  assert.ok(validateTask({ ...ok, dueDate: "2026-02-30" }, ["u1"]).dueDate);
  assert.ok(validateTask({ ...ok, assigneeId: "stranger" }, ["u1"]).assigneeId);
  assert.equal(hasErrors(validateTask({ ...ok, dueDate: "", assigneeId: "" }, ["u1"])), false); // both optional
});

test("dates: validity, format, today", () => {
  assert.equal(isValidDateString("2026-02-28"), true);
  assert.equal(isValidDateString("2026-02-30"), false);
  assert.equal(isValidDateString("21/10/2026"), false);
  assert.equal(formatDate("2026-10-21"), "21 Oct 2026");
  assert.equal(todayString(new Date(2026, 9, 21, 23, 59)), "2026-10-21");
});

test("permissions follow the SRS role matrix", () => {
  const project = { ownerId: "owner", memberIds: ["owner", "m1", "m2"] };
  const task = { createdBy: "m1", assigneeId: "m2" };

  // owner: everything
  assert.equal(canEditTask(project, task, "owner"), true);
  assert.equal(canChangeStatus(project, task, "owner"), true);
  assert.equal(canDeleteTask(project, task, "owner"), true);
  // creator (not assignee): edit + delete, no status change
  assert.equal(canEditTask(project, task, "m1"), true);
  assert.equal(canChangeStatus(project, task, "m1"), false);
  assert.equal(canDeleteTask(project, task, "m1"), true);
  // assignee (not creator): edit + status, no delete
  assert.equal(canEditTask(project, task, "m2"), true);
  assert.equal(canChangeStatus(project, task, "m2"), true);
  assert.equal(canDeleteTask(project, task, "m2"), false);
  // outsider: nothing
  assert.equal(canEditTask(project, task, "x"), false);
  assert.equal(canChangeStatus(project, task, "x"), false);
  assert.equal(canDeleteTask(project, task, "x"), false);
});
