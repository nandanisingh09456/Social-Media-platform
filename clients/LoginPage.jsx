import React from 'react';

function LoginPage({ loginForm, onChange, onSubmit, error }) {
  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="auth-brand">
          <h1>SocialSphere</h1>
          <p>Connect, share, and grow with a responsive social experience.</p>
        </div>
        <form onSubmit={onSubmit} className="auth-form">
          <input
            type="text"
            value={loginForm.username}
            onChange={(event) => onChange('username', event.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) => onChange('password', event.target.value)}
            placeholder="Password"
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button">Log in</button>
        </form>
        <p className="hint-text">Demo login: alice / password</p>
      </div>
    </div>
  );
}

export default LoginPage;
