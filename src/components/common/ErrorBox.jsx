import React from 'react';
import Notice from './Notice.jsx';
const networkError = '잠시 후 다시 시도해 주세요.';
export default function ErrorBox({ error }) {
  return (
    error && (
      <Notice kind="error">
        {error.code === 'INVALID_INPUT' ? error.message : networkError}
      </Notice>
    )
  );
}
