import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const SUGGESTIONS = ['Side effects?', 'Can I take together?', 'Miss a dose?', 'Food restrictions?', 'How to store?'];

export default function ChatTab({ analysisId, analysis }) {
  const [msgs, setMsgs] = useState(() => {
    const meds = analysis?.medicines?.length || 0;
    const labs = analysis?.lab_results?.length || 0;
    const abnormal = analysis?.lab_results?.filter(l => l.status === 'low' || l.status === 'high').length || 0;
    let greeting = `Hi! I've analyzed your ${(analysis?.document_type || 'document').replace('_', ' ')}.`;
    if (meds > 0) greeting += ` Found ${meds} medicine(s).`;
    if (labs > 0) greeting += ` Found ${labs} lab test(s)` + (abnormal > 0 ? ` — ⚠️ ${abnormal} abnormal result(s)!` : ' — all in range ✅') + '.';
    if (analysis?.summary) greeting += ' ' + analysis.summary;
    greeting += ' Ask me anything!';
    return [{ role: 'assistant', content: greeting }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef();

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content) return;
    setInput('');
    const newMsgs = [...msgs, { role: 'user', content }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const res = await api.post('/analysis/chat', { messages: newMsgs, analysisId });
      setMsgs(m => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMsgs(m => [...m, { role: 'assistant', content: 'Error: ' + (err.response?.data?.message || err.message) }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMsg = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

  return (
    <div className="fadeUp" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div className="online-dot" />
        <div style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>Ask about your {analysis?.document_type?.replace('_', ' ') || 'results'}</div>
      </div>
      <div className="chat-box">
        {msgs.length <= 1 && (
          <div className="suggest-row">
            {SUGGESTIONS.map(s => <button key={s} className="suggest-chip" onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        <div className="chat-msgs">
          {msgs.map((m, i) => (
            <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'assistant' && <div className="ava ai">🏥</div>}
              <div className={`bubble ${m.role === 'assistant' ? 'ai' : 'user'}`} dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }} />
              {m.role === 'user' && <div className="ava user">👤</div>}
            </div>
          ))}
          {loading && (
            <div className="msg-row">
              <div className="ava ai">🏥</div>
              <div className="bubble ai" style={{ padding: '12px 14px' }}>
                <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: '.2s' }} /><span className="typing-dot" style={{ animationDelay: '.4s' }} />
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>
        <div className="chat-input-row">
          <textarea
            className="chat-ta"
            rows={1}
            placeholder="Ask about side effects, dosage…"
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
}
