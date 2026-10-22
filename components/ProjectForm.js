"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/errors";
import { LIMITS, hasErrors, validateProject } from "@/lib/validation";
import { TextArea, TextField } from "./FormFields";
import { Notice } from "./StateViews";

/**
 * Create / edit project form (FR-05, FR-06).
 * onSubmit(values) must return a promise; rejection messages are shown inside the form.
 */
export default function ProjectForm({ initial, submitLabel, savingLabel = "Saving...", onSubmit, onCancel, onSaved }) {
  const [values, setValues] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    onSaved?.(false);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const found = validateProject(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      await onSubmit(values);
      onSaved?.(true);
    } catch (error) {
      console.error(error);
      setFormError(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError ? <Notice>{formError}</Notice> : null}

      <TextField
        id="project-name"
        label="Project name"
        required
        maxLength={LIMITS.projectName.max + 20}
        hint={`${LIMITS.projectName.min}-${LIMITS.projectName.max} characters.`}
        value={values.name}
        onChange={onChange("name")}
        error={errors.name}
      />

      <TextArea
        id="project-description"
        label="Description (optional)"
        hint={`Up to ${LIMITS.description.max} characters.`}
        value={values.description}
        onChange={onChange("description")}
        error={errors.description}
      />

      <div className="actions">
        {onCancel ? (
          <button type="button" className="btn" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
