"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/errors";
import { PRIORITIES, STATUSES } from "@/lib/tasks";
import { LIMITS, hasErrors, validateTask } from "@/lib/validation";
import { SelectField, TextArea, TextField } from "./FormFields";
import { Notice } from "./StateViews";

/**
 * Create / edit task form (FR-08, FR-09, FR-11, FR-12).
 * members: [{ uid, name }]. canChangeStatus=false disables the status select (members may only
 * change the status of tasks assigned to them).
 */
export default function TaskForm({ initial, members, canChangeStatus = true, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "todo",
    priority: initial?.priority ?? "medium",
    dueDate: initial?.dueDate ?? "",
    assigneeId: initial?.assigneeId ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const found = validateTask(
      values,
      members.map((m) => m.uid)
    );
    setErrors(found);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      setFormError(friendlyError(error));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card task-form" aria-label={isEdit ? "Edit task" : "New task"}>
      <h2>{isEdit ? "Edit task" : "New task"}</h2>
      {formError ? <Notice>{formError} Your input is still here - fix the problem and press save again.</Notice> : null}

      <TextField
        id="task-title"
        label="Title"
        required
        value={values.title}
        onChange={onChange("title")}
        hint={`${LIMITS.taskTitle.min}-${LIMITS.taskTitle.max} characters.`}
        error={errors.title}
      />

      <TextArea
        id="task-description"
        label="Description (optional)"
        value={values.description}
        onChange={onChange("description")}
        hint={`Up to ${LIMITS.description.max} characters.`}
        error={errors.description}
      />

      <div className="form-grid">
        <SelectField
          id="task-status"
          label="Status"
          value={values.status}
          onChange={onChange("status")}
          options={STATUSES}
          disabled={!canChangeStatus}
          hint={canChangeStatus ? undefined : "Only the assignee or the owner can change the status."}
          error={errors.status}
        />
        <SelectField
          id="task-priority"
          label="Priority"
          value={values.priority}
          onChange={onChange("priority")}
          options={PRIORITIES}
          error={errors.priority}
        />
        <TextField
          id="task-due"
          label="Due date (optional)"
          type="date"
          value={values.dueDate}
          onChange={onChange("dueDate")}
          error={errors.dueDate}
        />
        <SelectField
          id="task-assignee"
          label="Assignee (optional)"
          value={values.assigneeId}
          onChange={onChange("assigneeId")}
          options={[{ value: "", label: "Unassigned" }, ...members.map((m) => ({ value: m.uid, label: m.name }))]}
          error={errors.assigneeId}
        />
      </div>

      <div className="actions">
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
