import React from 'react';
import Label from '../../components/common/Label.jsx';
import Notice from '../../components/common/Notice.jsx';
import Clause from './Clause.jsx';
import ScoreGuide from '../../components/common/ScoreGuide.jsx';
import { safeScore, splitActions } from '../../services/score.js';
import './Result.css';

// "~하세요"처럼 사용자가 할 일을 말하는 문장은 버건디로 보여줘요.
function Actions({ text }) {
  return splitActions(text).map(({ sentence, action }, index) => (
    <React.Fragment key={index}>
      {index > 0 && ' '}
      {action ? <span className="action-text">{sentence}</span> : sentence}
    </React.Fragment>
  ));
}

export default function Result({ result, start }) {
  const all = [
    ...result.factors,
    { code: 'common', title: '공통으로 확인할 내용', ...result.commonAdvice },
  ];
  const score = safeScore(result.score);
  const lost = 100 - score;
  return (
    <section className="content">
      <Label>등기부 진단 결과</Label>
      <h1>계약 전, 이렇게 확인해요</h1>
      {result.historySaved === null && (
        <Notice>로그인하면 이 진단 기록을 마이페이지에 저장할 수 있어요.</Notice>
      )}
      {result.historySaved === true && result.historyUpdated && (
        <Notice>마이페이지의 기록을 새 조건의 결과로 바꿨어요.</Notice>
      )}
      {result.historySaved === false && (
        <Notice kind="warning">이 브라우저에 진단 기록을 저장하지 못했어요.</Notice>
      )}
      <div className={'score card ' + result.grade.toLowerCase()}>
        <div>
          <span className="badge">{result.gradeLabel}</span>
          <h2>
            <Actions text={result.gradeMessage} />
          </h2>
          <p>
            <Actions text={result.aiExplanation} />
          </p>
        </div>
        <div className="number">
          <strong>{score}</strong>점<small>100점에서 {lost}점 깎였어요</small>
          <small>부채비율 {result.debtRatio}%</small>
        </div>
      </div>
      {/* 점수 가시화: 위험(빨강) 0~40 · 주의(노랑) 41~70 · 안전(초록) 71~100, 내 점수는 막대 위 마크 */}
      <div className="gauge" role="img" aria-label={`안전 점수 100점 중 ${score}점, ${result.gradeLabel}`}>
        <div className="gauge-pin" style={{ '--at': `${score}%` }} aria-hidden="true">
          <span>{score}점</span>
        </div>
        <div className="gauge-bar" aria-hidden="true" />
        <div className="gauge-zones" aria-hidden="true">
          <span className="danger">위험 0~40</span>
          <span className="caution">주의 41~70</span>
          <span className="safe">안전 71~100</span>
        </div>
      </div>
      <ScoreGuide />
      {/* 선순위 보증금 같은 계산 안내는 노란 경고 대신 회색 참고 문장으로 보여줘요 (4차 피드백) */}
      {result.warnings.map((w) => (
        <p className="result-note" key={w}>
          ※ <Actions text={w} />
        </p>
      ))}
      <h2 className="section-heading">점수가 깎인 이유와 확인할 조치</h2>
      <div className="stack">
        {all.map((factor) => (
          <article className="card action-card" key={factor.code}>
            <div className="factor-head">
              <h3>{factor.title}</h3>
              {factor.code !== 'common' && (
                <span className="points">
                  {factor.score > 0 ? `−${factor.score}점` : '확인 필요'}
                </span>
              )}
            </div>
            {factor.explanation && (
              <p>
                <Actions text={factor.explanation} />
              </p>
            )}
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
      <Notice>
        <Actions text={result.disclaimer} />
      </Notice>
      <div className="actions">
        <button className="primary" onClick={() => start('/schedule')}>
          체크리스트 만들기 →
        </button>
        <button className="secondary" onClick={() => start('/diagnosis')}>
          다른 집 다시 진단
        </button>
      </div>
    </section>
  );
}
