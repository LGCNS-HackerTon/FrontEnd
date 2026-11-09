import React from 'react';
import Label from '../../components/common/Label.jsx';
import './Home.css';
const terms = [
  ['01', '등기부등본', '집의 이력서예요. 집주인과 집에 걸린 권리를 확인할 수 있어요.'],
  ['02', '표제부', '집의 주소, 크기, 용도가 적힌 소개란이에요.'],
  ['03', '갑구', '집주인과 소유권에 관한 기록이에요.'],
  ['04', '을구', '이 집에 걸린 빚과 다른 사람의 권리를 확인하는 곳이에요.'],
  ['05', '빨간 줄', '이미 지워진 기록을 뜻해요. 현재 기록은 빨간 줄이 없어요.'],
  ['06', '건축물대장', '불법 증축 등 건물의 상태를 확인할 수 있어요.'],
];
export default function Home({ start }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <Label>처음 하는 전세 계약이라면</Label>
          <h1>
            도장 찍기 전에,
            <br />
            <em>등기부부터</em> 같이 읽어요.
          </h1>
          <p>
            등기부등본을 옆에 두고 질문 10개에 답해 보세요.
            <br className="desktop" /> 계약 전에 확인할 것과 다음 일정을 알려드려요.
          </p>
          <div className="actions">
            <button className="primary" onClick={() => start('/diagnosis')}>
              등기부 진단 시작 <span aria-hidden="true">↗</span>
            </button>
            <button className="secondary" onClick={() => start('/schedule')}>
              일정표만 만들기
            </button>
          </div>
        </div>
        <div className="illustration" aria-hidden="true">
          <div className="orbit"></div>
          <div className="paper">
            <div className="paper-head">
              <span>⌂</span>
              <b>등기부 체크리스트</b>
            </div>
            <div className="paper-row">
              <i>✓</i>
              <span>주소가 맞나요?</span>
            </div>
            <div className="paper-row">
              <i>✓</i>
              <span>집주인이 맞나요?</span>
            </div>
            <div className="paper-row">
              <i>?</i>
              <span>근저당권이 있나요?</span>
            </div>
            <div className="paper-line"></div>
          </div>
          <div className="float-note">
            <b>10가지 질문</b>
            <small>계약 전 차근차근</small>
          </div>
        </div>
      </section>
      <section className="glossary">
        <Label>시작하기 전에</Label>
        <h2>처음 보는 단어부터 쉽게</h2>
        <div className="term-grid">
          {terms.map(([n, title, body]) => (
            <article className="card" key={n}>
              <span className="term-index">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
