import React from 'react';
export default function Field({ label, name, hint, error, unit, ...props }) {
  return (
    <label className="field" htmlFor={name}>
      <span>{label}</span>
      {hint && <small id={name + '-hint'}>{hint}</small>}
      <span className="input-wrap">
        <input
          name={name}
          id={name}
          aria-invalid={!!error}
          aria-describedby={
            [hint && name + '-hint', error && name + '-error']
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...props}
        />
        {unit && <b>{unit}</b>}
      </span>
      {error && (
        <small className="field-error" id={name + '-error'} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
