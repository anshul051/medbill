import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fadeUp">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💊</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>MedBill AI</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Sign in to your account</p>
        </div>
        <input className="auth-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} />
        <input className="auth-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? '⏳ Signing in…' : '🔐 Sign In'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 14 }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
