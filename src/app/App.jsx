import React, { useState, useEffect } from 'react';
import { go } from './navigation.js';
import Home from '../pages/Home/Home.jsx';
import Diagnosis from '../pages/Diagnosis/Diagnosis.jsx';
import Result from '../pages/Result/Result.jsx';
import Schedule from '../pages/Schedule/Schedule.jsx';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
const routes = ['/', '/diagnosis', '/result', '/schedule'];
export default function App() {
  const [path, setPath] = useState(location.pathname);
  const [result, setResult] = useState(null);
  useEffect(() => {
    const sync = () => setPath(location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (!routes.includes(path) || (path === '/result' && !result)) go('/', null, true);
  }, [path, result]);
  return (
    <>
      <Header />
      <main className="frame" id="main">
        {path === '/' && <Home start={go} />}
        {path === '/diagnosis' && (
          <Diagnosis
            done={(data) => {
              setResult(data);
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
