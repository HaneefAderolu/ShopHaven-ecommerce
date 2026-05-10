import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Poppins', sans-serif;
        }
        .auth-card {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        }
        .auth-logo {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6b35, #f7c59f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
        }
        .auth-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
        .auth-sub { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
        .auth-label { font-size: 0.85rem; font-weight: 600; color: #444; display: block; margin-bottom: 0.4rem; }
        .auth-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          margin-bottom: 1.2rem;
        }
        .auth-input:focus { border-color: #ff6b35; }
        .auth-error {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #e53e3e;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.88rem;
          margin-bottom: 1rem;
        }
        .auth-btn {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #ff6b35, #e85d2a);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(255,107,53,0.35);
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,107,53,0.4); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #666; }
        .auth-footer a { color: #ff6b35; font-weight: 600; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🛍 ShopHaven</div>
          <h2 className="auth-title">Welcome back!</h2>
          <p className="auth-sub">Sign in to your account to continue shopping</p>
          {error && <div className="auth-error">⚠ {error}</div>}
          <label className="auth-label">Email address</label>
          <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}