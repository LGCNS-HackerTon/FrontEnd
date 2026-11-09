import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../src/services/history.js';

test('만원 단위 금액을 억·만 원으로 읽기 쉽게 바꾼다', () => {
  assert.equal(formatMoney(24000), '2억 4,000만 원');
  assert.equal(formatMoney(20000), '2억 원');
  assert.equal(formatMoney(9000), '9,000만 원');
  assert.equal(formatMoney(0), '0만 원');
});

test('다시 진단하면 같은 기록을 덮어쓰고 입력값을 함께 저장한다', async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
  const { saveDiagnosis, readHistory } = await import('../src/services/history.js');
  const request = { deposit: 24000, salePrice: 28000, mortgageMax: 3600, seniorDeposit: null, answers: [] };
  saveDiagnosis('a@b.c', { grade: 'DANGER', gradeLabel: '위험', score: 70 }, request);
  const [first] = readHistory('a@b.c');
  assert.deepEqual(first.request, request);
  saveDiagnosis('a@b.c', { grade: 'CAUTION', gradeLabel: '주의', score: 40 }, { ...request, deposit: 20000 }, first.id);
  const items = readHistory('a@b.c');
  assert.equal(items.length, 1);
  assert.equal(items[0].id, first.id);
  assert.equal(items[0].score, 40);
  assert.equal(items[0].request.deposit, 20000);
});
