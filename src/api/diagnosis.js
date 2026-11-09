import { request, useMock } from './client.js';
import { questions } from './mock/questions.js';
import { mockDiagnosis } from './mock/diagnosis.js';
import { mockOcr } from './mock/ocr.js';
// 페이지는 Mock 여부와 관계없이 이 함수들을 호출해요.
export async function getQuestions() {
  if (!useMock) return (await request('/api/questions')).questions;
  return questions.map(({ risky, points, ...question }) => question);
}
// 서류는 저장하지 않고 OCR 결과만 받아요 (docs/03 5번).
export async function readRegistry({ address, registry, buildingLedger }) {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockOcr({ buildingLedger });
  }
  const form = new FormData();
  form.append('address', address);
  form.append('registry', registry);
  if (buildingLedger) form.append('buildingLedger', buildingLedger);
  return request('/api/ocr/registry', form);
}
export async function diagnose(body) {
  return useMock ? mockDiagnosis(body) : request('/api/diagnoses', body);
}
