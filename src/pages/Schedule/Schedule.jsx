import React, { useState } from 'react';
import Label from '../../components/common/Label.jsx';
import Field from '../../components/common/Field.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { getSchedule } from '../../api/schedule.js';
import './Schedule.css';
export default function Schedule() {
  const [input, setInput] = useState({
      contractDate: '',
      balanceDate: '',
      moveInDate: '',
    }),
    [data, setData] = useState(null);
  const [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const groups = [
    ['TODAY', '오늘 할 일'],
    ['UPCOMING', '다가오는 일'],
    ['PAST', '지난 일'],
  ];
  const dates = [
    ['contractDate', '계약일', true],
    ['balanceDate', '잔금일', true],
    ['moveInDate', '입주일 (선택)', false],
  ];
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setData(await getSchedule(input));
    } catch (e) {
      setError(e);
      if (e.field) requestAnimationFrame(() => document.getElementById(e.field)?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="content">
      <Label>전세 계약 일정표</Label>
      <h1>언제, 무엇을 해야 할까요?</h1>
      <p className="intro">
        계약일과 잔금일을 입력하면 날짜에 맞춰 할 일을 정리해 드려요.
      </p>
      <form className="card action-card" onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="dates">
            {dates.map(([name, label, required]) => (
              <Field
                key={name}
                name={name}
                label={label}
                type="date"
                required={required}
                min={
                  name === 'balanceDate'
                    ? input.contractDate
                    : name === 'moveInDate'
                      ? input.balanceDate
                      : undefined
                }
                value={input[name]}
                error={error?.field === name ? error.message : null}
                onChange={(e) => {
                  setInput({ ...input, [name]: e.target.value });
                  setData(null);
                  setError(null);
                }}
              />
            ))}
          </div>
          <p className="muted">입주일을 비우면 잔금일과 같은 날로 계산해요.</p>
          {!error?.field && <ErrorBox error={error} />}
          <button className="primary" disabled={busy}>
            {busy
              ? '계산하는 중…'
              : error && !error.field
                ? '다시 시도'
                : '일정표 만들기'}
          </button>
        </fieldset>
      </form>
      {data && (
        <div aria-live="polite">
          <p className="schedule-summary">
            오늘 {data.today} <span>·</span> 계약 만기 {data.expiryDate}
          </p>
          {groups.map(([key, title]) => {
            const items = data.items.filter((item) => item.status === key);
            return (
              <section key={key} className="task-group">
                <h2>
                  {title} <small>{items.length}</small>
                </h2>
                <ul className="stack">
                  {items.length ? (
                    items.map((item) => (
                      <li
                        key={item.order}
                        className={'card task ' + (item.important ? 'important' : '')}
                      >
                        <div className="task-date">
                          <strong>
                            {item.daysLeft === 0
                              ? 'D-day'
                              : item.daysLeft > 0
                                ? 'D−' + item.daysLeft
                                : 'D+' + Math.abs(item.daysLeft)}
                          </strong>
                          <time dateTime={item.date}>{item.date}</time>
                        </div>
                        <div>
                          {item.important && <span className="badge">중요</span>}
                          <h3>{item.title}</h3>
                          {item.reason && <p>{item.reason}</p>}
                          {item.link && (
                            <a href={item.link.url} target="_blank" rel="noreferrer">
                              {item.link.name} ↗
                            </a>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="muted">해당하는 일정이 없어요.</li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
