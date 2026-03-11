import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function ShareTab({ analysis }) {
  const [shareCode, setShareCode] = useState(analysis?.shareCode || '');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/share/generate/${analysis._id}`);
      setShareCode(res.data.shareCode);
      toast.success('Share code generated!');
    } catch { toast.error('Failed to generate code'); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(shareCode).then(() => toast.success('Code copied! 📋'));
  };

  const shareLink = `${window.location.origin}/share/${shareCode}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => toast.success('Link copied! 🔗'));
  };

  return (
    <div className="fadeUp">
      <div className="sec-label">🔗 Share This Analysis</div>
      <div className="card">
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
          Share your analysis with family, caregivers, or your doctor. Anyone with the code or link can view it.
        </p>
        {!shareCode ? (
          <button className="btn-primary" onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating…' : '🔗 Generate Share Code'}
          </button>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 8 }}>Share this code:</div>
            <div className="share-code">{shareCode}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={copy}>📋 Copy Code</button>
              <button className="btn-outline" style={{ flex: 1 }} onClick={generate}>🔄 New Code</button>
            </div>
            <button className="btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={copyLink}>🌐 Copy Share Link</button>
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
              Anyone with this code can enter it at <strong style={{ color: 'var(--text)' }}>medbill app</strong> to view this analysis.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
