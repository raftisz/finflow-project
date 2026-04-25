import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../context/DataContext';

const QUICK_PROMPTS = [
  'เดือนนี้กำไรเท่าไหร่?',
  'แอปไหนทำเงินดีที่สุด?',
  'ค่าใช้จ่ายสูงสุดคืออะไร?',
  'เปรียบเทียบกับเดือนก่อน',
  'ควรลดค่าใช้จ่ายอะไร?',
  'รายรับจาก App Store vs Play Store',
];

export default function AssistantPage() {
  const { askAssistant, summary } = useContext(DataContext);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'สวัสดีครับ! ผมคือ FinFlow Secretary ผู้ช่วยดูแลการเงินของคุณ 💼\nถามอะไรเกี่ยวกับรายรับ รายจ่าย หรือกำไรได้เลยนะครับ' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', text: q }];
    setMessages(updated);
    setLoading(true);
    try {
      const reply = await askAssistant(updated.filter(m => m.role !== 'typing'));
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ ไม่สามารถเชื่อมต่อ AI ได้ตอนนี้ กรุณาลองใหม่' }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div className="ai-avatar">🤖</div>
        <div>
          <div className="ai-name">FinFlow Secretary</div>
          <div className="ai-status">● Online · พร้อมช่วยเหลือ</div>
        </div>
        {summary && (
          <div className="chat-stats">
            <span className="chat-stat">รายรับ <strong>${summary.totalIncome?.toLocaleString()}</strong></span>
            <span className="chat-stat">กำไร <strong className="profit">${summary.netProfit?.toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-avatar">{m.role === 'ai' ? '🤖' : '👤'}</div>
            <div className="msg-bubble">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="quick-prompts">
        {QUICK_PROMPTS.map(q => (
          <button key={q} className="quick-chip" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      <div className="chat-input-wrap">
        <input
          className="chat-input"
          placeholder="ถามเกี่ยวกับการเงินของคุณ..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="chat-send" onClick={() => send()}>↑</button>
      </div>
    </div>
  );
}
