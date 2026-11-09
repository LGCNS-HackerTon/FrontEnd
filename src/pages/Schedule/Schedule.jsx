import React, { useEffect, useState } from 'react';
import Label from '../../components/common/Label.jsx';
import Field from '../../components/common/Field.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { getSchedule } from '../../api/schedule.js';
import { readChecklist, saveChecklist } from '../../services/checklist.js';
import './Schedule.css';
// owner: 로그인한 계정(이메일). 없으면 이 브라우저 공용 체크리스트로 저장해요.
export default function Schedule({ owner }) {
  const saved = readChecklist(owner);
  const [input, setInput] = useState(
      saved?.dates ?? { contractDate: '', balanceDate: '', moveInDate: '' },
    ),
    [data, setData] = useState(null),
    [done, setDone] = useState(saved?.done ?? []);
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
  async function load(dates) {
    setBusy(true);
    setError(null);
    try {
      const result = await getSchedule(dates);
      // 날짜를 바꿔도 같은 할 일(order)에 한 체크는 남겨요.
      const kept = done.filter((order) => result.items.some((item) => item.order === order));
      setData(result);
      setDone(kept);
      saveChecklist(owner, { dates, done: kept, total: result.items.length });
    } catch (e) {
      setError(e);
      if (e.field) requestAnimationFrame(() => document.getElementById(e.field)?.focus());
    } finally {
      setBusy(false);
    }
  }
  // 저장된 체크리스트가 있으면 다시 열 때 바로 보여줘요.
  useEffect(() => {
    if (saved) load(saved.dates);
  }, []);
  function toggle(order) {
    const next = done.includes(order) ? done.filter((o) => o !== order) : [...done, order];
    setDone(next);
    saveChecklist(owner, { dates: input, done: next, total: data.items.length });
  }
  const finished = data ? data.items.filter((item) => done.includes(item.order)).length : 0;
  return (
    <section className="content">
      <Label>전세 계약 체크리스트</Label>
      <h1>언제, 무엇을 해야 할까요?</h1>
      <p className="intro">
        계약일과 잔금일을 입력하면 날짜에 맞춰 할 일을 정리해 드려요. 끝낸 일은 체크해 두세요.
        체크한 내용은 {owner ? '로그인한 계정별로 이 브라우저에' : '이 브라우저에'} 자동 저장돼요.
      </p>
      <form
        className="card action-card"
        onSubmit={(e) => {
          e.preventDefault();
          load(input);
        }}
      >
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
                : '체크리스트 만들기'}
          </button>
        </fieldset>
      </form>
      {data && (
        <div aria-live="polite">
          <p className="schedule-summary">
            오늘 {data.today} <span>·</span> 계약 만기 {data.expiryDate}
          </p>
          <div className="checklist-progress">
            <p>
              <strong>
                {finished}/{data.items.length}
              </strong>{' '}
              완료
            </p>
            <progress value={finished} max={data.items.length} aria-label="체크리스트 진행률" />
          </div>
          {groups.map(([key, title]) => {
            const items = data.items.filter((item) => item.status === key);
            return (
              <section key={key} className="task-group">
                <h2>
                  {title} <small>{items.length}</small>
                </h2>
                <ul className="stack">
                  {items.length ? (
                    items.map((item) => {
                      const checked = done.includes(item.order);
                      return (
                        <li
                          key={item.order}
                          className={
                            'card task' +
                            (item.important ? ' important' : '') +
                            (checked ? ' done' : '')
                          }
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
                          <label className="task-check">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(item.order)}
                              aria-label={`${item.title} 완료`}
                            />
                            완료
                          </label>
                        </li>
                      );
                    })
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
