import { useMock, setToken } from '../api/client.js';
import { signup, login, getMe } from '../api/member.js';
// Mock 모드는 이 브라우저에 저장하는 데모 계정을, 서버 모드는 회원 API(docs/03 6장)를 써요.
const demoEmail = 'demo@example.com';
// 서버가 시작할 때 만들어 두는 데모 계정의 비밀번호예요 (실제 계정 아님).
const demoPassword = 'jeonse-demo-2026';

// 서버 모드: 받은 토큰을 저장하고 정규화된 이메일을 돌려줘요. 중복 가입·로그인 실패는 null.
async function serverAuth(call, failCode) {
  try {
    const { accessToken, member } = await call();
    setToken(accessToken);
    return member.email;
  } catch (error) {
    if (error.code === failCode) return null;
    throw error;
  }
}
const encoder = new TextEncoder();
const accountKey = (email) => 'first-jeonse:account:' + email;
const normalizeEmail = (email) => email.trim().toLowerCase();

// 비밀번호 원문 대신 계정별 salt와 PBKDF2 결과를 저장해요.
async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits)).join('.');
}

export async function registerAccount({ name, email, password }) {
  if (!useMock)
    return serverAuth(() => signup({ name, email, password }), 'DUPLICATE_EMAIL');
  const address = normalizeEmail(email);
  const key = accountKey(address);
  if (address === demoEmail || localStorage.getItem(key)) return null;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const verifier = await derivePassword(password, salt);
  if (localStorage.getItem(key)) return null;
  localStorage.setItem(
    key,
    JSON.stringify({ name: name.trim(), salt: Array.from(salt), verifier }),
  );
  return address;
}

export async function verifyAccount(email, password) {
  if (!useMock) return serverAuth(() => login({ email, password }), 'UNAUTHORIZED');
  const address = normalizeEmail(email);
  const entry = localStorage.getItem(accountKey(address));
  if (!entry) return null;
  const { salt, verifier } = JSON.parse(entry);
  return verifier === (await derivePassword(password, Uint8Array.from(salt)))
    ? address
    : null;
}

export function readProfile(email) {
  if (email === demoEmail) return { name: '데모 사용자', email };
  try {
    const profile = JSON.parse(localStorage.getItem(accountKey(email)));
    return { name: profile?.name ?? '전세 계약 준비 중', email };
  } catch {
    return { name: '전세 계약 준비 중', email };
  }
}
// 데모 계정 버튼: Mock은 바로 로그인, 서버 모드는 서버의 데모 계정으로 로그인해요.
export async function demoLogin() {
  return useMock ? demoEmail : verifyAccount(demoEmail, demoPassword);
}
// 마이페이지 프로필. 서버 모드는 내 정보 API(8번)로 읽어요.
export async function loadProfile(email) {
  return useMock ? readProfile(email) : getMe();
}
export { demoEmail };
