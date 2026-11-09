import { request } from './client.js';
// 회원 API (docs/03 6장). 서버 모드에서만 불러요. Mock 모드는 services의 브라우저 저장을 써요.
export const signup = (body) => request('/api/auth/signup', body);
export const login = (body) => request('/api/auth/login', body);
export const getMe = () => request('/api/members/me');
export const getMyDiagnoses = () => request('/api/members/me/diagnoses');
export const reevaluate = (id, body) =>
  request('/api/members/me/diagnoses/' + encodeURIComponent(id), body, 'PUT');
