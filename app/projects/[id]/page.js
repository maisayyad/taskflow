"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { RoleBadge } from "@/components/Badges";
import ConfirmDialog from "@/components/ConfirmDialog";
import FilterBar from "@/components/FilterBar";
import MembersPanel from "@/components/MembersPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  AccessDenied,
  Loading,
  NotFound,
  Notice,
} from "@/components/StateViews";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { useAuth } from "@/hooks/auth";
import { useProfiles } from "@/hooks/useProfiles";
import { useProject, useTasks } from "@/hooks/useProject";
import { friendlyError } from "@/lib/errors";
import {
  canChangeStatus,
  canCreateTask,
  isMember,
  isOwner,
} from "@/lib/permissions";
import { computeStats, filterTasks, sortTasks } from "@/lib/tasks";
import {
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "@/services/tasks";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  priority: "all",
  assignee: "all",
};

export default function ProjectPage() {
  const { id } = useParams();
  return (
    <ProtectedRoute>
      <ProjectView projectId={id} />
    </ProtectedRoute>
  );
}

function ProjectView({ projectId }) {
  const { user } = useAuth();
  const { status, project, message } = useProject(projectId);
  const access = status === "ready" && isMember(project, user.uid);
  const { tasks, error: tasksError } = useTasks(projectId, access);

  if (status === "loading") return <Loading label="Loading project..." />;
  if (status === "notfound") return <NotFound />;
  if (status === "denied")
    return <AccessDenied message="You are not a member of this project." />;
  if (status === "error") return <Notice>{message}</Notice>;
  if (!access)
    return <AccessDenied message="You are not a member of this project." />;

  return (
    <ProjectDetails
      project={project}
      tasks={tasks}
      tasksError={tasksError}
      user={user}
    />
  );
}

function ProjectDetails({ project, tasks, tasksError, user }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("created");
  const [editing, setEditing] = useState(null); // null | "new" | task
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const owner = isOwner(project, user.uid);
  const { nameOf } = useProfiles(project.memberIds);
  const members = project.memberIds.map((uid) => ({ uid, name: nameOf(uid) }));

  const allTasks = tasks ?? [];
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(allTasks, filters), sortBy),
    [allTasks, filters, sortBy],
  );
  const stats = computeStats(allTasks);

  async function handleSave(values) {
    if (editing === "new") await createTask(project.id, user, values);
    else await updateTask(project.id, editing.id, values);
    setEditing(null);
  }

  async function handleStatusChange(task, status) {
    setActionError("");
    try {
      await updateTaskStatus(project.id, task.id, status);
    } catch (error) {
      console.error(error);
      setActionError(
        `Could not change the status of "${task.title}". ${friendlyError(error)}`,
      );
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setActionError("");
    try {
      await deleteTask(project.id, toDelete.id);
    } catch (error) {
      console.error(error);
      setActionError(
        `Could not delete "${toDelete.title}". ${friendlyError(error)}`,
      );
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <p>
        <Link href="/dashboard">&larr; Back to dashboard</Link>
      </p>

      <div className="page-head">
        <div>
          <h1>{project.name}</h1>
          {project.description ? (
            <p className="muted">{project.description}</p>
          ) : null}
          <p>
            <RoleBadge owner={owner} />
          </p>
        </div>
        <div className="page-actions">
          {owner ? (
            <Link href={`/projects/${project.id}/settings`} className="btn">
              Project settings
            </Link>
          ) : null}
          {canCreateTask(project, user.uid) ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setEditing("new")}
              disabled={editing === "new"}
            >
              New task
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <Notice onDismiss={() => setActionError("")}>{actionError}</Notice>
      ) : null}
      {tasksError ? <Notice>{tasksError}</Notice> : null}

      <div className="project-layout">
        <div className="project-main">
          {editing ? (
            <TaskForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? null : editing}
              members={members}
              canChangeStatus={
                editing === "new"
                  ? true
                  : canChangeStatus(project, editing, user.uid)
              }
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : null}

          <section aria-labelledby="tasks-heading" className="section">
            <h2 id="tasks-heading">Tasks</h2>
            {tasks === null && !tasksError ? (
              <Loading label="Loading tasks..." />
            ) : (
              <>
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  members={members}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                  shown={visibleTasks.length}
                  total={allTasks.length}
                />
                <TaskList
                  tasks={visibleTasks}
                  totalCount={allTasks.length}
                  project={project}
                  uid={user.uid}
                  nameOf={nameOf}
                  onEdit={setEditing}
                  onDelete={setToDelete}
                  onStatusChange={handleStatusChange}
                  onCreate={() => setEditing("new")}
                />
              </>
            )}
          </section>
        </div>

        <aside className="project-side" aria-label="Project overview">
          <section className="card" aria-labelledby="progress-heading">
            <h2 id="progress-heading">Progress</h2>
            <progress
              value={stats.done}
              max={stats.total || 1}
              aria-label={`${stats.done} of ${stats.total} tasks done`}
            />
            <ul className="meta-list stacked">
              <li>{stats.total} tasks in total</li>
              <li>To Do: {stats.todo}</li>
              <li>In Progress: {stats.in_progress}</li>
              <li>Done: {stats.done}</li>
              <li className={stats.overdue ? "overdue-text" : undefined}>
                {stats.overdue ? "! " : ""}Overdue: {stats.overdue}
              </li>
            </ul>
          </section>
          <MembersPanel
            project={project}
            nameOf={nameOf}
            isProjectOwner={owner}
          />
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete task?"
        message={`"${toDelete?.title ?? ""}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
