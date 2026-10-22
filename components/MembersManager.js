"use client";

import { useState } from "react";
import { useProfiles } from "@/hooks/useProfiles";
import { friendlyError } from "@/lib/errors";
import { isValidEmail } from "@/lib/validation";
import { addMemberByEmail, removeMember } from "@/services/projects";
import ConfirmDialog from "./ConfirmDialog";
import { TextField } from "./FormFields";
import { Notice } from "./StateViews";

/** Owner-only membership management (FR-07, US-04). */
export default function MembersManager({ project }) {
  const { profiles, nameOf } = useProfiles(project.memberIds);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [message, setMessage] = useState(null); // { kind, text }
  const [adding, setAdding] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function handleAdd(event) {
    event.preventDefault();
    setMessage(null);
    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError("");
    setAdding(true);
    try {
      const added = await addMemberByEmail(project, email);
      setMessage({ kind: "success", text: `${added.displayName} was added to the project.` });
      setEmail("");
    } catch (error) {
      setMessage({ kind: "error", text: friendlyError(error) });
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeMember(project, toRemove);
      setMessage({ kind: "success", text: `${nameOf(toRemove)} was removed and lost access to the project.` });
      setToRemove(null);
    } catch (error) {
      setMessage({ kind: "error", text: friendlyError(error) });
      setToRemove(null);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="card" aria-labelledby="members-manage-heading">
      <h2 id="members-manage-heading">Members</h2>

      {message ? (
        <Notice kind={message.kind} onDismiss={() => setMessage(null)}>
          {message.text}
        </Notice>
      ) : null}

      <form onSubmit={handleAdd} noValidate className="inline-form">
        <TextField
          id="member-email"
          label="Add a member by email"
          type="email"
          hint="They must already have a TaskFlow account."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError}
        />
        <button type="submit" className="btn btn-primary" disabled={adding}>
          {adding ? "Adding..." : "Add member"}
        </button>
      </form>

      <ul className="member-list">
        {project.memberIds.map((uid) => (
          <li key={uid}>
            <div>
              <strong>{nameOf(uid)}</strong>
              {uid === project.ownerId ? <span className="chip-tag">Owner</span> : null}
              <div className="muted small">{profiles[uid]?.email ?? ""}</div>
            </div>
            {uid !== project.ownerId ? (
              <button type="button" className="btn btn-small btn-danger-outline" onClick={() => setToRemove(uid)}>
                Remove<span className="visually-hidden"> {nameOf(uid)}</span>
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remove member?"
        message={`${toRemove ? nameOf(toRemove) : ""} will lose access to this project and their tasks will become unassigned.`}
        confirmLabel="Remove member"
        busy={removing}
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </section>
  );
}
