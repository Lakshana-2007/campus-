import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { HiOutlinePaperAirplane, HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi2';
import './Chatbot.css';

// ─── Lightweight Markdown Renderer ──────────────────────────────────────────
// Converts common markdown to HTML safely (no dangerouslySetInnerHTML abuse —
// we build React elements instead).
const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Heading: ### or ## or #
        const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const content = inlineFormat(headingMatch[2]);
            elements.push(
                <div key={i} className={`md-h${level}`}>{content}</div>
            );
            i++;
            continue;
        }

        // Unordered list item: - or *  or •
        if (/^[-*•]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                items.push(
                    <li key={i}>{inlineFormat(lines[i].replace(/^[-*•]\s+/, ''))}</li>
                );
                i++;
            }
            elements.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>);
            continue;
        }

        // Ordered list item: 1. 2. etc.
        if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                items.push(
                    <li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s+/, ''))}</li>
                );
                i++;
            }
            elements.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>);
            continue;
        }

        // Code block: ```
        if (line.startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={i} className="md-code"><code>{codeLines.join('\n')}</code></pre>
            );
            i++;
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim())) {
            elements.push(<hr key={i} className="md-hr" />);
            i++;
            continue;
        }

        // Empty line → spacer
        if (line.trim() === '') {
            elements.push(<div key={i} className="md-spacer" />);
            i++;
            continue;
        }

        // Default: paragraph with inline formatting
        elements.push(<p key={i} className="md-p">{inlineFormat(line)}</p>);
        i++;
    }

    return <>{elements}</>;
};

// Handle **bold**, *italic*, `code`, inside a line
const inlineFormat = (text) => {
    const parts = [];
    // Pattern: **bold** | *italic* | `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));

        if (match[0].startsWith('**')) {
            parts.push(<strong key={match.index}>{match[2]}</strong>);
        } else if (match[0].startsWith('*')) {
            parts.push(<em key={match.index}>{match[3]}</em>);
        } else if (match[0].startsWith('`')) {
            parts.push(<code key={match.index} className="md-inline-code">{match[4]}</code>);
        }

        last = match.index + match[0].length;
    }

    if (last < text.length) parts.push(text.slice(last));
    return parts.length > 0 ? parts : text;
};
// ────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
    'Help me understand my current assignments',
    'Create a study plan for this week',
    'Explain recursion with examples',
    'How do I prepare for interviews?',
];

const Chatbot = () => {
    const [sessions, setSessions] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/chatbot/sessions');
            setSessions(res.data.data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const loadChat = async (chatId) => {
        try {
            const res = await api.get(`/chatbot/sessions/${chatId}`);
            setActiveChat(chatId);
            setMessages(res.data.data.messages || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load chat:', err);
        }
    };

    const startNewChat = () => {
        setActiveChat(null);
        setMessages([]);
        setError(null);
        inputRef.current?.focus();
    };

    const deleteSession = async (chatId, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/chatbot/sessions/${chatId}`);
            setSessions((prev) => prev.filter((s) => s._id !== chatId));
            if (activeChat === chatId) {
                setActiveChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    };

    const sendMessage = async (text) => {
        const userMsg = (text || input).trim();
        if (!userMsg || loading) return;

        setInput('');
        setError(null);
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/chatbot', {
                message: userMsg,
                chatId: activeChat,
            });

            const { chatId, message: aiMsg } = res.data.data;

            if (!activeChat) {
                setActiveChat(chatId);
                fetchSessions();
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: aiMsg }]);
        } catch (err) {
            const serverMsg = err.response?.data?.message;
            const statusCode = err.response?.status;

            let friendlyError = '⚠️ Something went wrong. Please try again.';
            if (statusCode === 503) {
                friendlyError = '⏳ The AI model is warming up (cold start). Please wait 20–30 seconds and try again.';
            } else if (statusCode === 429) {
                friendlyError = '🚦 Too many requests. Please wait a moment before sending another message.';
            } else if (statusCode === 400) {
                friendlyError = serverMsg || '❌ Invalid request. Please shorten your message.';
            } else if (serverMsg) {
                friendlyError = `⚠️ ${serverMsg}`;
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: friendlyError, isError: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatbot-page">
            {/* Sessions sidebar */}
            <div className="chat-sessions">
                <div className="chat-sessions-header">
                    <h3>Conversations</h3>
                    <button className="btn btn-sm btn-primary" onClick={startNewChat} id="new-chat-btn">
                        <HiOutlinePlusCircle /> New
                    </button>
                </div>
                <div className="chat-sessions-list">
                    {loadingSessions ? (
                        <div className="loading-container" style={{ padding: '20px' }}>
                            <div className="spinner" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="chat-sessions-empty">No conversations yet. Start chatting!</p>
                    ) : (
                        sessions.map((s) => (
                            <div
                                key={s._id}
                                className={`chat-session-item ${activeChat === s._id ? 'active' : ''}`}
                                onClick={() => loadChat(s._id)}
                            >
                                <div className="chat-session-title">{s.sessionTitle}</div>
                                <div className="chat-session-meta">
                                    {new Date(s.updatedAt).toLocaleDateString()}
                                    <button
                                        className="chat-session-delete"
                                        onClick={(e) => deleteSession(s._id, e)}
                                        title="Delete conversation"
                                        id={`delete-session-${s._id}`}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="chat-main">
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="chat-welcome">
                            <div className="chat-welcome-icon">🤖</div>
                            <h2>AI Academic Tutor</h2>
                            <p>
                                I'm context-aware — I know your assignments and deadlines.
                                Ask me anything to get personalised academic help!
                            </p>
                            <div className="chat-suggestions">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        className="chat-suggestion"
                                        onClick={() => sendMessage(s)}
                                        id={`suggestion-${s.slice(0, 20).replace(/\s/g, '-')}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                                <div className="chat-message-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="chat-message-content">
                                    {msg.role === 'assistant' && !msg.isError
                                        ? renderMarkdown(msg.content)
                                        : msg.content}
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="chat-message assistant">
                            <div className="chat-message-avatar">🤖</div>
                            <div className="chat-message-content typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleFormSubmit}>
                    <div className="chat-input-wrapper">
                        <textarea
                            ref={inputRef}
                            id="chat-input"
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about assignments, concepts, study plans… (Enter to send)"
                            disabled={loading}
                            rows={1}
                            maxLength={1000}
                        />
                        {input.length > 800 && (
                            <span className="chat-char-count">{input.length}/1000</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary chat-send-btn"
                        disabled={loading || !input.trim()}
                        id="send-message-btn"
                        title="Send message"
                    >
                        <HiOutlinePaperAirplane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
