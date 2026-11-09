import { request, useMock } from './client.js';
import { questions } from './mock/questions.js';
import { mockDiagnosis } from './mock/diagnosis.js';
import { mockOcr } from './mock/ocr.js';
import { reevaluate } from './member.js';
// 페이지는 Mock 여부와 관계없이 이 함수들을 호출해요.
export async function getQuestions() {
  if (!useMock) return (await request('/api/questions')).questions;
  return questions.map(({ risky, points, ...question }) => question);
}
// 서류는 저장하지 않고 OCR 결과만 받아요 (docs/03 5번).
export async function readRegistry({ address, registry, buildingLedger }) {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockOcr();
  }
  const form = new FormData();
  form.append('address', address);
  form.append('registry', registry);
  form.append('buildingLedger', buildingLedger);
  return request('/api/ocr/registry', form);
}
// 서버 모드: 로그인했으면 토큰을 붙여 보내 서버가 기록을 저장해요.
// 마이페이지 기록을 고친 경우(replaceId)는 새 진단 대신 그 기록을 재평가해요 (docs/03 10번).
export async function diagnose(body, replaceId) {
  if (useMock) return mockDiagnosis(body);
  return replaceId == null
    ? request('/api/diagnoses', body)
    : reevaluate(replaceId, body);
}
