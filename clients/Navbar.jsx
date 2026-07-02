import React from 'react';

function Navbar({ user, activeView, onNavigate, onLogout }) {
  return (
    <aside className="sidebar card">
      <div className="brand-block">
        <h1>SocialSphere</h1>
        <p>Stay connected</p>
      </div>

      <div className="user-card">
        <img src={user?.avatar || 'https://i.pravatar.cc/150'} alt={user?.name || 'user'} />
        <div>
          <h3>{user?.name || 'Welcome'}</h3>
          <p>@{user?.username || 'user'}</p>
        </div>
      </div>

      <nav className="nav-links">
        <button type="button" className={activeView === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('home')}>Home</button>
        <button type="button" className={activeView === 'profile' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('profile')}>Profile</button>
        <button type="button" className={activeView === 'saved' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('saved')}>Saved</button>
      </nav>

      <button type="button" className="ghost-button logout-button" onClick={onLogout}>Log out</button>
    </aside>
  );
}

export default Navbar;
