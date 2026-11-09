import React from 'react';
import { go } from '../../app/navigation.js';
import './Layout.css';
export default function Header({ user, path }) {
  return (
    <header>
      <div className="frame nav">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go('/');
          }}
        >
          <span className="logo" aria-hidden="true">
            ⌂
          </span>{' '}
          전세역전
        </a>
        <nav aria-label="주 메뉴">
          <button className="quiet" onClick={() => go('/schedule')}>
            계약 일정표
          </button>
          {/* 로그아웃은 마이페이지 맨 아래에 있어요 */}
          {user ? (
            <button className="secondary compact" onClick={() => go('/mypage')}>
              마이페이지
            </button>
          ) : (
            <button
              className="secondary compact"
              onClick={() => go('/login', path == '/signup' ? history.state : null)}
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
