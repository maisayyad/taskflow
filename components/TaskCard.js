"use client";

import { formatDate, formatTimestamp } from "@/lib/dates";
import { canChangeStatus, canDeleteTask, canEditTask } from "@/lib/permissions";
import { STATUSES, isOverdue } from "@/lib/tasks";
import { OverdueBadge, PriorityBadge, StatusBadge } from "./Badges";

export default function TaskCard({ task, project, uid, nameOf, onEdit, onDelete, onStatusChange }) {
  const editable = canEditTask(project, task, uid);
  const deletable = canDeleteTask(project, task, uid);
  const statusChangeable = canChangeStatus(project, task, uid);
  const overdue = isOverdue(task);
  const updated = formatTimestamp(task.updatedAt);

  return (
    <li className={`card task-card${overdue ? " is-overdue" : ""}${task.status === "done" ? " is-done" : ""}`}>
      <div className="card-head">
        <h3>{task.title}</h3>
        <div className="badges">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {overdue ? <OverdueBadge /> : null}
        </div>
      </div>

      {task.description ? <p className="muted task-desc">{task.description}</p> : null}

      <dl className="task-meta">
        <div>
          <dt>Assignee</dt>
          <dd>{nameOf(task.assigneeId)}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{task.dueDate ? formatDate(task.dueDate) : "No due date"}</dd>
        </div>
        {updated ? (
          <div>
            <dt>Updated</dt>
            <dd>{updated}</dd>
          </div>
        ) : null}
      </dl>

      <div className="task-actions">
        {statusChangeable ? (
          <label className="inline-label">
            <span className="visually-hidden">Change status of {task.title}</span>
            <select
              value={task.status}
              onChange={(event) => onStatusChange(task, event.target.value)}
              aria-label={`Status of ${task.title}`}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {editable ? (
          <button type="button" className="btn btn-small" onClick={() => onEdit(task)}>
            Edit<span className="visually-hidden"> {task.title}</span>
          </button>
        ) : null}
        {deletable ? (
          <button type="button" className="btn btn-small btn-danger-outline" onClick={() => onDelete(task)}>
            Delete<span className="visually-hidden"> {task.title}</span>
          </button>
        ) : null}
      </div>
    </li>
  );
}
