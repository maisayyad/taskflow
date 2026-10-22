// Friendly error messages (FR-15, NFR-05). Technical details go to the console only.

export class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

const AUTH_MESSAGES = {
  "auth/invalid-email": "That email address is not valid.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "That password is too weak. Use at least 8 characters with letters and numbers.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
};

export function friendlyAuthError(error) {
  if (error instanceof AppError) return error.message;
  return AUTH_MESSAGES[error?.code] ?? "Something went wrong. Please try again.";
}

/** Used for any Firestore read/write failure. */
export function friendlyError(error) {
  if (error instanceof AppError) return error.message;
  switch (error?.code) {
    case "permission-denied":
      return "Access denied: you do not have permission to do that.";
    case "unavailable":
    case "deadline-exceeded":
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "not-found":
      return "That item no longer exists.";
    case "unauthenticated":
      return "Your session has expired. Please sign in again.";
    default:
      return "Something went wrong while saving. Please try again.";
  }
}

export const isPermissionDenied = (error) => error?.code === "permission-denied";
