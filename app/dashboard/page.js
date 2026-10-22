"use client";
import Link from "next/link";
import { useMemo } from "react";
import DashboardStats from "@/components/DashboardStats";
import { OverdueBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import ProjectCard from "@/components/ProjectCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmptyState, Notice, SkeletonGrid } from "@/components/StateViews";
import { useAuth } from "@/hooks/auth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDate } from "@/lib/dates";
import { computeStats, isOverdue } from "@/lib/tasks";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}

function DashboardView() {
  const { user } = useAuth();
  const { loading, error, projects, tasksByProject } = useDashboardData(
    user.uid,
  );
  const allTasks = useMemo(
    () =>
      projects.flatMap((p) =>
        (tasksByProject[p.id] ?? []).map((t) => ({
          ...t,
          projectId: p.id,
          projectName: p.name,
        })),
      ),
    [projects, tasksByProject],
  );

  const stats = computeStats(allTasks);
  const overdueTasks = allTasks
    .filter((t) => isOverdue(t))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <>
      <div className="page-head">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#0d9488",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1 style={{ margin: 0, color: "#0d9488" }}>Dashboard</h1>
          </div>
          <p className="muted">Welcome, {user.displayName || user.email}.</p>
        </div>
        <Link
          href="/projects/new"
          className="btn"
          style={{
            backgroundColor: "#0d9488",
            color: "#fff",
            borderColor: "#0d9488",
          }}
        >
          New Project
        </Link>
      </div>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <DashboardStats projectCount={projects.length} stats={stats} />

          <section aria-labelledby="projects-heading" className="section">
            <h2 id="projects-heading">Your Projects</h2>
            {projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                message="Create your first project to get started."
                action={
                  <Link
                    href="/projects/new"
                    className="btn"
                    style={{
                      backgroundColor: "#0d9488",
                      color: "#fff",
                      borderColor: "#0d9488",
                    }}
                  >
                    Create Project
                  </Link>
                }
              />
            ) : (
              <div className="grid">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={tasksByProject[project.id] ?? []}
                    uid={user.uid}
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="overdue-heading" className="section">
            <h2 id="overdue-heading">Overdue Tasks</h2>
            {overdueTasks.length === 0 ? (
              <EmptyState
                title="Nothing overdue"
                message="You are all caught up."
              />
            ) : (
              <ul className="overdue-list">
                {overdueTasks.map((task) => (
                  <li
                    key={`${task.projectId}-${task.id}`}
                    className="card overdue-item"
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <div className="muted small">
                        <Link
                          href={`/projects/${task.projectId}`}
                          style={{ color: "#0d9488" }}
                        >
                          {task.projectName}
                        </Link>{" "}
                        due {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <div className="badges">
                      <OverdueBadge />
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
