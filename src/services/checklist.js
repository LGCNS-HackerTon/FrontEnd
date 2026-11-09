// 계약 체크리스트(날짜 + 체크한 할 일)를 이 브라우저에 저장해요. 로그인하면 계정별, 아니면 브라우저 공용이에요.
// shortcut: 서버 저장 API가 없어서 브라우저에만 둬요. 회원 API가 생기면 이 두 함수만 바꿔요.
const key = (owner) => 'first-jeonse:checklist:' + (owner || 'guest');
const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function readChecklist(owner) {
  try {
    const saved = JSON.parse(localStorage.getItem(key(owner)));
    // 손상된 저장값이면 없는 것으로 봐요.
    if (!saved || !isDate(saved.dates?.contractDate) || !isDate(saved.dates?.balanceDate))
      return null;
    return {
      dates: {
        contractDate: saved.dates.contractDate,
        balanceDate: saved.dates.balanceDate,
        moveInDate: isDate(saved.dates.moveInDate) ? saved.dates.moveInDate : '',
      },
      done: Array.isArray(saved.done) ? saved.done.filter(Number.isInteger) : [],
      total: Number.isInteger(saved.total) ? saved.total : 0,
    };
  } catch {
    return null;
  }
}

export function saveChecklist(owner, { dates, done, total }) {
  try {
    localStorage.setItem(
      key(owner),
      JSON.stringify({ dates, done, total, updatedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}
