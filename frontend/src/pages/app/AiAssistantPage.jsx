import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Plus,
  Paperclip,
  CheckCircle2,
  Info,
  Wand2,
  Users,
} from 'lucide-react';
import './AiAssistantPage.css';
import { api } from '../../services/apiClient';
import AIMarkdown from '../../components/AIMarkdown';

/** Demo team members (matching the rest of the app). */
const OWNERS = {
  a: { name: 'Aniruddha Bhandare', initials: 'AB', color: '#8b5cf6' },
  r: { name: 'Raju Yadav', initials: 'RY', color: '#0ea5e9' },
  h: { name: 'Hrithikraj Singh', initials: 'HS', color: '#f59e0b' },
  v: { name: 'Vishal Chauhan', initials: 'VC', color: '#10b981' },
};

/** Quick suggestion chips shown when the conversation is empty. */
const SUGGESTIONS = [
  'Summarize the CampusConnect project',
  'What decisions were made this month?',
  'List outstanding tasks and owners',
  'Draft a handover executive summary',
];

export default function AiAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, error]);

  const handleSend = (raw) => {
    const text = (raw || input).trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError('');
    setIsTyping(true);

    // Call the backend AI route (/api/assistant), which keeps the provider API
    // key on the server. Errors are surfaced to the user — there is no silent
    // local mock fallback for authenticated use.
    const finish = (reply) => {
      setMessages((prev) => [...prev, { role: 'assistant', ...reply }]);
      setIsTyping(false);
    };

    (async () => {
      try {
        const response = await api.post('/assistant', { message: text });
        // Backend envelope: { success, data: { reply }, message }
        const reply = response?.data?.data?.reply ?? response?.data?.reply;
        if (reply && typeof reply === 'object') {
          finish(reply);
        } else if (typeof reply === 'string') {
          try { finish(JSON.parse(reply)); } catch { finish({ heading: 'Assistant reply', body: reply }); }
        } else {
          setError('The assistant returned no reply. Please try again.');
          setIsTyping(false);
        }
      } catch (err) {
        // No silent mock fallback: surface the actual error.
        setError(err?.message || 'Failed to reach the AI assistant.');
        setIsTyping(false);
      }
    })();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInput('');
    setError('');
    setIsTyping(false);
  };

  return (
    <div className="ai-page">
      {/* Header */}
      <div className="ai-header">
        <button className="btn-back" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="ai-title-group">
          <div className="ai-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="ai-title">AI Assistant</h1>
            <p className="ai-subtitle">
              Your Baton project copilot — ask questions, surface decisions, and generate summaries.
            </p>
          </div>
        </div>
        <button className="ai-reset-btn" onClick={resetConversation} title="Clear conversation">
          <RotateCcw size={16} /> New chat
        </button>
      </div>

      {/* Chat layout */}
      <div className="ai-grid">
        {/* Main chat panel */}
        <div className="ai-chat-card">
          {/* Messages scroll area */}
          <div className="ai-scroll" ref={scrollRef}>
            {messages.length === 0 && !isTyping && (
              <div className="ai-empty">
                <div className="ai-empty-icon">
                  <Bot size={34} />
                </div>
                <h3 className="ai-empty-title">Ask Baton AI anything</h3>
                <p className="ai-empty-desc">
                  Get instant summaries of decisions, tasks, and handover content.
                </p>
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className="ai-suggestion-chip"
                      onClick={() => handleSend(s)}
                    >
                      <Wand2 size={14} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div className="ai-row ai-row-user" key={i}>
                  <div className="ai-avatar ai-avatar-user">
                    <User size={17} />
                  </div>
                  <div className="ai-bubble ai-bubble-user">{m.text}</div>
                </div>
              ) : (
                <div className="ai-row" key={i}>
                  <div className="ai-avatar ai-avatar-bot">
                    <Bot size={18} />
                  </div>
                  <div className="ai-bubble ai-bubble-bot">
                    {m.mock && (
                      <div className="ai-mock-tag">
                        <Info size={12} /> Mock response
                      </div>
                    )}
                    {m.heading && (
                      <div className="ai-bubble-heading">{m.heading}</div>
                    )}
                    {m.body && <AIMarkdown content={m.body} />}
                    {m.points && m.points.length > 0 && (
                      <ul className="ai-bubble-list">
                        {m.points.map((pt, j) => (
                          <li key={j}>
                            <CheckCircle2 size={14} /> {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ),
            )}

            {isTyping && (
              <div className="ai-row">
                <div className="ai-avatar ai-avatar-bot">
                  <Bot size={18} />
                </div>
                <div className="ai-bubble ai-bubble-bot ai-typing">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                </div>
              </div>
            )}

            {error && <div className="ai-error">{error}</div>}
          </div>

          {/* Composer */}
          <div className="ai-composer">
            <textarea
              className="ai-input"
              rows={1}
              placeholder="Ask about decisions, tasks, or handover…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message Baton AI"
            />
            <button
              className="ai-attach-btn"
              title="Attach a file (demo)"
              onClick={() => setError('Attachments are not enabled in this demo.')}
            >
              <Paperclip size={18} />
            </button>
            <button
              className="ai-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="ai-side">
          <div className="ai-card">
            <div className="ai-card-title">
              <Sparkles size={17} /> Capabilities
            </div>
            <ul className="ai-cap-list">
              <li>
                <Plus size={14} />
                Summarise project status & risks
              </li>
              <li>
                <Plus size={14} />
                Surface decisions & their owners
              </li>
              <li>
                <Plus size={14} />
                List tasks and assigned members
              </li>
              <li>
                <Plus size={14} />
                Draft handover executive summaries
              </li>
            </ul>
            <p className="ai-note">
              Responses are generated by Google Gemini via the backend — the API
              key stays on the server and is never exposed in the browser.
            </p>
          </div>

          <div className="ai-card ai-card-dark">
            <div className="ai-card-title">
              <Users size={17} /> Team context
            </div>
            <div className="ai-team">
              {Object.values(OWNERS).map((m) => (
                <div className="ai-team-row" key={m.initials}>
                  <span
                    className="ai-team-avatar"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </span>
                  <span className="ai-team-name">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
