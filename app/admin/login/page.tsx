"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import '../admin.css';

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email, password,
      callbackUrl: "/admin",
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="loginPage">
      <div className="loginBg" />
      <div className="loginCard">

        <div className="loginMark">P</div>

        <h1 className="loginTitle">Admin Portal</h1>
        <p className="loginSub">Sign in to manage your Pixelectro studio.</p>

        {error && <div className="loginError">⚠ {error}</div>}

        <form className="loginForm" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@pixelectro.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="loginBtn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.78rem', color: 'var(--adm-muted)' }}>
          Pixelectro Studio · Admin Access Only
        </p>
      </div>
    </div>
  );
}
