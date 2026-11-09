import test from 'node:test';
import assert from 'node:assert/strict';
import { safeScore, splitActions } from '../src/services/score.js';

test('안전 점수는 100에서 위험 점수를 빼고 0 아래로 가지 않는다', () => {
  assert.equal(safeScore(0), 100);
  assert.equal(safeScore(29), 71);
  assert.equal(safeScore(60), 40);
  assert.equal(safeScore(130), 0);
});

test('"~세요"로 끝나는 문장만 행동 안내로 표시한다', () => {
  assert.deepEqual(splitActions('큰 위험 신호는 없어요. 잔금일에 등기부를 다시 확인하세요.'), [
    { sentence: '큰 위험 신호는 없어요.', action: false },
    { sentence: '잔금일에 등기부를 다시 확인하세요.', action: true },
  ]);
  assert.deepEqual(splitActions(null), []);
});
