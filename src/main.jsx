import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/global.css';
import './components/common/common.css';
// 진입점은 앱 마운트와 공통 스타일 로딩만 맡아요.
createRoot(document.getElementById('root')).render(<App />);
