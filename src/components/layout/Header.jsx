import React from 'react';
import { go } from '../../app/navigation.js';
import './Layout.css';
export default function Header({ user, logout, path }) {
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
          첫 전세
        </a>
        <nav aria-label="주 메뉴">
          <button className="quiet" onClick={() => go('/schedule')}>
            계약 일정표
          </button>
          {user && (
            <button className="quiet" onClick={() => go('/mypage')}>
              마이페이지
            </button>
          )}
          <button
            className="secondary compact"
            onClick={
              user ? logout : () => go('/login', path == '/signup' ? history.state : null)
            }
          >
            {user ? '로그아웃' : '로그인'}
          </button>
        </nav>
      </div>
    </header>
  );
}
