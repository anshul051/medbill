import React from 'react';

export default function MedCard({ med: m }) {
  return (
    <div className="med-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div>
          <div className="med-name">{m.name}</div>
          {m.generic_name && <div className="med-generic">Generic: {m.generic_name}</div>}
        </div>
        {m.category && <span className="med-badge">{m.category}</span>}
      </div>
      {m.purpose && (
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 4 }}>
          🎯 <strong style={{ color: 'var(--sub)' }}>Purpose:</strong> {m.purpose}
        </div>
      )}
      <div className="med-grid">
        {m.dosage && <div className="med-grid-item"><div className="mg-label">Dosage</div><div className="mg-val">{m.dosage}</div></div>}
        {m.frequency && <div className="med-grid-item"><div className="mg-label">Frequency</div><div className="mg-val">{m.frequency}</div></div>}
        {m.duration && <div className="med-grid-item"><div className="mg-label">Duration</div><div className="mg-val">{m.duration}</div></div>}
        {m.form && <div className="med-grid-item"><div className="mg-label">Form</div><div className="mg-val">{m.form}</div></div>}
      </div>
      {m.timing?.length > 0 && (
        <div className="timing-row">
          {m.timing.map((t, i) => <span className="timing-chip" key={i}>⏰ {t}</span>)}
        </div>
      )}
      {m.instructions && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          📋 <strong style={{ color: 'var(--sub)' }}>Instructions:</strong> {m.instructions}
        </div>
      )}
      {m.warnings?.length > 0 && (
        <div className="warn-box">⚠️ {m.warnings.join(' • ')}</div>
      )}
    </div>
  );
}
