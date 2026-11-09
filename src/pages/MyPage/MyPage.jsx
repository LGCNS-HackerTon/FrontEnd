import React from 'react';
import Label from '../../components/common/Label.jsx';
import { readHistory, formatMoney } from '../../services/history.js';
// shortcut: 질문 문구는 docs/01과 같은 Mock 목록에서 읽어요. 서버 문구가 달라지면 기록에 문구도 저장하도록 바꿔요.
import { questions } from '../../api/mock/questions.js';
import { safeScore } from '../../services/score.js';
import { readProfile } from '../../services/account.js';
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
  const profile = readProfile(email),
    history = readHistory(email);
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
        바뀌어요. (데모: 이 브라우저에만 저장)
      </p>
      {history.length ? (
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
      <div className="actions">
        <button className="primary" onClick={() => start('/diagnosis')}>
          등기부 진단 시작 →
        </button>
        <button className="secondary" onClick={() => start('/schedule')}>
          계약 일정표
        </button>
      </div>
    </section>
  );
}
