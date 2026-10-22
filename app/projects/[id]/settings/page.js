"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import MembersManager from "@/components/MembersManager";
import ProjectForm from "@/components/ProjectForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccessDenied, Loading, NotFound, Notice } from "@/components/StateViews";
import { useAuth } from "@/hooks/auth";
import { useProject } from "@/hooks/useProject";
import { friendlyError } from "@/lib/errors";
import { isOwner } from "@/lib/permissions";
import { deleteProject, updateProject } from "@/services/projects";

export default function ProjectSettingsPage() {
  const { id } = useParams();
  return (
    <ProtectedRoute>
      <SettingsView projectId={id} />
    </ProtectedRoute>
  );
}

function SettingsView({ projectId }) {
  const { user } = useAuth();
  const router = useRouter();
  const { status, project, message } = useProject(projectId);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (status === "loading") return <Loading label="Loading project..." />;
  if (status === "notfound") return <NotFound />;
  if (status === "denied") return <AccessDenied message="You are not a member of this project." />;
  if (status === "error") return <Notice>{message}</Notice>;

  // Owner-only screen (the Firestore rules enforce the same restriction on the writes).
  if (!isOwner(project, user.uid)) {
    return <AccessDenied message="Only the project owner can open the project settings." />;
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProject(project.id);
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      setDeleteError(`${friendlyError(error)} The project was not fully deleted - you can retry.`);
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <p>
        <Link href={`/projects/${project.id}`}>&larr; Back to project</Link>
      </p>
      <div className="page-head">
        <h1>Project settings</h1>
      </div>

      <div className="settings-layout">
        <section className="card" aria-labelledby="details-heading">
          <h2 id="details-heading">Project details</h2>
          {saved ? <Notice kind="success">Changes saved.</Notice> : null}
          <ProjectForm
            initial={project}
            submitLabel="Save changes"
            onSubmit={(values) => updateProject(project.id, values)}
            onSaved={setSaved}
          />
        </section>

        <MembersManager project={project} />

        <section className="card danger-zone" aria-labelledby="danger-heading">
          <h2 id="danger-heading">Danger zone</h2>
          <p>
            Deleting this project permanently removes the project and all of its tasks for every member. This
            cannot be undone.
          </p>
          {deleteError ? <Notice>{deleteError}</Notice> : null}
          <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            Delete project
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this project?"
        message={`"${project.name}" and all of its tasks will be permanently deleted.`}
        confirmLabel="Delete project"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
