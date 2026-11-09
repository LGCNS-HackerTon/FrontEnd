import React from 'react';
import { questions } from '../../api/mock/questions.js';

// 배점은 docs/01 규칙 그대로예요. 감점 숫자는 질문 데이터(points)에서 읽어 두 화면이 같은 값을 써요.
const reasons = {
  T1_ADDRESS: '표제부 주소(동·호수)가 계약할 집과 다름',
  T2_USAGE: '건물 용도가 주택이 아님 (근린생활시설·사무소 등)',
  A1_OWNER: '등기부 소유자와 계약하러 나온 집주인이 다름',
  A2_RECENT_OWNER: '최근 3개월 안에 소유권이 바뀜',
  A3_TRUST: '신탁 등기가 있음',
  A4_SEIZURE: '압류·가압류·가처분·가등기·경매 기록이 있음',
  B2_LEASE_REG: '이전 세입자의 주택임차권 등기가 있음',
  B3_JEONSE_RIGHT: '다른 사람 이름의 전세권이 있음',
  R1_VIOLATION: '건축물대장에 위반건축물 표시가 있음',
};
const debt = [
  ['90% 이상', 40],
  ['80% 이상 ~ 90% 미만', 25],
  ['70% 이상 ~ 80% 미만', 10],
];

export default function ScoreGuide({ open = false }) {
  return (
    <details className="score-guide" open={open}>
      <summary>점수 기준 보기</summary>
      <p className="score-guide-lead">
        100점에서 시작해 위험 신호마다 정해진 점수만큼 깎여요. 점수는 이 규칙으로만 계산해요.
      </p>
      <ul className="score-guide-grades">
        <li className="safe">안전 71~100점</li>
        <li className="caution">주의 41~70점</li>
        <li className="danger">위험 40점 이하</li>
      </ul>
      <h4>서류에서 확인하는 항목</h4>
      <ul className="score-guide-list">
        {questions
          .filter((q) => reasons[q.code])
          .map((q) => (
            <li key={q.code}>
              <span>{reasons[q.code]}</span>
              <b>−{q.points}</b>
            </li>
          ))}
      </ul>
      <h4>부채비율 (빚 + 보증금 ÷ 집값)</h4>
      <ul className="score-guide-list">
        {debt.map(([range, points]) => (
          <li key={range}>
            <span>{range}</span>
            <b>−{points}</b>
          </li>
        ))}
      </ul>
      <ul className="score-guide-notes">
        <li>※ &lsquo;모르겠어요&rsquo;는 위험한 답으로 계산해요. 근저당권만 모르겠어요면 −10이에요.</li>
        <li>※ −60 항목은 하나만 있어도 바로 위험 등급이 돼요.</li>
        <li>※ 근저당권은 따로 깎지 않고 채권최고액을 부채비율에 더해 계산해요.</li>
      </ul>
    </details>
  );
}
