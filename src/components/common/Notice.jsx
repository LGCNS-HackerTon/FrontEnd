import React from 'react';
export default function Notice({ children, kind = '' }) {
  return (
    <p className={'notice ' + kind} role={kind === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  );
}
