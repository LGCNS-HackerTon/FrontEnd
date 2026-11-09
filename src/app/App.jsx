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
import { formatUnit } from '../utils/formatUnit.js';
import { saveDiagnosis } from '../services/history.js';
const routes = [
  '/',
  '/login',
  '/signup',
  '/diagnosis',
  '/result',
  '/schedule',
  '/mypage',
];
const protectedRoutes = ['/diagnosis', '/schedule', '/mypage'];
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
  const start = (page) => (user ? go(page) : go('/login', { next: page }));
  return (
    <>
      <Header user={user} logout={logout} start={start} path={path} />
      <main className="frame" id="main">
        {path === '/' && <Home start={start} />}
        {path === '/login' && <AccountForm key="login" login={login} />}
        {path === '/signup' && <AccountForm key="signup" signup login={login} />}
        {path === '/mypage' && user && <MyPage email={user} start={start} />}
        {path === '/diagnosis' && user && (
          <Diagnosis
            done={(data, address) => {
              const saved = saveDiagnosis(user, data, address);
              setResult({ ...data, unitLabel: formatUnit(address), historySaved: saved });
              go('/result');
            }}
          />
        )}
        {path === '/result' && result && <Result result={result} start={start} />}
        {path === '/schedule' && user && <Schedule />}
      </main>
      <Footer />
    </>
  );
}
