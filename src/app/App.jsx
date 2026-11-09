import React, { useState, useEffect } from 'react';
import { go } from './navigation.js';
import Home from '../pages/Home/Home.jsx';
import Diagnosis from '../pages/Diagnosis/Diagnosis.jsx';
import Result from '../pages/Result/Result.jsx';
import Schedule from '../pages/Schedule/Schedule.jsx';
import MyPage from '../pages/MyPage/MyPage.jsx';
import AccountForm from '../pages/Account/AccountForm.jsx';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import { saveDiagnosis } from '../services/history.js';
const routes = ['/', '/login', '/signup', '/diagnosis', '/result', '/schedule', '/mypage'];
// 진단·일정표는 누구나 쓰고, 기록을 보는 마이페이지만 로그인이 필요해요.
const protectedRoutes = ['/mypage'];
export default function App() {
  const [path, setPath] = useState(location.pathname);
  const [user, setUser] = useState(() => sessionStorage.getItem('demo-user'));
  const [result, setResult] = useState(null);
  useEffect(() => {
    const sync = () => setPath(location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (!routes.includes(path) || (path === '/result' && !result)) go('/', null, true);
    else if (protectedRoutes.includes(path) && !user) go('/login', { next: path }, true);
  }, [path, user, result]);
  function login(name) {
    sessionStorage.setItem('demo-user', name);
    setUser(name);
    const next = history.state?.next;
    go(protectedRoutes.includes(next) ? next : '/', null, true);
  }
  function logout() {
    sessionStorage.removeItem('demo-user');
    setUser(null);
    setResult(null);
    go('/', null, true);
  }
  return (
    <>
      <Header user={user} path={path} />
      <main className="frame" id="main">
        {path === '/' && <Home start={go} />}
        {path === '/login' && <AccountForm key="login" login={login} />}
        {path === '/signup' && <AccountForm key="signup" signup login={login} />}
        {path === '/mypage' && user && <MyPage email={user} start={go} logout={logout} />}
        {path === '/diagnosis' && (
          <Diagnosis
            done={(data, request) => {
              // 비로그인은 저장하지 않아요(null). 로그인했는데 저장 실패면 false.
              const saved = user ? saveDiagnosis(user, data, request) : null;
              setResult({ ...data, historySaved: saved });
              go('/result');
            }}
          />
        )}
        {path === '/result' && result && <Result result={result} start={go} />}
        {path === '/schedule' && <Schedule />}
      </main>
      <Footer />
    </>
  );
}
