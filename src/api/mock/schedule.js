import { tasks } from './tasks.js';
// 날짜 값은 UTC로 계산하고, 오늘 날짜는 한국 시간 기준으로 정해요.
const day = 86400000;
const iso = (date) => date.toISOString().slice(0, 10);
export function mockSchedule(input) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(
    new Date(),
  );
  const moveIn = input.moveInDate || input.balanceDate;
  const expiry = new Date(moveIn);
  const dateOfMonth = expiry.getUTCDate();
  expiry.setUTCDate(1);
  expiry.setUTCMonth(expiry.getUTCMonth() + Number(input.termMonths || 24));
  const lastDay = new Date(
    Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() + 1, 0),
  ).getUTCDate();
  expiry.setUTCDate(Math.min(dateOfMonth, lastDay));
  const anchors = {
    CONTRACT: input.contractDate,
    BALANCE: input.balanceDate,
    MOVE_IN: moveIn,
    EXPIRY: iso(expiry),
  };
  const items = tasks
    .map(({ offset, ...task }) => {
      const time = Date.parse(anchors[task.anchor]) + offset * day;
      const daysLeft = (time - Date.parse(today)) / day;
      return {
        ...task,
        date: iso(new Date(time)),
        daysLeft,
        status: daysLeft < 0 ? 'PAST' : daysLeft > 0 ? 'UPCOMING' : 'TODAY',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);
  return { today, expiryDate: iso(expiry), items };
}
