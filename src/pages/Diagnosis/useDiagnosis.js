import { useState, useEffect } from 'react';
import { getQuestions, diagnose } from '../../api/diagnosis.js';
export const PREPARATION_STEP = -1;

// 진단 입력 상태를 화면과 분리해 이전 단계로 돌아가도 값을 유지해요.
export default function useDiagnosis(done) {
  // 준비 → 질문 인덱스 → 금액 입력 순서예요.
  const [step, setStep] = useState(PREPARATION_STEP),
    [questions, setQuestions] = useState([]),
    [answers, setAnswers] = useState({});
  const [amounts, setAmounts] = useState({
    deposit: '',
    salePrice: '',
    seniorDeposit: '',
    mortgageMax: '',
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const question = questions[step],
    isFinal = step >= 0 && step === questions.length;
  const update = (e) => {
    setAmounts({ ...amounts, [e.target.name]: e.target.value });
    setError(null);
  };
  const move = (next) => {
    setStep(next);
    setError(null);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    document.getElementById('diagnosis-heading')?.focus({ preventScroll: true });
  }, [step]);
  async function begin() {
    if (questions.length) {
      move(0);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await getQuestions();
      if (
        !Array.isArray(data) ||
        data.length !== 10 ||
        new Set(data.map((item) => item.code)).size !== 10
      )
        throw new Error('질문 목록을 확인할 수 없어요.');
      setQuestions([...data].sort((a, b) => a.order - b.order));
      move(0);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      done(
        await diagnose({
          deposit: Number(amounts.deposit),
          salePrice: Number(amounts.salePrice),
          mortgageMax: answers.B1_MORTGAGE === 'YES' ? Number(amounts.mortgageMax) : 0,
          // 미입력과 실제 0원을 구분해야 서버에서 확인 필요 경고를 보내요.
          seniorDeposit:
            amounts.seniorDeposit === '' ? null : Number(amounts.seniorDeposit),
          answers: questions.map(({ code }) => ({ code, answer: answers[code] })),
        }),
      );
    } catch (error) {
      if (error.code === 'INVALID_INPUT' && error.field === 'mortgageMax')
        setStep(questions.findIndex((item) => item.needsAmount));
      setError(error);
      if (error.field)
        requestAnimationFrame(() => document.getElementById(error.field)?.focus());
    } finally {
      setBusy(false);
    }
  }

  return {
    step,
    questions,
    answers,
    setAnswers,
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
  };
}
