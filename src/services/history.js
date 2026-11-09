// 만원 단위 정수를 "2억 4,000만 원"처럼 읽기 쉽게 바꿔요.
export function formatMoney(man) {
  const eok = Math.floor(man / 10000),
    rest = man % 10000;
  const parts = [];
  if (eok) parts.push(eok + '억');
  if (rest || !eok) parts.push(rest.toLocaleString('ko-KR') + '만');
  return parts.join(' ') + ' 원';
}
const historyKey = (email) => 'first-jeonse:history:' + email;
// 계정별 최근 5건을 처음 진단한 순서로 돌려줘요.
export function readHistory(email) {
  try {
    const items = JSON.parse(localStorage.getItem(historyKey(email)));
    if (!Array.isArray(items)) return [];
    // 손상된 저장값이 있어도 마이페이지 전체가 깨지지 않게 해요.
    return items
      .filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.location === 'string' &&
          Number.isFinite(Date.parse(item.date)) &&
          ['SAFE', 'CAUTION', 'DANGER'].includes(item.grade) &&
          typeof item.gradeLabel === 'string' &&
          Number.isFinite(item.score),
      )
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
      .slice(-HISTORY_LIMIT);
  } catch {
    return [];
  }
}

// 마이페이지에서 조건을 고쳐 다시 진단(D8)할 수 있게 입력값(금액·답 10개)도 저장해요. 주소·서류는 저장하지 않아요.
// docs/03 6절·D10: 최근 5건을 처음 진단한 순서(date 오름차순)로 두고, 다시 진단하면 그 기록을 제자리에서 덮어써요.
// shortcut: 회원 서버 API가 확정되기 전까지 이 브라우저에만 저장해요. API가 나오면 이 함수만 바꿔요.
export const HISTORY_LIMIT = 5;
export function saveDiagnosis(email, result, request, replaceId) {
  const items = readHistory(email);
  const old = items.find((item) => item.id === replaceId);
  const now = new Date().toISOString();
  const item = {
    id: old?.id ?? crypto.randomUUID(),
    location: `보증금 ${formatMoney(request.deposit)} · 시세 ${formatMoney(request.salePrice)}`,
    date: old?.date ?? now,
    ...(old && { updatedAt: now }),
    grade: result.grade,
    gradeLabel: result.gradeLabel,
    score: result.score,
    request,
  };
  const next = old
    ? items.map((each) => (each.id === old.id ? item : each))
    : [...items, item].slice(-HISTORY_LIMIT);
  try {
    localStorage.setItem(historyKey(email), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
