import { questions } from './questions.js';
import { advice } from './advice.js';
const disclaimer =
  '참고용이며 법적 판단이 아닙니다. 계약 전 공인중개사·전문가에게 확인하세요.';
const titles = [
  '주소 불일치',
  '주택이 아닌 용도',
  '집주인과 소유자가 다름',
  '최근 3개월 안에 집주인 변경',
  '신탁 등기',
  '압류·가처분 등 권리 문제',
  '근저당권 확인 필요',
  '이전 세입자 임차권등기',
  '다른 사람의 전세권',
  '위반건축물',
];
// docs/01 점수 규칙을 재현하는 데모 계산이에요. 실제 연결에서는 서버가 계산해요.
export function mockDiagnosis({
  deposit,
  salePrice,
  mortgageMax = 0,
  seniorDeposit,
  answers,
}) {
  const selections = new Map(answers.map(({ code, answer }) => [code, answer]));
  const hasMortgage = selections.get('B1_MORTGAGE') === 'YES';
  const ratio =
    ((deposit + (seniorDeposit ?? 0) + (hasMortgage ? mortgageMax : 0)) / salePrice) *
    100;
  const debtRatio = Math.round(ratio * 10) / 10;
  const debtPoints = ratio >= 90 ? 40 : ratio >= 80 ? 25 : ratio >= 70 ? 10 : 0;
  const factors = questions.flatMap((q, index) => {
    const answer = selections.get(q.code);
    const score =
      answer === 'UNKNOWN' || (!q.needsAmount && answer === q.risky) ? q.points : 0;
    if (!score && !(q.needsAmount && hasMortgage)) return [];
    return [
      {
        code: q.code,
        score,
        title: q.needsAmount && hasMortgage ? '근저당권 있음' : titles[index],
        explanation:
          answer === 'UNKNOWN'
            ? '확인하지 못한 항목이에요. 중개사에게 물어보세요.'
            : q.help,
        ...advice[q.code],
      },
    ];
  });
  if (debtPoints)
    factors.push({
      code: 'DEBT_RATIO',
      score: debtPoints,
      title: '부채비율 ' + debtRatio + '%',
      explanation: '빚과 보증금을 합친 금액이 집값에서 차지하는 비율이에요.',
      ...advice.DEBT_RATIO,
    });
  factors.sort((a, b) => b.score - a.score);
  const score = factors.reduce((sum, factor) => sum + factor.score, 0);
  const [grade, gradeLabel, gradeMessage] =
    score >= 60
      ? ['DANGER', '위험', '계약을 다시 생각해 보세요. 전문가 상담을 권해요.']
      : score >= 30
        ? ['CAUTION', '주의', '아래 질문을 중개사에게 꼭 물어보세요.']
        : ['SAFE', '안전', '큰 위험 신호는 없어요. 잔금일에 등기부를 다시 확인하세요.'];
  return {
    id: 1,
    score,
    grade,
    gradeLabel,
    gradeMessage,
    debtRatio,
    factors,
    commonAdvice: advice['(공통)'],
    aiExplanation: factors.length
      ? '아래 항목부터 확인하면 다음에 무엇을 해야 할지 알 수 있어요.'
      : '입력한 답에서 큰 위험 신호는 발견되지 않았어요.',
    aiUsed: false,
    warnings:
      seniorDeposit == null
        ? ['선순위 보증금을 0으로 계산했어요. 다가구주택이라면 중개사에게 꼭 물어보세요.']
        : [],
    disclaimer,
    createdAt: new Date().toISOString().slice(0, 19),
  };
}
