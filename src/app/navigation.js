// 주소와 React 화면을 함께 갱신하는 공통 이동 함수예요.
export const go = (path, state = null, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState'](state, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};
