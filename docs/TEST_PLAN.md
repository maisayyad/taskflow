# TaskFlow – Test Plan & Evidence Sheet

Run after `npm run seed` (demo users `owner@example.test` / `member@example.test`, password `Demo12345`)
with the Firestore rules from `firestore.rules` published. Use two browsers (or one normal + one
private window) so both roles are signed in at the same time.

Automated checks (no Firebase needed): `npm test` – covers validation, overdue rule, filtering,
sorting, statistics, permission matrix and the network-failure guard.

| ID | Scenario | Steps | Expected | Automated | Result / evidence |
|----|----------|-------|----------|-----------|-------------------|
| TC-01 | Register with valid inputs | `/register`, fill name/email/password ≥ 8 chars with letters+numbers | Account created, profile doc `users/{uid}` exists, redirected to `/dashboard` | partly (`validation.test.js`) | |
| TC-02 | Register with invalid email | Enter `abc` as email | Inline error next to the field, no account created | ✔ | |
| TC-03 | Log in and refresh | Sign in, press F5 | Still signed in (session persisted) | – | |
| TC-04 | Open dashboard signed out | Log out, open `/dashboard` | Redirected to `/login` | – | |
| TC-05 | Create project | `/projects/new` → create | Project appears on dashboard and persists after refresh | – | |
| TC-06 | Update project as member | As member open `/projects/{id}/settings` | "Access denied" screen; a direct Firestore update is rejected by the rules | rules | |
| TC-07 | Add existing member | Owner → settings → add `member@example.test` | Member sees the project on their dashboard | – | |
| TC-08 | Add unknown user | Owner adds `nobody@example.test` | Clear error message, `memberIds` unchanged | – | |
| TC-09 | Create task without title | Submit empty title | Validation error, nothing saved (rules also reject < 3 chars) | ✔ | |
| TC-10 | Change task status | Assignee changes status via the select on the card | New status persists after refresh | – | |
| TC-11 | Filter high-priority tasks | Priority filter = High | Only high-priority tasks shown | ✔ | |
| TC-12 | Search title keyword | Type `navbar` | Only matching tasks shown; empty result shows an empty state | ✔ | |
| TC-13 | Open foreign project URL | Signed in as a non-member, open another user's `/projects/{id}` | "Access denied", no project/task data | rules | |
| TC-14 | Forbidden Firestore write | See "Rules checks" below | Operation rejected (`permission-denied`) | rules | |
| TC-15 | Mobile width 375 px | DevTools device toolbar 375 px on every screen | No clipped or overlapping core controls, no horizontal scroll | – | |
| TC-16 | Simulate network failure | DevTools → Network → Offline, then save a task | Visible error ("You appear to be offline…"), no false success | ✔ (guard) | |

## Rules checks (TC-06, TC-13, TC-14)

Do these from the second account (e.g. browser console on the deployed app, or the Rules Playground
in the Firebase console). Each must be **denied**:

1. Non-member reads `projects/{id}` or `projects/{id}/tasks`.
2. Member (not owner) updates `projects/{id}` (name, description or `memberIds`) or deletes it.
3. Member sets `ownerId` to themselves, or removes the owner from `memberIds`.
4. Member updates/deletes a task they neither created nor are assigned to.
5. Member (not assignee) changes a task's `status`.
6. Member creates a task with `createdBy` = someone else, an invalid `status`/`priority`,
   a title shorter than 3 characters, or an assignee who is not a project member.
7. Any user reads the whole `users` collection (list without `limit(1)`).
8. Removed member re-reads the project they were removed from.

## Live evaluation exercise (section 18)

Add an "Overdue Tasks" filter: reuse `isOverdue(task)` from `lib/tasks.js`, add an `overdueOnly`
flag to `filterTasks`, and a checkbox in `components/FilterBar.js`. Edge cases: due **today** is not
overdue; a **Done** task with a past date is not overdue; tasks without a due date never are.
