import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { HiOutlinePaperAirplane, HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi2';
import './Chatbot.css';

const Chatbot = () => {
    const [sessions, setSessions] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/chatbot/sessions');
            setSessions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const loadChat = async (chatId) => {
        try {
            const res = await api.get(`/chatbot/sessions/${chatId}`);
            setActiveChat(chatId);
            setMessages(res.data.data.messages || []);
        } catch (err) {
            console.error(err);
        }
    };

    const startNewChat = () => {
        setActiveChat(null);
        setMessages([]);
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
            console.error(err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/chatbot', {
                message: userMsg,
                chatId: activeChat,
            });

            const { chatId, message: aiMsg, sessionTitle } = res.data.data;

            if (!activeChat) {
                setActiveChat(chatId);
                fetchSessions(); // Refresh sidebar
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: aiMsg }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: '⚠️ Sorry, I couldn\'t process that. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-page">
            {/* Sessions sidebar */}
            <div className="chat-sessions">
                <div className="chat-sessions-header">
                    <h3>Conversations</h3>
                    <button className="btn btn-sm btn-primary" onClick={startNewChat}>
                        <HiOutlinePlusCircle /> New
                    </button>
                </div>
                <div className="chat-sessions-list">
                    {loadingSessions ? (
                        <div className="loading-container" style={{ padding: '20px' }}><div className="spinner" /></div>
                    ) : sessions.length === 0 ? (
                        <p style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations yet</p>
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
                                    <button className="chat-session-delete" onClick={(e) => deleteSession(s._id, e)}>
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
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
                            <h2>AI Academic Tutor</h2>
                            <p>I'm context-aware — I know your assignments, deadlines, and can build personalized study plans. Ask me anything!</p>
                            <div className="chat-suggestions">
                                {[
                                    'Help me understand my current assignments',
                                    'Create a study plan for this week',
                                    'Explain recursion with examples',
                                    'What are my upcoming deadlines?',
                                ].map((s) => (
                                    <button
                                        key={s}
                                        className="chat-suggestion"
                                        onClick={() => {
                                            setInput(s);
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                <div className="chat-message-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="chat-message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="chat-message assistant">
                            <div className="chat-message-avatar">🤖</div>
                            <div className="chat-message-content typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-form" onSubmit={sendMessage}>
                    <input
                        type="text"
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about assignments, concepts, study plans..."
                        disabled={loading}
                    />
                    <button type="submit" className="btn btn-primary chat-send-btn" disabled={loading || !input.trim()}>
                        <HiOutlinePaperAirplane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
