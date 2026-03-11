import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fadeUp">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💊</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Start analyzing medical bills for free</p>
        </div>
        <input className="auth-input" name="name" placeholder="Full Name" value={form.name} onChange={handle} />
        <input className="auth-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handle} />
        <input className="auth-input" name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? '⏳ Creating…' : '🚀 Create Account'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
