import React from 'react';

export default function TopNav({ title, back, badge }) {
  return (
    <nav className="topnav">
      {back && (
        <button onClick={back} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', marginRight: 4 }}>‹</button>
      )}
      <span className="nav-logo">💊</span>
      <span className="nav-title">{title}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </nav>
  );
}
