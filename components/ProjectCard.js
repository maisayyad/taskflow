"use client";

import Link from "next/link";
import { isOwner } from "@/lib/permissions";
import { computeStats } from "@/lib/tasks";
import { RoleBadge } from "./Badges";

export default function ProjectCard({ project, tasks, uid }) {
  const stats = computeStats(tasks);
  const owner = isOwner(project, uid);
  return (
    <article className="card project-card">
      <div className="card-head">
        <h3>
          <Link href={`/projects/${project.id}`}>{project.name}</Link>
        </h3>
        <RoleBadge owner={owner} />
      </div>

      {project.description ? (
        <p className="muted clamp">{project.description}</p>
      ) : null}

      <div className="progress-row">
        <progress
          value={stats.done}
          max={stats.total || 1}
          aria-label={`${stats.done} of ${stats.total} completed`}
        />
        <span className="muted small">
          {stats.done}/{stats.total} completed
        </span>
      </div>

      <ul className="meta-list">
        <li>{stats.total} tasks</li>
        <li>
          {project.memberIds.length}{" "}
          {project.memberIds.length === 1 ? "member" : "members"}
        </li>
        {stats.overdue > 0 ? (
          <li className="overdue-text">! {stats.overdue} overdue</li>
        ) : null}
      </ul>
    </article>
  );
}
