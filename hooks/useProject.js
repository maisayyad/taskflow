"use client";

import { useEffect, useState } from "react";
import { subscribeToProject } from "@/services/projects";
import { subscribeToTasks } from "@/services/tasks";
import { friendlyError, isPermissionDenied } from "@/lib/errors";

/**
 * Live project document with an explicit status:
 * "loading" | "ready" | "notfound" | "denied" | "error"
 * A non-member visiting a project URL gets "denied" (Firestore rules reject the read) and
 * no project data; a missing project gets "notfound" (section 13).
 */
export function useProject(projectId) {
  const [state, setState] = useState({ status: "loading", project: null, message: "" });

  useEffect(() => {
    setState({ status: "loading", project: null, message: "" });
    return subscribeToProject(
      projectId,
      (project) =>
        setState(
          project
            ? { status: "ready", project, message: "" }
            : { status: "notfound", project: null, message: "" }
        ),
      (err) => {
        console.error(err);
        setState({
          status: isPermissionDenied(err) ? "denied" : "error",
          project: null,
          message: friendlyError(err),
        });
      }
    );
  }, [projectId]);

  return state;
}

/** Live task list for a project; `enabled` should be false until access is confirmed. */
export function useTasks(projectId, enabled) {
  const [state, setState] = useState({ tasks: null, error: "" });

  useEffect(() => {
    if (!enabled) return undefined;
    setState({ tasks: null, error: "" });
    return subscribeToTasks(
      projectId,
      (tasks) => setState({ tasks, error: "" }),
      (err) => {
        console.error(err);
        setState({ tasks: [], error: friendlyError(err) });
      }
    );
  }, [projectId, enabled]);

  return state;
}
