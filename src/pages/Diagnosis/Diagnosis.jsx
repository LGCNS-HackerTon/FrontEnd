import React from 'react';
import Label from '../../components/common/Label.jsx';
import Notice from '../../components/common/Notice.jsx';
import Field from '../../components/common/Field.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { go } from '../../app/navigation.js';
import useDiagnosis from './useDiagnosis.js';
import './Diagnosis.css';
const choices = [
  ['YES', '예'],
  ['NO', '아니오'],
  ['UNKNOWN', '모르겠어요'],
];
const answerLabel = Object.fromEntries(choices);
const ACCEPT = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';
export default function Diagnosis({ done }) {
  const {
    stage,
    step,
    address,
    setAddress,
    files,
    pickFile,
    questions,
    pending,
    ocrAnswer,
    confirmed,
    warnings,
    ask,
    answers,
    setAnswers,
    amounts,
    busy,
    error,
    setError,
    question,
    update,
    show,
    back,
    next,
    readDocs,
    answerAll,
    submit,
  } = useDiagnosis(done);
  const fieldError = (name) => (error?.field === name ? error.message : null);
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
      error={fieldError(name)}
    />
  );
  const file = (name, label, hint) => (
    <Field
      name={name}
      label={label}
      type="file"
      accept={ACCEPT}
      hint={files[name] ? `선택한 파일: ${files[name].name}` : hint}
      onChange={pickFile}
      error={fieldError(name)}
    />
  );
  const heading = (title) => (
    <h1 id="diagnosis-heading" tabIndex={-1}>
      {title}
    </h1>
  );
  const ocrBlocked = ['ADDRESS_MISMATCH', 'OCR_UNREADABLE'].includes(error?.code);
  const confirmedList = questions.filter((q) => confirmed(q.code));
  const mortgageOnAmounts =
    answers.B1_MORTGAGE === 'YES' && !pending.some((q) => q.needsAmount);
  const shown = question && ocrAnswer(question.code);
  return (
    <section className="narrow">
      <button
        className="quiet back"
        disabled={busy}
        onClick={() => (stage === 'address' ? go('/') : back())}
      >
        ← {stage === 'address' ? '첫 화면' : '이전'}
      </button>
      {['question', 'amounts'].includes(stage) && pending.length > 0 && (
        <progress
          value={stage === 'amounts' ? pending.length : step + 1}
          max={pending.length}
          aria-label="진단 진행률"
        />
      )}
      <div className="card panel">
        {stage === 'address' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              show('upload');
            }}
          >
            <Label>등기부 진단 · 1단계 주소</Label>
            {heading('계약할 집 주소를 알려 주세요')}
            <p className="intro">
              올릴 등기부가 같은 집 것인지 확인하는 데만 써요. 동·호수까지 적어 주세요.
            </p>
            <Field
              name="address"
              label="집 주소 (동·호수까지)"
              required
              autoComplete="street-address"
              placeholder="예: 서울 마포구 ○○로 12, 101동 1204호"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button className="primary full">
              다음 <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
        {stage === 'upload' && (
          <form onSubmit={readDocs}>
            <fieldset disabled={busy}>
              <Label>등기부 진단 · 2단계 서류 첨부</Label>
              {heading('서류를 올려 주세요')}
              <p className="intro">
                서류에서 읽을 수 있는 답은 먼저 채워 드릴게요. 서류와 주소는 저장하지
                않아요.
              </p>
              {file(
                'registry',
                '등기부등본 (필수)',
                "JPG·PNG·PDF, 10MB 이하. 인터넷등기소에서 '말소사항 미포함'으로 발급하면 더 정확하게 읽어요.",
              )}
              {file(
                'buildingLedger',
                '건축물대장 (선택)',
                '없으면 위반건축물 여부만 직접 답하면 돼요.',
              )}
              <div className="links">
                <a href="https://www.iros.go.kr" target="_blank" rel="noreferrer">
                  인터넷등기소에서 등기부 발급 ↗
                </a>
                <a href="https://www.gov.kr" target="_blank" rel="noreferrer">
                  정부24에서 건축물대장 발급 ↗
                </a>
              </div>
              {error?.code === 'ADDRESS_MISMATCH' && (
                <Notice kind="warning">
                  올린 등기부의 주소가 입력한 주소와 달라요. 주소를 고치거나, 계약할 집의
                  등기부를 다시 올려 주세요.
                </Notice>
              )}
              {error?.code === 'OCR_UNREADABLE' && (
                <Notice kind="warning">
                  서류를 읽지 못했어요. 더 선명한 파일을 다시 올리거나, 질문 10개에 직접
                  답할 수 있어요.
                </Notice>
              )}
              {!error?.field && !ocrBlocked && <ErrorBox error={error} />}
              <button className="primary full">
                {busy ? '서류를 읽는 중…' : '서류 읽기'}
              </button>
              {error?.code === 'ADDRESS_MISMATCH' && (
                <button type="button" className="secondary full" onClick={() => show('address')}>
                  주소 고치기
                </button>
              )}
              {error?.code === 'OCR_UNREADABLE' && (
                <button type="button" className="secondary full" onClick={answerAll}>
                  질문에 직접 답하기
                </button>
              )}
            </fieldset>
          </form>
        )}
        {stage === 'review' && (
          <>
            <Label>등기부 진단 · 3단계 서류 확인 결과</Label>
            {heading(
              pending.length
                ? `${pending.length}개만 직접 답해 주세요`
                : '서류로 10개 모두 확인했어요',
            )}
            <p className="intro">
              서류에서 확인한 답은 그대로 쓰고, 확인하지 못한 질문만 물어볼게요. 서류에서
              읽은 답이 틀렸다면 고칠 수 있어요.
            </p>
            {warnings.map((text) => (
              <Notice kind="warning" key={text}>
                {text}
              </Notice>
            ))}
            {pending.length > 0 && (
              <>
                <h2 className="section-heading">직접 답할 질문 {pending.length}개</h2>
                <ul className="stack">
                  {pending.map((q) => (
                    <li className="card evidence-item" key={q.code}>
                      <small className="muted">{q.sectionName}</small>
                      <p className="evidence-question">{q.text}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h2 className="section-heading">서류에서 확인한 답 {confirmedList.length}개</h2>
            <ul className="stack">
              {confirmedList.map((q) => (
                <li className="card evidence-item" key={q.code}>
                  <small className="muted">{q.sectionName}</small>
                  <p className="evidence-question">{q.text}</p>
                  <p className="evidence-answer">
                    <span className="badge">{answerLabel[answers[q.code]]}</span>
                    <small className="muted">{ocrAnswer(q.code).evidence}</small>
                  </p>
                  <button
                    type="button"
                    className="quiet compact"
                    disabled={pending.includes(q)}
                    onClick={() => ask(q.code)}
                  >
                    {pending.includes(q) ? '직접 답할게요' : '고치기'}
                  </button>
                </li>
              ))}
            </ul>
            <button className="primary full" onClick={() => show(pending.length ? 'question' : 'amounts')}>
              {pending.length ? '질문에 답하기' : '금액 입력하기'} <span aria-hidden="true">→</span>
            </button>
          </>
        )}
        {question && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <Label>
              {question.sectionName} · 질문 {step + 1}/{pending.length}
            </Label>
            {heading(question.text)}
            <p className="intro">{question.help}</p>
            {shown?.status === 'CONFIRMED' && (
              <Notice>
                서류에서는 &lsquo;{answerLabel[shown.answer]}&rsquo;로 읽었어요. 근거:{' '}
                {shown.evidence}
              </Notice>
            )}
            {shown?.status === 'UNCONFIRMED' && shown.evidence && (
              <Notice>서류에서 찾은 내용: {shown.evidence}</Notice>
            )}
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
              {step + 1 < pending.length ? '다음 질문' : '금액 입력하기'}{' '}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
        {stage === 'amounts' && (
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <Label>등기부 진단 · 마지막 단계</Label>
              {heading('계약 금액을 알려 주세요')}
              <p className="intro">
                모든 금액은 만원 단위로 입력해요. 2억 4천만 원은 24000을 입력하면 돼요.
              </p>
              {money('deposit', '내 보증금', true, 1)}
              {money('salePrice', '매매 시세', true, 1)}
              {mortgageOnAmounts &&
                money(
                  'mortgageMax',
                  '근저당 채권최고액 합계',
                  true,
                  0,
                  amounts.mortgageMax === ''
                    ? '등기부에서 금액을 읽지 못했어요. 을구의 채권최고액을 모두 더해 입력해 주세요.'
                    : '등기부에서 읽은 금액이에요. 다르면 고쳐 주세요.',
                )}
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
