// 서버는 위험 점수(0점부터 더하기, docs/01)를 줘요. 화면은 100점에서 깎는 안전 점수로 보여줘요 (팀장 결정 11/9).
// 등급은 서버가 준 grade를 그대로 써요: 안전 71~100 · 주의 41~70 · 위험 40 이하 (위험 점수 0~29 · 30~59 · 60+).
export const safeScore = (risk) => Math.max(0, 100 - risk);

// "~하세요" 같은 행동 안내 문장만 따로 칠할 수 있게 문장 단위로 나눠요.
export function splitActions(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .map((sentence) => ({ sentence, action: /세요[.!?]?$/.test(sentence) }));
}
