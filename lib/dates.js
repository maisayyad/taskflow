// Date helpers. Due dates are stored as "YYYY-MM-DD" strings (calendar dates, no time zone
// ambiguity). "Today" is always evaluated in the user's local (application) time zone.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n) => String(n).padStart(2, "0");

/** Returns today's date as YYYY-MM-DD in the local time zone. */
export function todayString(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** True when value is a real calendar date written as YYYY-MM-DD. */
export function isValidDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Consistent display format everywhere in the app: "21 Oct 2026". */
export function formatDate(value) {
  if (!isValidDateString(value)) return "";
  const [y, m, d] = value.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Formats a Firestore Timestamp (or null while a server timestamp is pending). */
export function formatTimestamp(ts) {
  if (!ts || typeof ts.toDate !== "function") return "";
  return formatDate(todayString(ts.toDate()));
}
