import React from 'react';

const STATUS_COLORS = { low: '#FF6B6B', high: '#FF6B6B', normal: '#00D4AA', borderline: '#FFD166' };
const STATUS_BG = { low: 'rgba(255,107,107,0.08)', high: 'rgba(255,107,107,0.08)', normal: 'rgba(0,212,170,0.07)', borderline: 'rgba(255,209,102,0.09)' };
const STATUS_ICON = { low: '⬇️', high: '⬆️', normal: '✅', borderline: '⚠️' };

export default function LabCard({ lab: l }) {
  const s = (l.status || 'normal').toLowerCase();
  const color = STATUS_COLORS[s] || '#9BB0C8';
  const bg = STATUS_BG[s] || 'transparent';
  const icon = STATUS_ICON[s] || '🔬';

  return (
    <div className="lab-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{l.test_name}</div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: bg, color }}>{icon} {(l.status || '').toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color }}>{l.value}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{l.unit}</span>
        {l.normal_range && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>Normal: {l.normal_range}</span>}
      </div>
      {l.interpretation && (
        <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, padding: '8px 10px', background: 'var(--card2)', borderRadius: 8 }}>
          💡 {l.interpretation}
        </div>
      )}
    </div>
  );
}
