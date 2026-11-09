import { request, useMock } from './client.js';
import { questions } from './mock/questions.js';
import { mockDiagnosis } from './mock/diagnosis.js';
// 페이지는 Mock 여부와 관계없이 이 함수들을 호출해요.
export async function getQuestions() {
  if (!useMock) return (await request('/api/questions')).questions;
  return questions.map(({ risky, points, ...question }) => question);
}
export async function diagnose(body) {
  return useMock ? mockDiagnosis(body) : request('/api/diagnoses', body);
}
