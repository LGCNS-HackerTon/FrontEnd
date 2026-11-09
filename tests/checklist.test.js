import test from 'node:test';
import assert from 'node:assert/strict';

test('체크리스트는 계정별로 날짜와 체크를 저장하고 손상된 값은 무시한다', async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  };
  const { readChecklist, saveChecklist } = await import('../src/services/checklist.js');
  const dates = { contractDate: '2026-11-20', balanceDate: '2026-12-20', moveInDate: '' };
  assert.equal(readChecklist('a@b.c'), null);
  assert.equal(saveChecklist('a@b.c', { dates, done: [1, 3], total: 14 }), true);
  assert.deepEqual(readChecklist('a@b.c'), { dates, done: [1, 3], total: 14 });
  assert.equal(readChecklist(null), null);
  store.set('first-jeonse:checklist:guest', '{"dates":{"contractDate":"x"}}');
  assert.equal(readChecklist(null), null);
});
