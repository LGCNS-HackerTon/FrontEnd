import React from 'react';
import Label from '../../components/common/Label.jsx';
import { readHistory } from '../../services/history.js';
import { readProfile } from '../../services/account.js';
import './MyPage.css';
export default function MyPage({ email, start }) {
  const profile = readProfile(email),
    history = readHistory(email);
  const dateFormat = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeZone: 'Asia/Seoul',
  });
  return (
    <section className="content">
      <Label>첫 전세 계정</Label>
      <h1>마이페이지</h1>
      <p className="intro">내 계정과 최근에 진단한 집을 확인해요.</p>
      <article className="card action-card profile">
        <span className="profile-initial" aria-hidden="true">
          {[...profile.name][0]}
        </span>
        <div>
          <h2>{profile.name}님</h2>
          <p>{profile.email}</p>
        </div>
      </article>
      <h2 className="section-heading">최근 등기부 진단</h2>
      <p className="muted">이 브라우저에 최근 진단 10건의 요약을 저장해요.</p>
      {history.length ? (
        <ul className="stack diagnosis-history">
          {history.map((item) => (
            <li className={'card history-item ' + item.grade.toLowerCase()} key={item.id}>
              <div>
                <h3>{item.location}</h3>
                <time dateTime={item.date}>{dateFormat.format(new Date(item.date))}</time>
              </div>
              <div className="history-grade">
                <span className="badge">{item.gradeLabel}</span>
                <strong>{item.score}점</strong>
              </div>
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
