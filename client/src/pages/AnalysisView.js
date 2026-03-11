import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import TopNav from '../components/TopNav';
import MedCard from '../components/MedCard';
import LabCard from '../components/LabCard';
import ChatTab from '../components/ChatTab';
import RemindersTab from '../components/RemindersTab';
import ShareTab from '../components/ShareTab';

const DOC_ICONS = { prescription: '💊', lab_report: '🧪', blood_test: '🩸', discharge_summary: '🏥', medical_bill: '💰', other: '📄' };
const DOC_LABELS = { prescription: 'Prescription', lab_report: 'Lab Report', blood_test: 'Blood Test', discharge_summary: 'Discharge Summary', medical_bill: 'Medical Bill', other: 'Medical Document' };
const TABS = [
  { id: 'analyze', icon: '📋', label: 'Analysis' },
  { id: 'reminders', icon: '⏰', label: 'Reminders' },
  { id: 'share', icon: '🔗', label: 'Share' },
  { id: 'chat', icon: '💬', label: 'Chat' },
];

function VitalItem({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{icon} {label}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function AnalysisView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('analyze');

  useEffect(() => {
    api.get(`/analysis/${id}`)
      .then(r => setAnalysis(r.data.analysis))
      .catch(() => toast.error('Analysis not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="app-shell">
      <TopNav title="MedBill AI" back={() => navigate('/')} />
      <div className="content"><div className="loading-card"><div className="spinner" /></div></div>
    </div>
  );

  if (!analysis) return (
    <div className="app-shell">
      <TopNav title="MedBill AI" back={() => navigate('/')} />
      <div className="content"><div className="err-box" style={{ marginTop: 20 }}>Analysis not found</div></div>
    </div>
  );

  const r = analysis;
  const medCount = r.medicines?.length || 0;
  const labCount = r.lab_results?.length || 0;
  const badge = medCount > 0 && labCount > 0 ? `${medCount}m ${labCount}l` : medCount > 0 ? `${medCount} meds` : labCount > 0 ? `${labCount} labs` : null;

  return (
    <div className="app-shell">
      <TopNav title="MedBill AI" back={() => navigate('/')} badge={badge} />
      <div className="content">
        {tab === 'analyze' && (
          <div className="fadeUp">
            {/* Doc type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 12, padding: '10px 14px', background: 'var(--adim)', border: '1px solid var(--aborder)', borderRadius: 12 }}>
              <span style={{ fontSize: 20 }}>{DOC_ICONS[r.document_type] || '📄'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{DOC_LABELS[r.document_type] || 'Medical Document'}</span>
              {r.summary && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>· {r.summary}</span>}
            </div>

            {/* Patient Info */}
            {(r.patient_name || r.doctor_name || r.date || r.diagnosis || r.hospital) && (
              <>
                <div className="sec-label">Patient Information</div>
                <div className="card" style={{ lineHeight: 1.9, fontSize: 14, color: 'var(--sub)' }}>
                  {r.patient_name && <div>👤 <strong>Patient:</strong> {r.patient_name}{r.patient_age ? ' · ' + r.patient_age : ''}{r.patient_gender ? ' · ' + r.patient_gender : ''}</div>}
                  {r.doctor_name && <div>🩺 <strong>Doctor:</strong> {r.doctor_name}</div>}
                  {r.hospital && <div>🏥 <strong>Hospital:</strong> {r.hospital}</div>}
                  {r.date && <div>📅 <strong>Date:</strong> {r.date}</div>}
                  {r.diagnosis && <div>🔬 <strong>Diagnosis:</strong> {r.diagnosis}</div>}
                  {r.total_amount && <div>💰 <strong>Total:</strong> {r.total_amount}</div>}
                </div>
              </>
            )}

            {/* Vitals */}
            {r.vitals && Object.values(r.vitals).some(Boolean) && (
              <>
                <div className="sec-label">❤️ Vitals</div>
                <div className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {r.vitals.blood_pressure && <VitalItem icon="🩸" label="BP" value={r.vitals.blood_pressure} />}
                    {r.vitals.pulse && <VitalItem icon="💓" label="Pulse" value={r.vitals.pulse} />}
                    {r.vitals.temperature && <VitalItem icon="🌡️" label="Temp" value={r.vitals.temperature} />}
                    {r.vitals.oxygen_saturation && <VitalItem icon="💨" label="SpO2" value={r.vitals.oxygen_saturation} />}
                    {r.vitals.weight && <VitalItem icon="⚖️" label="Weight" value={r.vitals.weight} />}
                    {r.vitals.height && <VitalItem icon="📏" label="Height" value={r.vitals.height} />}
                    {r.vitals.bmi && <VitalItem icon="📊" label="BMI" value={r.vitals.bmi} />}
                  </div>
                </div>
              </>
            )}

            {/* Lab Results */}
            {r.lab_results?.length > 0 && (
              <>
                <div className="sec-label">
                  🧪 Lab Results ({r.lab_results.length})
                  {r.lab_results.filter(l => l.status === 'low' || l.status === 'high').length > 0 && (
                    <span style={{ color: 'var(--warn)', fontSize: 11, marginLeft: 6 }}>
                      ⚠️ {r.lab_results.filter(l => l.status === 'low' || l.status === 'high').length} abnormal
                    </span>
                  )}
                </div>
                {r.lab_results.map((l, i) => <LabCard key={i} lab={l} />)}
              </>
            )}

            {/* Medicines */}
            {r.medicines?.length > 0 && (
              <>
                <div className="sec-label">💊 Medicines ({r.medicines.length})</div>
                {r.medicines.map((m, i) => <MedCard key={i} med={m} />)}
              </>
            )}

            {r.general_instructions && (
              <>
                <div className="sec-label">📋 General Instructions</div>
                <div className="card" style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.7 }}>{r.general_instructions}</div>
              </>
            )}
            {r.follow_up && (
              <>
                <div className="sec-label">🗓 Follow-Up</div>
                <div className="card" style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.7 }}>{r.follow_up}</div>
              </>
            )}

            <div className="disclaimer">⚕️ For informational purposes only. Always consult your doctor.</div>
            <button className="btn-outline" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/')}>📂 Analyze Another Document</button>
          </div>
        )}

        {tab === 'reminders' && <RemindersTab analysis={analysis} />}
        {tab === 'share' && <ShareTab analysis={analysis} />}
        {tab === 'chat' && <ChatTab analysisId={id} analysis={analysis} />}
      </div>

      {/* Bottom Tabs */}
      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id} className={`tabbar-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="tb-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
