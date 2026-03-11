import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TopNav from '../components/TopNav';

const DOC_ICONS = { prescription: '💊', lab_report: '🧪', blood_test: '🩸', discharge_summary: '🏥', medical_bill: '💰', other: '📄' };
const DOC_LABELS = { prescription: 'Prescription', lab_report: 'Lab Report', blood_test: 'Blood Test', discharge_summary: 'Discharge Summary', medical_bill: 'Medical Bill', other: 'Document' };

export default function Dashboard() {
  const { user, updateApiKey, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [drag, setDrag] = useState(false);
  const [keyInput, setKeyInput] = useState(user?.groqApiKey || '');
  const [codeInput, setCodeInput] = useState('');
  const [showKeyEdit, setShowKeyEdit] = useState(!user?.groqApiKey);

  useEffect(() => {
    api.get('/analysis')
      .then(r => setHistory(r.data.analyses))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const pickFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'application/pdf'];
    if (!allowed.includes(f.type)) { toast.error('Please upload JPG, PNG, or PDF'); return; }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const analyze = async () => {
    if (!file) return;
    if (!user?.groqApiKey) { toast.error('Please save your Groq API key first'); return; }
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/analysis/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/analysis/${res.data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Check your API key.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveKey = async () => {
    try {
      await updateApiKey(keyInput.trim());
      toast.success('✅ API key saved!');
      setShowKeyEdit(false);
    } catch { toast.error('Failed to save key'); }
  };

  const loadCode = async () => {
    if (!codeInput.trim()) return;
    navigate(`/share/${codeInput.trim().toUpperCase()}`);
  };

  const deleteAnalysis = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis?')) return;
    await api.delete(`/analysis/${id}`).catch(() => {});
    setHistory(h => h.filter(a => a._id !== id));
    toast.success('Deleted');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  };

  return (
    <div className="app-shell">
      <TopNav title="MedBill AI" />
      <div className="content">
        {/* Hero */}
        <div className="hero fadeUp">
          <div className="hero-pill"><div className="hero-dot" />AI Medical Assistant</div>
          <h1 className="hero-h1">MedBill AI</h1>
          <p className="hero-sub">Upload prescriptions, lab reports or bills. Get instant AI breakdowns.</p>
          <div className="features">
            {[['📄','PDF & Images','Any format'],['💊','Medicine Info','Dosage & purpose'],['⏰','Reminders','Never miss a dose'],['🔗','Share','With family']].map(([i,t,s]) => (
              <div className="feature-card" key={t}><div className="feature-icon">{i}</div><div className="feature-title">{t}</div><div className="feature-sub">{s}</div></div>
            ))}
          </div>
        </div>

        {/* API Key Banner */}
        {(showKeyEdit || !user?.groqApiKey) ? (
          <div className="key-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🔑</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>Groq API Key Required</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>100% Free · No quota issues · No credit card</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
              1. Go to <strong style={{ color: 'var(--accent)' }}>console.groq.com</strong><br />
              2. Sign up free → click <strong style={{ color: 'var(--text)' }}>"API Keys"</strong> → Create<br />
              3. Copy the key and paste below 👇
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="key-input" type="password" placeholder="gsk_..." value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveKey()} />
              <button className="btn-primary" style={{ width: 'auto', padding: '11px 16px', fontSize: 13 }} onClick={saveKey}>Save</button>
            </div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 12, textDecoration: 'none' }}>→ Open Groq Console (Free)</a>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--adim)', border: '1px solid var(--aborder)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, flex: 1 }}>Groq AI connected ⚡</span>
            <button onClick={() => setShowKeyEdit(true)} style={{ fontSize: 12, color: 'var(--muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>Change</button>
          </div>
        )}

        {/* Upload Area */}
        {analyzing ? (
          <div className="loading-card">
            <div className="spinner" />
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Analyzing your document…</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Reading medicines, dosages & lab results</div>
          </div>
        ) : file ? (
          <div className="fadeUp">
            <div className="preview-wrap">
              {preview
                ? <img className="preview-img" src={preview} alt="bill" />
                : <div className="pdf-preview"><span className="pdf-icon">📄</span><div><div style={{ fontSize: 14, fontWeight: 700 }}>{file.name}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>PDF · Ready to analyze</div></div></div>
              }
              <button className="remove-btn" onClick={() => { setFile(null); setPreview(null); }}>✕</button>
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={analyze} disabled={analyzing}>🔍 Analyze Document</button>
          </div>
        ) : (
          <>
            <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={e => pickFile(e.target.files?.[0])} />
            <div
              className={`upload-zone ${drag ? 'drag' : ''}`}
              style={!user?.groqApiKey ? { opacity: 0.5, pointerEvents: 'none' } : {}}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <span className="upload-emoji">🏥</span>
              <div className="upload-title">Upload Medical Document</div>
              <div className="upload-sub">Prescription · Lab Report · Blood Test · Medical Bill</div>
              <div className="file-tags">
                {['.jpg', '.png', '.pdf', '.heic'].map(t => <span className="file-tag" key={t}>{t}</span>)}
              </div>
              <button className="btn-primary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>📂 Choose File</button>
            </div>
          </>
        )}

        {/* Load by code */}
        <div className="or-divider">or enter a share code</div>
        <div className="code-row">
          <input className="share-input" placeholder="ENTER CODE" maxLength={6} value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && loadCode()} />
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={loadCode}>Load</button>
        </div>

        {/* History */}
        {!historyLoading && history.length > 0 && (
          <>
            <div className="sec-label">📋 Recent Analyses</div>
            <div className="card">
              {history.map(a => (
                <div className="history-item" key={a._id} onClick={() => navigate(`/analysis/${a._id}`)}>
                  <span className="hi-icon">{DOC_ICONS[a.document_type] || '📄'}</span>
                  <div className="hi-info">
                    <div className="hi-title">{a.fileName || DOC_LABELS[a.document_type] || 'Document'}</div>
                    <div className="hi-sub">{a.diagnosis || a.summary || DOC_LABELS[a.document_type]}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button className="btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={e => deleteAnalysis(e, a._id)}>🗑</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Account */}
        <div className="sec-label">👤 Account</div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</div>
          </div>
          <button className="btn-danger" onClick={logout}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
