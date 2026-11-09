import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../src/services/history.js';

test('만원 단위 금액을 억·만 원으로 읽기 쉽게 바꾼다', () => {
  assert.equal(formatMoney(24000), '2억 4,000만 원');
  assert.equal(formatMoney(20000), '2억 원');
  assert.equal(formatMoney(9000), '9,000만 원');
  assert.equal(formatMoney(0), '0만 원');
});

test('기록은 최근 5건을 처음 진단한 순서로 두고, 다시 진단하면 제자리에서 덮어쓴다', async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
  const { saveDiagnosis, readHistory } = await import('../src/services/history.js');
  const request = { deposit: 24000, salePrice: 28000, mortgageMax: 3600, seniorDeposit: null, answers: [] };
  for (let n = 1; n <= 6; n++) {
    saveDiagnosis('a@b.c', { grade: 'DANGER', gradeLabel: '위험', score: n }, request);
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  let items = readHistory('a@b.c');
  assert.deepEqual(items.map((item) => item.score), [2, 3, 4, 5, 6]);
  assert.deepEqual(items[0].request, request);
  const target = items[1];
  saveDiagnosis('a@b.c', { grade: 'CAUTION', gradeLabel: '주의', score: 40 }, { ...request, deposit: 20000 }, target.id);
  items = readHistory('a@b.c');
  assert.equal(items.length, 5);
  assert.equal(items[1].id, target.id);
  assert.equal(items[1].date, target.date);
  assert.equal(items[1].score, 40);
  assert.equal(items[1].request.deposit, 20000);
  assert.ok(items[1].updatedAt);
});
