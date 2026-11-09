import test from 'node:test';
import assert from 'node:assert/strict';

// 브라우저 대신 sessionStorage·window·fetch를 흉내 내요.
const store = new Map();
globalThis.sessionStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};
const events = [];
globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
let calls = [];
function reply(status, body) {
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { status, ok: status < 400, json: async () => body };
  };
}
const { request, setToken, getToken, UNAUTHORIZED_EVENT } =
  await import('../src/api/client.js');

test('토큰이 없으면 Authorization 헤더 없이 GET을 보낸다', async () => {
  calls = [];
  reply(200, { questions: [] });
  await request('/api/questions');
  assert.equal(calls[0].url, 'http://localhost:8080/api/questions');
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('토큰이 있으면 Bearer 헤더를 붙이고 PUT 본문을 JSON으로 보낸다', async () => {
  calls = [];
  setToken('abc');
  reply(200, { id: 3 });
  await request('/api/members/me/diagnoses/3', { deposit: 1 }, 'PUT');
  assert.equal(calls[0].options.method, 'PUT');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer abc');
  assert.equal(calls[0].options.headers['Content-Type'], 'application/json');
  assert.equal(calls[0].options.body, '{"deposit":1}');
});

test('보낸 토큰이 401이면 토큰을 지우고 로그아웃 이벤트를 보낸다', async () => {
  events.length = 0;
  setToken('expired');
  reply(401, {
    error: { code: 'UNAUTHORIZED', message: '로그인이 필요해요.', field: null },
  });
  await assert.rejects(request('/api/members/me'), { code: 'UNAUTHORIZED' });
  assert.equal(getToken(), null);
  assert.deepEqual(events, [UNAUTHORIZED_EVENT]);
});

test('토큰 없이 받은 401(로그인 실패)은 에러만 던지고 로그아웃 이벤트는 보내지 않는다', async () => {
  events.length = 0;
  reply(401, {
    error: {
      code: 'UNAUTHORIZED',
      message: '이메일 또는 비밀번호를 확인해 주세요.',
      field: 'password',
    },
  });
  await assert.rejects(request('/api/auth/login', { email: 'a', password: 'b' }), {
    field: 'password',
    message: '이메일 또는 비밀번호를 확인해 주세요.',
  });
  assert.deepEqual(events, []);
});
