import { request, useMock } from './client.js';
import { mockSchedule } from './mock/schedule.js';
export async function getSchedule(input) {
  if (useMock) return mockSchedule(input);
  const query = new URLSearchParams(
    Object.entries(input).filter(([, value]) => value !== ''),
  );
  return request('/api/schedule?' + query);
}
