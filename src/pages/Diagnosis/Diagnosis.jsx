import React from 'react';
import Label from '../../components/common/Label.jsx';
import Notice from '../../components/common/Notice.jsx';
import Field from '../../components/common/Field.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { go } from '../../app/navigation.js';
import useDiagnosis, { PREPARATION_STEP, ADDRESS_STEP } from './useDiagnosis.js';
import './Diagnosis.css';
const choices = [
  ['YES', '예'],
  ['NO', '아니오'],
  ['UNKNOWN', '모르겠어요'],
];
export default function Diagnosis({ done }) {
  const {
    step,
    questions,
    answers,
    setAnswers,
    address,
    setAddress,
    addressForm,
    amounts,
    busy,
    error,
    setError,
    question,
    isFinal,
    update,
    move,
    begin,
    submit,
  } = useDiagnosis(done);
  const money = (name, label, required, min, hint) => (
    <Field
      name={name}
      label={label}
      type="number"
      inputMode="numeric"
      step="1"
      min={min}
      max="2147483647"
      required={required}
      unit="만원"
      hint={hint}
      value={amounts[name]}
      onChange={update}
      error={error?.field === name ? error.message : null}
    />
  );
  const heading = (title) => (
    <h1 id="diagnosis-heading" tabIndex={-1}>
      {title}
    </h1>
  );
  return (
    <section className="narrow">
      <button
        className="quiet back"
        disabled={busy}
        onClick={() => (step === PREPARATION_STEP ? go('/') : move(step - 1))}
      >
        ← {step === PREPARATION_STEP ? '첫 화면' : '이전'}
      </button>
      {step >= 0 && (
        <progress
          value={isFinal ? questions.length : step + 1}
          max={questions.length}
          aria-label="진단 진행률"
        />
      )}
      <div className="card panel">
        {step === PREPARATION_STEP && (
          <>
            <Label>등기부 진단 · 준비</Label>
            {heading('등기부를 준비해 주세요')}
            <p className="intro">
              발급한 등기부등본을 옆에 두고, 화면의 질문과 하나씩 비교해요.
            </p>
            <div className="links">
              <a href="https://www.iros.go.kr" target="_blank" rel="noreferrer">
                인터넷등기소에서 등기부 발급 ↗
              </a>
              <a href="https://www.gov.kr" target="_blank" rel="noreferrer">
                정부24에서 건축물대장 확인 ↗
              </a>
            </div>
            <button className="primary full" onClick={() => move(ADDRESS_STEP)}>
              준비됐어요
            </button>
          </>
        )}
        {addressForm && (
          <form onSubmit={begin}>
            <fieldset disabled={busy}>
              <Label>등기부 진단 · 집 정보</Label>
              {heading('동·호수를 입력해 주세요')}
              <p className="intro">계약할 집의 동·호수를 등기부등본에서 확인해 주세요.</p>
              <div className="address-fields">
                {[
                  ['building', '동 (선택)', '예: 101'],
                  ['unit', '호수', '예: 1204'],
                ].map(([name, label, placeholder]) => (
                  <Field
                    key={name}
                    label={label}
                    name={name}
                    type="text"
                    placeholder={placeholder}
                    maxLength={20}
                    required={name === 'unit'}
                    hint={name === 'building' ? '동이 없으면 비워도 돼요.' : undefined}
                    value={address[name]}
                    error={error?.field === name ? error.message : null}
                    onChange={(e) => {
                      setAddress({ ...address, [name]: e.target.value });
                      setError(null);
                    }}
                  />
                ))}
              </div>
              {error?.field !== 'unit' && <ErrorBox error={error} />}
              <button className="primary full" disabled={busy}>
                {busy
                  ? '질문을 불러오는 중…'
                  : error && !error.field
                    ? '다시 시도'
                    : '질문 시작하기 →'}
              </button>
            </fieldset>
          </form>
        )}
        {question && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              move(step + 1);
            }}
          >
            <Label>
              {question.sectionName} · 질문 {step + 1}/{questions.length}
            </Label>
            {heading(question.text)}
            <p className="intro">{question.help}</p>
            <fieldset className="choices">
              <legend className="sr-only">답변 선택</legend>
              {choices.map(([value, label]) => (
                <label className="choice" key={value}>
                  <input
                    type="radio"
                    name="answer"
                    required
                    checked={answers[question.code] === value}
                    onChange={() => {
                      setAnswers({ ...answers, [question.code]: value });
                      setError(null);
                    }}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            {answers[question.code] === 'UNKNOWN' && (
              <Notice>이 항목은 중개사에게 확인하세요.</Notice>
            )}
            {question.needsAmount &&
              answers[question.code] === 'YES' &&
              money(
                'mortgageMax',
                '채권최고액',
                true,
                0,
                '근저당권이 여러 개라면 채권최고액을 모두 더해 주세요.',
              )}
            <button className="primary full">
              다음 질문 <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
        {isFinal && (
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <Label>등기부 진단 · 마지막 단계</Label>
              {heading('계약 금액을 알려 주세요')}
              <p className="intro">
                모든 금액은 만원 단위로 입력해요. 2억 4천만 원은 24000을 입력하면 돼요.
              </p>
              {money('deposit', '내 보증금', true, 1)}
              {money('salePrice', '매매 시세', true, 1)}
              {money(
                'seniorDeposit',
                '선순위 보증금 (선택)',
                false,
                0,
                '다가구주택이라면 나보다 먼저 들어온 세입자의 보증금을 중개사에게 물어보세요.',
              )}
              {(!error?.field || !Object.hasOwn(amounts, error.field)) && (
                <ErrorBox error={error} />
              )}
              <button className="primary full" disabled={busy}>
                {busy
                  ? '결과를 확인하는 중…'
                  : error && !error.field
                    ? '다시 시도'
                    : '진단 결과 보기'}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}
