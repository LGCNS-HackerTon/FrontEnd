import React from 'react';
import Label from '../../components/common/Label.jsx';
import Notice from '../../components/common/Notice.jsx';
import Clause from './Clause.jsx';
import './Result.css';
export default function Result({ result, start }) {
  const all = [
    ...result.factors,
    { code: 'common', title: '공통으로 확인할 내용', ...result.commonAdvice },
  ];
  return (
    <section className="content">
      <Label>등기부 진단 결과</Label>
      <h1>계약 전, 이렇게 확인해요</h1>
      <div className={'score card ' + result.grade.toLowerCase()}>
        <div>
          <span className="badge">{result.gradeLabel}</span>
          <h2>{result.gradeMessage}</h2>
          <p>{result.aiExplanation}</p>
        </div>
        <div className="number">
          <strong>{result.score}</strong>점<small>부채비율 {result.debtRatio}%</small>
        </div>
      </div>
      {result.warnings.map((w) => (
        <Notice key={w} kind="warning">
          {w}
        </Notice>
      ))}
      <h2 className="section-heading">확인할 항목과 필요한 조치</h2>
      <div className="stack">
        {all.map((factor) => (
          <article className="card action-card" key={factor.code}>
            <h3>{factor.title}</h3>
            {factor.explanation && <p>{factor.explanation}</p>}
            {factor.askAgent && (
              <div className="ask">
                <strong>중개사에게 물어보세요</strong>
                <p>{factor.askAgent}</p>
              </div>
            )}
            <Clause text={factor.specialClause} />
          </article>
        ))}
      </div>
      <Notice>{result.disclaimer}</Notice>
      <div className="actions">
        <button className="primary" onClick={() => start('/schedule')}>
          일정표 만들기 →
        </button>
        <button className="secondary" onClick={() => start('/diagnosis')}>
          다른 집 다시 진단
        </button>
      </div>
    </section>
  );
}
