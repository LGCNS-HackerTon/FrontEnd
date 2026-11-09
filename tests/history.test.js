import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../src/services/history.js';

test('만원 단위 금액을 억·만 원으로 읽기 쉽게 바꾼다', () => {
  assert.equal(formatMoney(24000), '2억 4,000만 원');
  assert.equal(formatMoney(20000), '2억 원');
  assert.equal(formatMoney(9000), '9,000만 원');
  assert.equal(formatMoney(0), '0만 원');
});
