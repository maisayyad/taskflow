// Accessible form controls: native <label>, error text linked via aria-describedby.

function describedBy(id, error, hint) {
  const ids = [];
  if (hint) ids.push(`${id}-hint`);
  if (error) ids.push(`${id}-error`);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldShell({ id, label, required, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? <span className="required"> (required)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ id, label, required, hint, error, ...props }) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({ id, label, required, hint, error, ...props }) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={id}
        rows={4}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </FieldShell>
  );
}

/** options: [{ value, label }] */
export function SelectField({ id, label, required, hint, error, options, ...props }) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
