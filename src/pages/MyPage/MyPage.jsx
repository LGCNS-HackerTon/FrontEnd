import React, { useState, useEffect } from 'react';
import Label from '../../components/common/Label.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { readHistory, loadHistory, formatMoney } from '../../services/history.js';
// shortcut: 질문 문구는 docs/01과 같은 Mock 목록에서 읽어요. 서버 문구가 달라지면 기록에 문구도 저장하도록 바꿔요.
import { questions } from '../../api/mock/questions.js';
import { safeScore } from '../../services/score.js';
import { readChecklist } from '../../services/checklist.js';
import { readProfile, loadProfile } from '../../services/account.js';
import { useMock } from '../../api/client.js';
import './MyPage.css';
const answerLabel = { YES: '예', NO: '아니오', UNKNOWN: '모르겠어요' };
// 기록을 펼치면 금액과 답 10개를 보여주고, 항목별로 고쳐 다시 진단할 수 있어요 (D8).
function HistoryDetail({ item, edit }) {
  const request = item.request;
  if (!request)
    return (
      <p className="muted history-detail">
        예전 방식으로 저장한 기록이라 조건을 수정할 수 없어요. 새로 진단해 주세요.
      </p>
    );
  const answers = Object.fromEntries(request.answers.map((a) => [a.code, a.answer]));
  const amounts = [
    ['내 보증금', request.deposit],
    ['매매 시세', request.salePrice],
    ['선순위 보증금', request.seniorDeposit],
    ...(answers.B1_MORTGAGE === 'YES' ? [['채권최고액', request.mortgageMax]] : []),
  ];
  return (
    <div className="history-detail">
      <div className="history-row">
        <h4>금액</h4>
        <button className="secondary compact" onClick={() => edit(item, 'amounts')}>
          금액 수정하기
        </button>
      </div>
      <dl className="history-amounts">
        {amounts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value === null ? '입력 안 함' : formatMoney(value)}</dd>
          </div>
        ))}
      </dl>
      <h4>질문 답 10개</h4>
      <ul className="history-answers">
        {questions.map((q) => (
          <li key={q.code}>
            <span>
              <small className="muted">{q.sectionName}</small>
              {q.text}
            </span>
            <b>{answerLabel[answers[q.code]]}</b>
            <button className="quiet compact" onClick={() => edit(item, q.code)}>
              수정하기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default function MyPage({ email, start, logout, edit }) {
  // 서버 모드는 내 정보(8번)·내 진단 기록(9번)을 따로 불러와요. 기록을 못 읽어도 로그아웃은 할 수 있게요.
  const [server, setServer] = useState({});
  useEffect(() => {
    if (useMock) return;
    const put = (value) => setServer((prev) => ({ ...prev, ...value }));
    loadProfile(email).then(
      (profile) => put({ profile }),
      (error) => put({ error }),
    );
    loadHistory(email).then(
      (history) => put({ history }),
      (historyError) => put({ historyError }),
    );
  }, [email]);
  const { profile, history, error, historyError } = useMock
    ? { profile: readProfile(email), history: readHistory(email) }
    : server;
  const checklist = readChecklist(email);
  if (!profile)
    return (
      <section className="content">
        <Label>전세역전 계정</Label>
        <h1>마이페이지</h1>
        {error ? <ErrorBox error={error} /> : <p className="muted">불러오는 중…</p>}
      </section>
    );
  const dateFormat = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeZone: 'Asia/Seoul',
  });
  return (
    <section className="content">
      <Label>전세역전 계정</Label>
      <h1>마이페이지</h1>
      <p className="intro">내 계정과 최근 진단 기록을 확인해요.</p>
      <article className="card action-card profile">
        <span className="profile-initial" aria-hidden="true">
          {[...profile.name][0]}
        </span>
        <div>
          <h2>{profile.name}님</h2>
          <p>{profile.email}</p>
        </div>
        <button className="logout" onClick={logout}>
          로그아웃
        </button>
      </article>
      <h2 className="section-heading">최근 등기부 진단</h2>
      <p className="muted">
        최근 진단 5건을 처음 진단한 순서로 보여줘요. 조건을 수정해 다시 검토하면 그 기록이 새 결과로
        바뀌어요.{useMock && ' (데모: 이 브라우저에만 저장)'}
      </p>
      {historyError ? (
        <ErrorBox error={historyError} />
      ) : !history ? (
        <p className="muted">불러오는 중…</p>
      ) : history.length ? (
        <ul className="stack diagnosis-history">
          {history.map((item) => (
            <li className={'card history-item ' + item.grade.toLowerCase()} key={item.id}>
              <details>
                <summary>
                  <div>
                    <h3>{item.location}</h3>
                    <time dateTime={item.date}>{dateFormat.format(new Date(item.date))}</time>
                    {item.updatedAt && (
                      <small className="muted">
                        {' '}
                        · {dateFormat.format(new Date(item.updatedAt))} 수정
                      </small>
                    )}
                  </div>
                  <div className="history-grade">
                    <span className="badge">{item.gradeLabel}</span>
                    <strong>{safeScore(item.score)}점</strong>
                    <span className="muted history-toggle">조건 보기</span>
                  </div>
                </summary>
                <HistoryDetail item={item} edit={edit} />
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="notice">아직 진단 내역이 없어요. 첫 등기부 진단을 시작해 보세요.</p>
      )}
      <h2 className="section-heading">계약 체크리스트</h2>
      {checklist ? (
        <article className="card action-card checklist-card">
          <p className="muted">
            계약일 {checklist.dates.contractDate} · 잔금일 {checklist.dates.balanceDate}
          </p>
          <p>
            <strong>
              {checklist.done.length}/{checklist.total}
            </strong>{' '}
            완료
          </p>
          <progress
            value={checklist.done.length}
            max={checklist.total || 1}
            aria-label="체크리스트 진행률"
          />
          <button className="secondary compact" onClick={() => start('/schedule')}>
            이어서 보기
          </button>
        </article>
      ) : (
        <p className="notice">아직 만든 체크리스트가 없어요. 계약일과 잔금일로 만들어 보세요.</p>
      )}
      <div className="actions">
        <button className="primary" onClick={() => start('/diagnosis')}>
          등기부 진단 시작 →
        </button>
        <button className="secondary" onClick={() => start('/schedule')}>
          계약 체크리스트
        </button>
      </div>
    </section>
  );
}
