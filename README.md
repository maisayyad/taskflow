# TaskFlow – Project & Task Management System

A responsive web app for small teams to create projects, assign tasks, track progress and monitor
deadlines. Built for the 7-day full-stack challenge (see the SRS) with **Next.js (App Router) +
React, plain CSS, Firebase Authentication and Cloud Firestore**. No separate backend – authorization
is enforced by Firestore Security Rules.

- Live demo: _add your Vercel URL here_
- Repository: _add your GitHub URL here_
- Demo logins (fictional, created by `npm run seed`): `owner@example.test` and `member@example.test`,
  password `Demo12345`

## Features

| Area | What it does | SRS |
|------|--------------|-----|
| Auth | Email/password register, login, logout, persisted session, protected routes | FR-01…04 |
| Projects | Create, view, edit, delete (with confirmation) – owner only | FR-05, 06 |
| Membership | Owner adds/removes existing users by email; duplicates and unknown emails rejected; removal revokes access and unassigns tasks | FR-07, 12 |
| Tasks | Create/edit/delete, status (To Do / In Progress / Done), priority, due date, assignee | FR-08…12 |
| Discovery | Client-side title search; filter by status, priority, assignee; bonus sorting by deadline/priority | FR-13 |
| Dashboard | Accessible projects, totals, tasks per status, overdue tasks | FR-14 |
| UX | Loading skeletons, empty/error/access-denied/not-found states, offline banner, confirmations | FR-15 |
| Responsive | Mobile-first CSS designed for 375 / 768 / 1280 px (verify with TC-15) | FR-16 |
| Audit | `createdAt` / `updatedAt` server timestamps on projects and tasks | FR-18 |
| Bonus | Dark mode (persisted), progress bars, task sorting | §19 |

### Roles (section 4)

| Operation | Owner | Member |
|-----------|:-----:|:------:|
| View project and tasks | ✔ | ✔ |
| Edit / delete project, manage members | ✔ | ✘ |
| Create task | ✔ | ✔ |
| Edit task | ✔ | own-created or assigned |
| Delete task | ✔ | own-created |
| Change task status | ✔ | assigned only |

All of this is enforced in `firestore.rules`, not only by hiding buttons.

## Getting started

Requirements: Node.js ≥ 20.6, a Firebase project.

1. **Create the Firebase project** at <https://console.firebase.google.com>:
   - *Build → Authentication → Sign-in method*: enable **Email/Password**.
   - *Build → Firestore Database*: create a database (production mode).
   - *Project settings → Your apps*: add a **Web app** and copy its config.
2. **Install and configure**
   ```bash
   npm install
   cp .env.example .env.local      # then fill in the NEXT_PUBLIC_FIREBASE_* values
   ```
3. **Publish the security rules** (required – the app will not work with locked-down defaults):
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules
   ```
   (or paste `firestore.rules` into *Firestore → Rules* in the console and publish).
4. **Run**
   ```bash
   npm run dev                      # http://localhost:3000
   npm run seed                     # optional: demo users, project "Website Redesign", 4 tasks
   npm test                         # unit tests (no Firebase needed)
   npm run build && npm start       # production build
   ```

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key (public identifier, not a secret) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket (unused, kept for completeness) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app id |

Only `.env.example` is committed. `.env.local` and service-account keys are git-ignored – never
commit them.

### Deploying (Vercel)

1. Push the repository to GitHub and import it in Vercel (framework: Next.js, defaults are fine).
2. Add the six `NEXT_PUBLIC_FIREBASE_*` variables under *Project → Settings → Environment Variables*.
3. In Firebase *Authentication → Settings → Authorized domains*, add your Vercel domain.
4. Redeploy and run through `docs/TEST_PLAN.md`.

## Project structure

```
app/                        Routes (App Router)
  page.js                   / – redirect to /dashboard or /login
  register/ login/          Auth screens
  dashboard/                Overview: stats, project list, overdue tasks
  projects/new/             Create project
  projects/[id]/            Project details: members, tasks, filters, task form
  projects/[id]/settings/   Owner-only: edit, membership, delete
components/                 AuthForm, ProjectCard, ProjectForm, TaskForm, TaskList, TaskCard,
                            FilterBar, DashboardStats, MembersPanel/Manager, ConfirmDialog, …
hooks/                      auth (AuthProvider/useAuth), useProject/useTasks, useDashboardData
lib/                        firebase (lazy init), validation, tasks (rules/filter/stats),
                            permissions, dates, errors, network (write guard)
services/                   users, projects, tasks – all Firestore access lives here
scripts/seed.mjs            Demo data (Appendix A)
tests/                      node:test unit tests
docs/TEST_PLAN.md           Test cases TC-01…TC-16 + rules checks
firestore.rules             Security rules
```

## Firestore structure

```
users/{uid}                          displayName, email, createdAt
projects/{projectId}                 name, description, ownerId, memberIds[], createdAt, updatedAt
projects/{projectId}/tasks/{taskId}  title, description, status, priority, assigneeId|null,
                                     createdBy, dueDate|null, createdAt, updatedAt
```

- `status` ∈ `todo | in_progress | done`; `priority` ∈ `low | medium | high`.
- `dueDate` is stored as a `YYYY-MM-DD` string (a calendar date, free of time-zone shifts).
- **Overdue** = `dueDate` earlier than today (browser's local time zone) **and** status not Done.
- `memberIds` always contains `ownerId`; the project query uses `array-contains` on `memberIds`.
- Validation: project name 3–80, task title 3–120, description ≤ 1000 – checked in the UI **and** in the rules.

## Security rules (summary)

Default deny. Details and comments are in [`firestore.rules`](firestore.rules).

- **users**: create/update own profile only; `get` by any signed-in user (to show member names);
  `list` only with `limit(1)` so the directory cannot be dumped (used for add-by-email).
- **projects**: read = owner/member; create = owner is the caller and sole initial member;
  update/delete = owner only; `ownerId`, `createdAt` immutable; no duplicate members; owner stays a member.
- **tasks**: read = project members; create = member, `createdBy` = caller; update = owner, or
  creator/assignee (status only by the assignee); delete = owner or creator; `createdBy`/`createdAt`
  immutable; enum, length, date and assignee-membership validation. The project linkage is the
  document path, so it cannot be changed.

Project deletion: Firestore does not delete sub-collections, so the client deletes all tasks in
batches first and the project document last (retry-safe). Removing a member unassigns their tasks
first, then removes the UID from `memberIds`, which revokes access immediately.

## Testing

See [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md). `npm test` runs the automated unit tests; the
remaining cases are manual and need two accounts. Add your screenshots (authentication, projects,
tasks, filters, mobile) under `docs/screenshots/`.

## Known limitations

- Membership is by email lookup of already-registered users; anyone signed in can test whether an
  email is registered (acceptable for this invite-free MVP, would be replaced by invitations).
- Filtering/search is client-side over all tasks of a project (fine for small data; production would
  need queries, indexes and pagination).
- Ownership transfer, notifications, file uploads, offline-first sync are out of scope (SRS §2.2).
- If the network drops mid-write the UI shows an error but Firestore may still apply the queued write
  later – refresh before retrying.
- Admin-level cleanup (e.g. orphaned data after a failed project deletion) would need a Cloud Function.
- Kanban drag-and-drop, activity history and charts beyond progress bars are not implemented.
