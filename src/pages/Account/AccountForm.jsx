import React, { useState } from 'react';
import Label from '../../components/common/Label.jsx';
import Notice from '../../components/common/Notice.jsx';
import Field from '../../components/common/Field.jsx';
import { go } from '../../app/navigation.js';
import { demoEmail, registerAccount, verifyAccount } from '../../services/account.js';
import './Account.css';
export default function AccountForm({ login, signup = false }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const title = signup ? '회원가입' : '로그인';
  function update(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError(null);
  }
  function showError(field, message) {
    setError({ field, message });
    if (field) document.getElementById(field)?.focus();
  }
  async function submit(e) {
    e.preventDefault();
    if (signup && !values.name.trim()) return showError('name', '이름을 입력해 주세요.');
    if (signup && values.password !== values.confirm)
      return showError('confirm', '비밀번호가 일치하지 않아요.');
    setBusy(true);
    setError(null);
    try {
      const email = signup
        ? await registerAccount(values)
        : await verifyAccount(values.email, values.password);
      if (email) login(email);
      else if (signup) showError('email', '이미 사용 중인 이메일이에요.');
      else showError('password', '이메일 또는 비밀번호를 확인해 주세요.');
    } catch {
      showError(
        null,
        '계정 정보를 처리할 수 없어요. 브라우저 저장 설정을 확인하고 다시 시도해 주세요.',
      );
    } finally {
      setBusy(false);
    }
  }
  const fieldError = (name) => (error?.field === name ? error.message : null);
  return (
    <section className="narrow card panel">
      <Label>전세역전 계정</Label>
      <h1>{title}</h1>
      <p className="intro">
        {signup
          ? '계정을 만들고 진단 내역을 한곳에서 확인해요.'
          : '로그인하고 전세역전 진단을 시작해 보세요.'}
      </p>
      <Notice>
        데모 계정 정보는 이 브라우저에 저장돼요. 실제 서비스에서 쓰는 비밀번호는 입력하지
        마세요.
      </Notice>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          {signup && (
            <Field
              label="이름"
              name="name"
              autoComplete="name"
              maxLength={30}
              required
              value={values.name}
              onChange={update}
              error={fieldError('name')}
            />
          )}
          <Field
            label="이메일"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="name@example.com"
            maxLength={254}
            required
            value={values.email}
            onChange={update}
            error={fieldError('email')}
          />
          <Field
            label="비밀번호"
            name="password"
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            minLength={signup ? 8 : undefined}
            maxLength={128}
            hint={signup ? '8자 이상으로 입력해 주세요.' : null}
            required
            value={values.password}
            onChange={update}
            error={fieldError('password')}
          />
          {signup && (
            <Field
              label="비밀번호 확인"
              name="confirm"
              type="password"
              autoComplete="new-password"
              maxLength={128}
              required
              value={values.confirm}
              onChange={update}
              error={fieldError('confirm')}
            />
          )}
          {error && !error.field && <Notice kind="error">{error.message}</Notice>}
          <button className="primary full" disabled={busy}>
            {busy ? '처리 중…' : title}
          </button>
        </fieldset>
      </form>
      {!signup && (
        <button
          className="secondary full"
          disabled={busy}
          onClick={() => login(demoEmail)}
        >
          데모 계정으로 시작
        </button>
      )}
      <p className="account-switch">
        {signup ? '이미 계정이 있나요?' : '처음 오셨나요?'}{' '}
        <button
          className="text-button"
          disabled={busy}
          onClick={() => go(signup ? '/login' : '/signup', history.state)}
        >
          {signup ? '로그인' : '회원가입'}
        </button>
      </p>
    </section>
  );
}
