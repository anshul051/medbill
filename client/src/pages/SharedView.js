import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import MedCard from '../components/MedCard';
import LabCard from '../components/LabCard';
import TopNav from '../components/TopNav';

export default function SharedView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/share/${code}`)
      .then(r => setAnalysis(r.data.analysis))
      .catch(() => setError('Share code not found or expired.'))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="app-shell">
      <TopNav title="Shared Bill" back={() => navigate('/')} />
      <div className="content">
        {loading && <div className="loading-card"><div className="spinner" /></div>}
        {error && <div className="err-box" style={{ marginTop: 20 }}>⚠️ {error}</div>}
        {analysis && (
          <div className="fadeUp" style={{ marginTop: 12 }}>
            <div style={{ background: 'var(--adim)', border: '1px solid var(--aborder)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>🔗</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Shared Analysis · Code: {code}</span>
            </div>
            {analysis.diagnosis && <div className="card" style={{ marginBottom: 12 }}><div style={{ fontWeight: 700 }}>🔬 {analysis.diagnosis}</div>{analysis.doctor_name && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>👨‍⚕️ {analysis.doctor_name}</div>}</div>}
            {analysis.lab_results?.length > 0 && (
              <>
                <div className="sec-label">🧪 Lab Results</div>
                {analysis.lab_results.map((l, i) => <LabCard key={i} lab={l} />)}
              </>
            )}
            {analysis.medicines?.length > 0 && (
              <>
                <div className="sec-label">💊 Medicines</div>
                {analysis.medicines.map((m, i) => <MedCard key={i} med={m} />)}
              </>
            )}
            <div className="disclaimer">⚕️ Shared view. For informational purposes only.</div>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={() => navigate('/')}>Open MedBill AI</button>
          </div>
        )}
      </div>
    </div>
  );
}
