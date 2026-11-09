import React from 'react';
import { go } from '../../app/navigation.js';
import logo from '../../assets/logo.svg';
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
          {/* 로고 원본(아이콘 + 글씨)에서 아이콘만 잘라 보여줘요. 옆에 서비스 이름이 있어서 그림은 읽지 않아요 */}
          <img className="logo" src={`${logo}#svgView(viewBox(290,165,650,650))`} alt="" />
          전세역전
        </a>
        <nav aria-label="주 메뉴">
          <button className="quiet" onClick={() => go('/schedule')}>
            계약 체크리스트
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
