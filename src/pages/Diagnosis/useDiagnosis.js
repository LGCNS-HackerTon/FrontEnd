import { useState, useEffect } from 'react';
import { getQuestions, readRegistry, diagnose } from '../../api/diagnosis.js';

const FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
function fileError(field, file) {
  if (!file) return null;
  if (!FILE_TYPES.includes(file.type))
    return { field, message: 'JPG·PNG·PDF 파일만 올릴 수 있어요.' };
  if (file.size > MAX_FILE_BYTES) return { field, message: '10MB 이하 파일만 올릴 수 있어요.' };
  return null;
}

// 진단 입력 상태를 화면과 분리해 이전 단계로 돌아가도 값을 유지해요.
// 단계: address → upload → review(서류 확인 결과) → question(확인 못 한 질문만) → amounts
// edit가 있으면 마이페이지 기록(edit.request)의 답·금액을 채우고 edit.target(질문 코드 | 'amounts')부터 시작해요.
export default function useDiagnosis(done, edit) {
  const saved = edit?.request;
  const [stage, setStage] = useState(
      edit ? (edit.target === 'amounts' ? 'amounts' : 'question') : 'address',
    ),
    [step, setStep] = useState(0),
    [address, setAddress] = useState(''),
    [files, setFiles] = useState({ registry: null, buildingLedger: null }),
    [questions, setQuestions] = useState([]),
    [ocr, setOcr] = useState(null),
    [asked, setAsked] = useState([]),
    [answers, setAnswers] = useState(() =>
      saved ? Object.fromEntries(saved.answers.map((a) => [a.code, a.answer])) : {},
    );
  const text = (value) => (value === null || value === undefined ? '' : String(value));
  const [amounts, setAmounts] = useState({
    deposit: text(saved?.deposit),
    salePrice: text(saved?.salePrice),
    seniorDeposit: text(saved?.seniorDeposit),
    mortgageMax: answers.B1_MORTGAGE === 'YES' ? text(saved?.mortgageMax) : '',
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);

  const ocrAnswer = (code) => ocr?.answers.find((item) => item.code === code);
  const confirmed = (code) => ocrAnswer(code)?.status === 'CONFIRMED';
  // 판독 못 한 질문은 NO로 채우지 않고 사용자에게 물어요 (docs/09 2절).
  const pending = questions.filter((q) => !confirmed(q.code) || asked.includes(q.code));
  const question = stage === 'question' ? pending[step] : null;

  const show = (nextStage, nextStep = 0) => {
    setStage(nextStage);
    setStep(nextStep);
    setError(null);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    document.getElementById('diagnosis-heading')?.focus({ preventScroll: true });
  }, [stage, step]);

  const update = (e) => {
    setAmounts({ ...amounts, [e.target.name]: e.target.value });
    setError(null);
  };
  const pickFile = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] ?? null });
    setError(null);
  };

  function back() {
    if (stage === 'upload') return show('address');
    if (stage === 'review') return show('upload');
    if (stage === 'question')
      return step > 0 ? show('question', step - 1) : show(ocr ? 'review' : 'upload');
    if (stage === 'amounts' && edit)
      return show('question', Math.max(0, pending.findIndex((q) => q.code === edit.target)));
    if (stage === 'amounts')
      return pending.length ? show('question', pending.length - 1) : show('review');
  }
  function next() {
    // 기록 수정은 고른 질문만 바꾸고 바로 금액 확인으로 가요.
    if (!edit && stage === 'question' && step + 1 < pending.length)
      return show('question', step + 1);
    show('amounts');
  }

  async function loadQuestions() {
    if (questions.length) return questions;
    const data = await getQuestions();
    if (
      !Array.isArray(data) ||
      data.length !== 10 ||
      new Set(data.map((item) => item.code)).size !== 10
    )
      throw new Error('질문 목록을 확인할 수 없어요.');
    const sorted = [...data].sort((a, b) => a.order - b.order);
    setQuestions(sorted);
    return sorted;
  }
  useEffect(() => {
    if (!edit) return;
    loadQuestions()
      .then((list) => setStep(Math.max(0, list.findIndex((q) => q.code === edit.target))))
      .catch(setError);
    // 수정 모드는 화면이 처음 열릴 때 한 번만 질문을 불러와요 (App이 key로 새로 그려요).
  }, []);

  async function readDocs(e) {
    e.preventDefault();
    const invalid =
      (!files.registry && { field: 'registry', message: '등기부등본을 올려 주세요.' }) ||
      fileError('registry', files.registry) ||
      fileError('buildingLedger', files.buildingLedger);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    try {
      await loadQuestions();
      const result = await readRegistry({ address: address.trim(), ...files });
      // 주소가 다른 서류의 결과는 쓰지 않아요.
      if (result.addressMatch === 'MISMATCH') {
        setOcr(null);
        setError({ code: 'ADDRESS_MISMATCH' });
        return;
      }
      setOcr(result);
      setAsked([]);
      setAnswers(
        Object.fromEntries(
          result.answers
            .filter((item) => item.status === 'CONFIRMED')
            .map((item) => [item.code, item.answer]),
        ),
      );
      setAmounts((prev) => ({ ...prev, mortgageMax: result.mortgageMax ?? '' }));
      show('review');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  // 판독 실패(422) 때 서류 없이 10개를 직접 답해요.
  function answerAll() {
    setOcr(null);
    setAsked([]);
    setAnswers({});
    show('question');
  }
  const ask = (code) => setAsked([...asked, code]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const request = {
        deposit: Number(amounts.deposit),
        salePrice: Number(amounts.salePrice),
        mortgageMax: answers.B1_MORTGAGE === 'YES' ? Number(amounts.mortgageMax) : 0,
        // 미입력과 실제 0원을 구분해야 서버에서 확인 필요 경고를 보내요.
        seniorDeposit: amounts.seniorDeposit === '' ? null : Number(amounts.seniorDeposit),
        answers: questions.map(({ code }) => ({ code, answer: answers[code] })),
      };
      // 기록 제목(보증금·시세)에 쓰려고 요청 값도 함께 넘겨요.
      done(await diagnose(request), request);
    } catch (error) {
      const mortgageStep = pending.findIndex((item) => item.needsAmount);
      // 근저당 금액을 질문에서 받았다면 그 질문으로, 아니면 금액 단계 입력칸에 머물러요.
      if (error.code === 'INVALID_INPUT' && error.field === 'mortgageMax' && mortgageStep >= 0) {
        setStage('question');
        setStep(mortgageStep);
      }
      setError(error);
      if (error.field)
        requestAnimationFrame(() => document.getElementById(error.field)?.focus());
    } finally {
      setBusy(false);
    }
  }

  return {
    editing: Boolean(edit),
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
    warnings: ocr?.warnings ?? [],
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
  };
}
