import { formatUnit } from '../utils/formatUnit.js';
const historyKey = (email) => 'first-jeonse:history:' + email;
// 계정별로 최근 10개 결과의 요약만 저장해요.
export function readHistory(email) {
  try {
    const items = JSON.parse(localStorage.getItem(historyKey(email)));
    if (!Array.isArray(items)) return [];
    // 손상된 저장값이 있어도 마이페이지 전체가 깨지지 않게 해요.
    return items.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.location === 'string' &&
        Number.isFinite(Date.parse(item.date)) &&
        ['SAFE', 'CAUTION', 'DANGER'].includes(item.grade) &&
        typeof item.gradeLabel === 'string' &&
        Number.isFinite(item.score),
    );
  } catch {
    return [];
  }
}

export function saveDiagnosis(email, result, address) {
  const item = {
    id: crypto.randomUUID(),
    location: formatUnit(address),
    date: new Date().toISOString(),
    grade: result.grade,
    gradeLabel: result.gradeLabel,
    score: result.score,
  };
  try {
    localStorage.setItem(
      historyKey(email),
      JSON.stringify([item, ...readHistory(email)].slice(0, 10)),
    );
    return true;
  } catch {
    return false;
  }
}
