import React, { useState } from 'react';
import Notice from '../../components/common/Notice.jsx';
// 복사가 실패해도 사용자가 직접 선택할 수 있도록 문구를 유지해요.
export default function Clause({ text }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('복사했어요');
    } catch {
      setStatus('문구를 직접 선택해 복사해 주세요.');
    }
  }
  return text == null ? (
    <Notice kind="warning">계약 보류를 권해요.</Notice>
  ) : (
    <div className="clause">
      <p>{text}</p>
      <button className="secondary compact" onClick={copy}>
        특약 복사
      </button>
      <small aria-live="polite">{status}</small>
    </div>
  );
}
