import React, { useEffect, useRef, useState } from 'react';
import Label from '../../components/common/Label.jsx';
import ScoreGuide from '../../components/common/ScoreGuide.jsx';
import { questions } from '../../api/mock/questions.js';
import './Home.css';

// 등기부 예시의 칸과 그 칸에서 확인하는 실제 질문(docs/01)을 이어 줘요.
const sheet = [
  {
    id: 'TITLE',
    name: '표제부',
    plain: '집 소개란',
    rows: ['서울 ○○구 ○○로 12, 101동 1204호', '철근콘크리트 · 공동주택(아파트)'],
  },
  {
    id: 'GAPGU',
    name: '갑구',
    plain: '주인 이야기',
    rows: ['소유권이전 · 소유자 홍○○', '압류·신탁 기록 확인'],
  },
  {
    id: 'EULGU',
    name: '을구',
    plain: '빚 이야기',
    rows: ['근저당권설정 · 채권최고액', '전세권·임차권 기록 확인'],
  },
];
// 랜딩에서는 질문(docs/01)을 "~ 여부" 점검 항목으로 짧게 보여줘요. 진단 화면의 질문 문구는 그대로예요.
const checkItems = {
  T1_ADDRESS: '주소(동·호수까지)와 계약할 집 주소 일치 여부',
  T2_USAGE: '건물 용도가 주택(아파트 · 다세대 · 연립 · 다가구 · 단독)인지 여부',
  A1_OWNER: '소유자와 계약하러 나온 집주인 동일 여부',
  A2_RECENT_OWNER: '최근 3개월 안 소유권 변경 여부',
  A3_TRUST: '신탁 등기 여부',
  A4_SEIZURE: '압류 · 가압류 · 가처분 · 가등기 · 경매 기록 여부',
  B1_MORTGAGE: '근저당권 설정 여부와 채권최고액',
  B2_LEASE_REG: '주택임차권(임차권등기) 여부',
  B3_JEONSE_RIGHT: '다른 사람 이름의 전세권 여부',
};
const steps = [
  ['계약할 집 주소', '동·호수까지 적어요.'],
  ['서류 올리기', '등기부등본은 꼭, 건축물대장은 있으면 올려요.'],
  ['확인 못 한 것만 답하기', '서류에서 읽은 답은 그대로 쓰고, 나머지만 물어봐요.'],
  ['결과 받기', '위험 이유, 중개사에게 물어볼 질문, 특약 문구, 체크리스트까지.'],
];
// 등급 문구는 Mock 결과 그대로, 범위는 100점에서 깎는 안전 점수 기준이에요 (위험 점수 0~29 · 30~59 · 60+ 와 같은 경계).
const grades = [
  ['safe', '안전', '71~100점', '큰 위험 신호는 없어요. 잔금일에 등기부를 다시 확인하세요.'],
  ['caution', '주의', '41~70점', '아래 질문을 중개사에게 꼭 물어보세요.'],
  ['danger', '위험', '40점 이하', '계약을 다시 생각해 보세요. 전문가 상담을 권해요.'],
];
const outputs = [
  ['위험 이유', '어떤 칸이 왜 위험한지 쉬운 말로 알려 드려요.'],
  ['중개사에게 물어볼 질문', '계약 전에 그대로 물어보면 되는 질문이에요.'],
  ['특약 문구', '계약서에 넣을 문장을 버튼 하나로 복사해요.'],
  ['계약 체크리스트', '계약일부터 입주일까지 할 일을 D-day로 정리하고 하나씩 체크해요.'],
];
const terms = [
  ['등기부등본', '집의 이력서예요. 집주인과 집에 걸린 권리를 확인할 수 있어요.'],
  ['표제부', '집의 주소, 크기, 용도가 적힌 소개란이에요.'],
  ['갑구', '집주인과 소유권에 관한 기록이에요.'],
  ['을구', '이 집에 걸린 빚과 다른 사람의 권리를 확인하는 곳이에요.'],
  ['빨간 줄', '이미 지워진 기록을 뜻해요. 현재 기록은 빨간 줄이 없어요.'],
  ['건축물대장', '건물의 건강검진표예요. 위반건축물인지 확인할 수 있어요.'],
  ['건축물대장부', '건축물대장을 부르는 다른 말이에요. 정부24에서 무료로 발급할 수 있어요.'],
];

export default function Home({ start }) {
  const [part, setPart] = useState('TITLE');
  const [grade, setGrade] = useState('caution');
  const root = useRef(null);
  const active = sheet.find((item) => item.id === part);
  const shownGrade = grades.find(([id]) => id === grade);

  // 스크롤로 들어온 블록을 한 번만 보여 줘요. JS가 없으면 처음부터 다 보여요.
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return;
    el.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }),
      { threshold: 0.2 },
    );
    el.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing" ref={root}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Label>처음 하는 전세 계약이라면</Label>
          <h1 id="hero-title">
            도장 찍기 전에,
            <br />
            <em>서류부터</em> 확인해 드릴게요.
          </h1>
          <p className="hero-lead">
            등기부등본과 건축물대장을 올려 주세요. 서류로 확인하지 못한 것만 물어볼게요.
          </p>
          <div className="actions">
            <button className="primary" onClick={() => start('/diagnosis')}>
              서류 진단 시작 <span aria-hidden="true">→</span>
            </button>
            <button className="secondary" onClick={() => start('/schedule')}>
              체크리스트만 만들기
            </button>
          </div>
        </div>

        {/* 시안(로컬): 실제 등기부처럼 생긴 예시 위에 최종 점수표 예시를 겹쳐 보여줘요. 값은 데모 케이스 B */}
        <div className="mock-wrap">
        <div className="mock-stage">
          <div className="mock-registry" aria-label="등기사항전부증명서 예시">
            <p className="reg-doc">등기사항전부증명서(현재 유효사항) - 집합건물</p>
            <p className="reg-addr">[집합건물] 서울특별시 ○○구 ○○로 12 제101동 제1204호</p>
            <button
              type="button"
              className={'reg-part' + (part === 'TITLE' ? ' on' : '')}
              aria-pressed={part === 'TITLE'}
              onClick={() => setPart('TITLE')}
            >
              <span className="reg-head">【 표 제 부 】 ( 전유부분의 건물의 표시 )</span>
              <span className="reg-table">
                <span>표시번호</span>
                <span>접수</span>
                <span>건물번호</span>
                <span>건물내역</span>
                <span>1</span>
                <span>2019년3월4일</span>
                <span>제12층 제1204호</span>
                <span>철근콘크리트구조 84.9㎡</span>
              </span>
            </button>
            <button
              type="button"
              className={'reg-part' + (part === 'GAPGU' ? ' on' : '')}
              aria-pressed={part === 'GAPGU'}
              onClick={() => setPart('GAPGU')}
            >
              <span className="reg-head">【 갑 구 】 ( 소유권에 관한 사항 )</span>
              <span className="reg-table">
                <span>순위번호</span>
                <span>등기목적</span>
                <span>접수</span>
                <span>권리자 및 기타사항</span>
                <span>1</span>
                <span>소유권보존</span>
                <span>2019년3월4일</span>
                <span>소유자 김○○</span>
                <span>2</span>
                <span>소유권이전</span>
                <span>2026년9월1일</span>
                <span>소유자 홍○○</span>
              </span>
            </button>
            <button
              type="button"
              className={'reg-part' + (part === 'EULGU' ? ' on' : '')}
              aria-pressed={part === 'EULGU'}
              onClick={() => setPart('EULGU')}
            >
              <span className="reg-head">【 을 구 】 ( 소유권 이외의 권리에 관한 사항 )</span>
              <span className="reg-table">
                <span>순위번호</span>
                <span>등기목적</span>
                <span>접수</span>
                <span>권리자 및 기타사항</span>
                <span className="reg-struck">1</span>
                <span className="reg-struck">근저당권설정</span>
                <span className="reg-struck">2020년5월7일</span>
                <span className="reg-struck">채권최고액 금24,000,000원</span>
                <span>2</span>
                <span>근저당권설정</span>
                <span>2026년9월1일</span>
                <span>채권최고액 금36,000,000원</span>
              </span>
            </button>
          </div>

          <div className="mock-score danger" aria-label="진단 결과 예시">
            <div className="mock-score-top">
              <span className="badge">위험</span>
              <p>
                <strong>30</strong>점 <small>100점에서 70점 깎였어요</small>
              </p>
            </div>
            <div className="mock-gauge" aria-hidden="true">
              <span className="mock-pin" style={{ left: '30%' }}>
                30
              </span>
            </div>
            <ul>
              <li>
                <span>부채비율 98.6%</span>
                <b>−40</b>
              </li>
              <li>
                <span>주택이 아닌 용도</span>
                <b>−20</b>
              </li>
              <li>
                <span>최근 3개월 안에 집주인 변경</span>
                <b>−10</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="sheet-note mock-note" aria-live="polite">
          <p className="sheet-note-title">
            {active.name}에서 확인하는 사항 <small>등기부 칸을 눌러 보세요</small>
          </p>
          <ul key={part}>
            {questions
              .filter((q) => q.section === part)
              .map((q) => (
                <li key={q.code}>{checkItems[q.code] ?? q.text}</li>
              ))}
          </ul>
        </div>
        </div>
      </section>

      <section className="flow" aria-labelledby="flow-title">
        <Label>이렇게 진행돼요</Label>
        <h2 id="flow-title">네 단계면 끝나요</h2>
        <ol className="flow-steps">
          {steps.map(([title, body], index) => (
            <li className="reveal" style={{ '--i': index }} key={title}>
              <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="preview" aria-labelledby="preview-title">
        <div className="preview-copy reveal">
          <Label>결과 미리보기</Label>
          <h2 id="preview-title">결과는 색과 글자, 점수로 함께 알려 드려요</h2>
          <p className="muted">
            100점에서 시작해 위험 신호마다 정해진 점수만큼 깎여요. 등급을 눌러 결과 화면이 어떻게
            보이는지 확인해 보세요.
          </p>
          <div className="grade-switch" role="group" aria-label="등급 미리보기">
            {grades.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={'secondary compact' + (id === grade ? ' on' : '')}
                aria-pressed={id === grade}
                onClick={() => setGrade(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="preview-stage reveal">
          <div className={'score card ' + shownGrade[0]} key={grade}>
            <div>
              <span className="badge">{shownGrade[1]}</span>
              <h3>{shownGrade[3]}</h3>
            </div>
            <p className="preview-range">{shownGrade[2]}</p>
          </div>
          <ScoreGuide />
          <ul className="preview-outputs">
            {outputs.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glossary" aria-labelledby="glossary-title">
        <Label>시작하기 전에</Label>
        <h2 id="glossary-title">처음 보는 단어부터 쉽게</h2>
        <div className="term-grid">
          {terms.map(([title, body], index) => (
            <article className="card reveal" style={{ '--i': index % 3 }} key={title}>
              <span className="term-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="trust" aria-labelledby="trust-title">
        <h2 id="trust-title">전세역전이 지키는 약속</h2>
        <ul className="trust-points">
          <li>올린 서류와 주소는 저장하지 않아요.</li>
          <li>점수와 등급은 정해진 규칙으로만 계산해요.</li>
          <li>참고용이며 법적 판단이 아닙니다. 계약 전 공인중개사·전문가에게 확인하세요.</li>
        </ul>
        <div className="actions">
          <button className="trust-primary" onClick={() => start('/diagnosis')}>
            서류 진단 시작 <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="trust-links">
          이미 안심전세 앱을 쓰고 있다면 같이 쓰면 더 좋아요 ·{' '}
          <a href="https://www.iros.go.kr" target="_blank" rel="noreferrer">
            인터넷등기소 ↗
          </a>{' '}
          ·{' '}
          <a href="https://www.gov.kr" target="_blank" rel="noreferrer">
            정부24 ↗
          </a>
        </p>
      </section>
    </div>
  );
}
