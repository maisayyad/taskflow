"use client";

import { PRIORITIES, SORT_OPTIONS, STATUSES } from "@/lib/tasks";
import { SelectField, TextField } from "./FormFields";

/** FR-13: search by title + filter by status, priority and assignee (+ bonus sorting). */
export default function FilterBar({ filters, onChange, sortBy, onSortChange, members, onReset, shown, total }) {
  const set = (field) => (event) => onChange({ ...filters, [field]: event.target.value });

  return (
    <form className="card filter-bar" role="search" aria-label="Filter tasks" onSubmit={(e) => e.preventDefault()}>
      <TextField
        id="filter-search"
        label="Search task titles"
        type="search"
        placeholder="e.g. navbar"
        value={filters.search}
        onChange={set("search")}
      />
      <SelectField
        id="filter-status"
        label="Status"
        value={filters.status}
        onChange={set("status")}
        options={[{ value: "all", label: "All statuses" }, ...STATUSES]}
      />
      <SelectField
        id="filter-priority"
        label="Priority"
        value={filters.priority}
        onChange={set("priority")}
        options={[{ value: "all", label: "All priorities" }, ...PRIORITIES]}
      />
      <SelectField
        id="filter-assignee"
        label="Assignee"
        value={filters.assignee}
        onChange={set("assignee")}
        options={[
          { value: "all", label: "Anyone" },
          { value: "unassigned", label: "Unassigned" },
          ...members.map((m) => ({ value: m.uid, label: m.name })),
        ]}
      />
      <SelectField
        id="sort-by"
        label="Sort by"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
        options={SORT_OPTIONS}
      />
      <div className="filter-footer">
        <p className="muted small" role="status" aria-live="polite">
          Showing {shown} of {total} tasks
        </p>
        <button type="button" className="btn btn-small" onClick={onReset}>
          Clear filters
        </button>
      </div>
    </form>
  );
}
