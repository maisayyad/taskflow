import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError, friendlyError } from "../lib/errors.js";
import { guardedWrite } from "../lib/network.js";

test("TC-16: a write that never completes fails with a visible error instead of false success", async () => {
  await assert.rejects(
    guardedWrite(() => new Promise(() => {}), 30),
    (error) => error instanceof AppError && error.code === "timeout"
  );
});

test("a successful write resolves with its value", async () => {
  assert.equal(await guardedWrite(async () => "ok", 1000), "ok");
});

test("a failing write propagates the original error", async () => {
  const boom = Object.assign(new Error("nope"), { code: "permission-denied" });
  await assert.rejects(guardedWrite(() => Promise.reject(boom), 1000), (e) => e === boom);
});

test("friendly messages", () => {
  assert.match(friendlyError({ code: "permission-denied" }), /Access denied/);
  assert.match(friendlyError({ code: "unavailable" }), /Network problem/);
  assert.match(friendlyError(new Error("x")), /Something went wrong/);
});
