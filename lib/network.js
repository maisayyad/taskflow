// Firestore queues writes while offline and never rejects them, which would leave the UI
// stuck on "Saving..." or - worse - report false success. Every write goes through this
// guard so the user always sees a clear result (TC-16).

import { AppError } from "./errors.js";

export const WRITE_TIMEOUT_MS = 15000;

export async function guardedWrite(operation, timeoutMs = WRITE_TIMEOUT_MS) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new AppError("offline", "You appear to be offline. Reconnect and try again - nothing was saved.");
  }

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new AppError(
            "timeout",
            "The server did not confirm the change in time. Check your connection, then retry. Refresh to see the latest data before retrying."
          )
        ),
      timeoutMs
    );
  });

  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
