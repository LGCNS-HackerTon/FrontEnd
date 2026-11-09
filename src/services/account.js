// 로컬 데모 계정 저장소예요. 실제 인증 서버 연결은 이 모듈을 교체해요.
const demoEmail = 'demo@example.com';
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
export { demoEmail };
