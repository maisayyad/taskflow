"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToUserProjects } from "@/services/projects";
import { subscribeToTasks } from "@/services/tasks";
import { friendlyError } from "@/lib/errors";

/**
 * Subscribes to every accessible project and its tasks.
 * Returns { loading, error, projects, tasksByProject } - counts are derived from the same
 * Firestore records shown elsewhere, so dashboard numbers always agree (US-08).
 */
export function useDashboardData(uid) {
  const [projects, setProjects] = useState(null);
  const [tasksByProject, setTasksByProject] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToUserProjects(
      uid,
      (list) => {
        setProjects(list);
        setError("");
      },
      (err) => {
        console.error(err);
        setError(friendlyError(err));
        setProjects([]);
      }
    );
  }, [uid]);

  const projectKey = useMemo(() => (projects ? projects.map((p) => p.id).join(",") : null), [projects]);

  useEffect(() => {
    if (!projectKey) return undefined;
    const unsubscribes = projectKey.split(",").map((id) =>
      subscribeToTasks(
        id,
        (tasks) => setTasksByProject((prev) => ({ ...prev, [id]: tasks })),
        (err) => {
          console.error(err);
          setError(friendlyError(err));
        }
      )
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [projectKey]);

  const loading =
    !error && (projects === null || projects.some((p) => !(p.id in tasksByProject)));

  return { loading, error, projects: projects ?? [], tasksByProject };
}
