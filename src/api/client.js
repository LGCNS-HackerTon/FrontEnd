// 실제 API 연결은 이 공통 클라이언트를 사용해요.
// env?.: node 테스트에서는 import.meta.env가 없어요. 그때는 Mock으로 봐요.
export const useMock = import.meta.env?.VITE_USE_MOCK !== 'false';
// 로그인 토큰(docs/03 6.1)은 로그인 상태(demo-user)와 같이 이 탭에만 둬요.
const tokenKey = 'jeonse-token';
export const getToken = () => sessionStorage.getItem(tokenKey);
export const setToken = (token) => sessionStorage.setItem(tokenKey, token);
export const clearToken = () => sessionStorage.removeItem(tokenKey);
export const UNAUTHORIZED_EVENT = 'jeonse:unauthorized';

export async function request(path, body, method = body ? 'POST' : 'GET') {
  const base = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080';
  const token = getToken();
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  // 서류 첨부(FormData)는 브라우저가 multipart 경계를 직접 붙여요.
  const response = await fetch(
    base + path,
    !body
      ? { method, headers }
      : body instanceof FormData
        ? { method, headers, body }
        : {
            method,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
  );
  // 보낸 토큰이 잘못됐거나 만료되면 로그아웃하고 로그인 화면으로 보내요 (App이 받아요).
  // 토큰 없이 받은 401(로그인 실패)은 호출한 화면이 처리해요.
  if (response.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('서버 응답을 읽을 수 없어요.');
  }
  if (!response.ok) throw Object.assign(new Error(data.error?.message), data.error);
  return data;
}
