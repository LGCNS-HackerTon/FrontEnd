import React from 'react';
import { go } from '../../app/navigation.js';
import './Layout.css';
export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}
