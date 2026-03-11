import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function RemindersTab({ analysis }) {
  const [reminders, setReminders] = useState([]);
  const [notifPerm, setNotifPerm] = useState(Notification?.permission || 'denied');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reminders')
      .then(r => setReminders(r.data.reminders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getReminder = (medName) => reminders.find(r => r.analysis === analysis._id && r.medicineName === medName);

  const toggle = async (med) => {
    if (notifPerm !== 'granted') {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
      if (p !== 'granted') { toast.error('Please allow notifications'); return; }
    }
    const existing = getReminder(med.name);
    try {
      if (existing) {
        const res = await api.put(`/reminders/${existing._id}/toggle`);
        setReminders(prev => prev.map(r => r._id === existing._id ? res.data.reminder : r));
      } else {
        if (!med.timing?.length) { toast.error('No timing specified for this medicine'); return; }
        const res = await api.post('/reminders', { analysisId: analysis._id, medicineName: med.name, dosage: med.dosage, timings: med.timing });
        setReminders(prev => [...prev, res.data.reminder]);
        scheduleLocalReminders(med);
      }
    } catch { toast.error('Failed to update reminder'); }
  };

  const scheduleLocalReminders = (med) => {
    (med.timing || []).forEach(timeStr => {
      const now = new Date();
      const t = parseTime(timeStr);
      if (!t) return;
      const target = new Date(now);
      target.setHours(t.h, t.min, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const ms = target - now;
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('💊 Medicine Time', { body: `Take ${med.name}${med.dosage ? ' (' + med.dosage + ')' : ''}` });
        }
        toast.info(`⏰ Time to take ${med.name}`, { autoClose: 8000 });
      }, ms);
    });
  };

  const parseTime = (s) => {
    const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (m) {
      let h = parseInt(m[1]), min = parseInt(m[2]);
      if (m[3]) { if (/pm/i.test(m[3]) && h !== 12) h += 12; if (/am/i.test(m[3]) && h === 12) h = 0; }
      return { h, min };
    }
    if (/morning/i.test(s)) return { h: 8, min: 0 };
    if (/afternoon/i.test(s)) return { h: 13, min: 0 };
    if (/evening/i.test(s)) return { h: 18, min: 0 };
    if (/night|bed/i.test(s)) return { h: 21, min: 0 };
    return null;
  };

  if (loading) return <div className="loading-card fadeUp"><div className="spinner" /></div>;
  if (!analysis?.medicines?.length) return (
    <div className="card fadeUp" style={{ marginTop: 16, textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
      No medicines found in this {analysis?.document_type?.replace('_', ' ') || 'document'}
    </div>
  );

  return (
    <div className="fadeUp">
      <div className="sec-label">⏰ Medicine Reminders</div>
      <div className="card">
        {notifPerm !== 'granted' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gdim)', border: '1px solid rgba(255,209,102,.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>Allow Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Required for medicine reminders</div>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '9px 14px', fontSize: 12 }} onClick={async () => { const p = await Notification.requestPermission(); setNotifPerm(p); }}>Allow</button>
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>Toggle reminders below. You'll receive notifications at the scheduled times.</div>
        {analysis.medicines.map((med, i) => {
          const rem = getReminder(med.name);
          const on = rem?.isActive;
          return (
            <div className="reminder-item" key={i}>
              <div className="ri-info">
                <div className="ri-name">{med.name} <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{med.dosage ? '· ' + med.dosage : ''}</span></div>
                <div className="ri-times">
                  {med.timing?.length
                    ? med.timing.map((t, j) => <span className="ri-time-chip" key={j}>⏰ {t}</span>)
                    : <span style={{ fontSize: 12, color: 'var(--muted)' }}>No timing specified</span>
                  }
                </div>
                {on && <div className="active-label"><span className="pulse-ring" />Reminder ON</div>}
              </div>
              <button
                className="toggle-wrap"
                style={{ background: on ? 'var(--accent)' : 'var(--border)', opacity: med.timing?.length ? 1 : 0.4 }}
                disabled={!med.timing?.length}
                onClick={() => toggle(med)}
              >
                <div className="toggle-knob" style={{ left: on ? 23 : 3 }} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="disclaimer" style={{ marginTop: 10 }}>🔔 Keep this tab open for reminders to work. Allow browser notifications when prompted.</div>
    </div>
  );
}
