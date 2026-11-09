// 실제 API 연결은 이 공통 클라이언트를 사용해요.
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
export async function request(path, body) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  // 서류 첨부(FormData)는 브라우저가 multipart 경계를 직접 붙여요.
  const response = await fetch(
    base + path,
    body &&
      (body instanceof FormData
        ? { method: 'POST', body }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }),
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('서버 응답을 읽을 수 없어요.');
  }
  if (!response.ok) throw Object.assign(new Error(data.error?.message), data.error);
  return data;
}
