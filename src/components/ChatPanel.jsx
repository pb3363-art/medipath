import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

export default function ChatPanel({ doctorName, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'doctor', text: "Hello! I'm available if you have any questions about your treatment.", time: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { from: 'patient', text: input.trim(), time: 'Now' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'doctor',
        text: "I've noted your concern. Please continue with your medications as prescribed. Contact me if symptoms worsen.",
        time: 'Now'
      }]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-panel fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle size={16} color="var(--primary)" />
          <div>
            <div className="text-sm font-semibold">{doctorName}</div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></span>
              <span className="text-xs" style={{ color: 'var(--success)' }}>Online</span>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px 8px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="px-4 py-3" style={{ height: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} className="flex" style={{ justifyContent: m.from === 'patient' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              background: m.from === 'patient' ? 'var(--primary)' : 'var(--bg-section)',
              color: m.from === 'patient' ? 'white' : 'var(--text-primary)',
              borderBottomRightRadius: m.from === 'patient' ? '4px' : '12px',
              borderBottomLeftRadius: m.from === 'doctor' ? '4px' : '12px',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          style={{ padding: '8px 12px', fontSize: '0.8125rem' }}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn btn-primary btn-sm" onClick={sendMessage}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
