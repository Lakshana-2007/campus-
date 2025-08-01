import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUserCircle, HiOutlinePaperAirplane } from 'react-icons/hi2';

const MessagingHub = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [message, setMessage] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChats();
        fetchPotentialReceivers();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await api.get('/messages');
            setChats(res.data.data.filter(c => c.isP2P));
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialReceivers = async () => {
        try {
            const res = await api.get('/messages/possible-receivers');
            setReceivers(res.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !activeChat) return;

        try {
            const receiverId = activeChat.userId === user._id ? activeChat.receiverId?._id : activeChat.userId?._id;
            const res = await api.post('/messages/send', {
                receiverId: receiverId || activeChat.receiverId,
                content: message
            });
            setActiveChat(res.data.data);
            fetchChats();
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const startNewChat = async (targetUser) => {
        try {
            const res = await api.post('/messages/send', {
                receiverId: targetUser._id,
                content: `Hi ${targetUser.name}, I'd like to connect!`
            });
            setActiveChat(res.data.data);
            fetchChats();
            setSearchTerm('');
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    const filteredUsers = receivers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="page-container" style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '20px' }}>
            {/* Sidebar: Chats List */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '0' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Messages</h2>
                    <input
                        placeholder="Search users..."
                        style={{ width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <div style={{ position: 'absolute', background: 'var(--surface)', border: '1px solid var(--border-color)', width: '260px', zIndex: 10, borderRadius: '8px', marginTop: '4px', boxShadow: 'var(--shadow-lg)' }}>
                            {filteredUsers.map(u => (
                                <div
                                    key={u._id}
                                    className="list-item"
                                    style={{ padding: '10px', cursor: 'pointer' }}
                                    onClick={() => startNewChat(u)}
                                >
                                    <strong>{u.name}</strong> <small>({u.role})</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {chats.map(chat => (
                        <div
                            key={chat._id}
                            className={`list-item ${activeChat?._id === chat._id ? 'active' : ''}`}
                            style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                            onClick={() => setActiveChat(chat)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <HiOutlineUserCircle size={32} color="var(--diamond-400)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{chat.sessionTitle.replace('Chat: ', '')}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '180px' }}>
                                        {chat.messages[chat.messages.length - 1]?.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0' }}>
                {activeChat ? (
                    <>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <HiOutlineUserCircle size={32} color="var(--diamond-400)" />
                            <h3 style={{ margin: 0 }}>{activeChat.sessionTitle.replace('Chat: ', '')}</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activeChat.messages?.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        maxWidth: '70%',
                                        padding: '10px 15px',
                                        borderRadius: '12px',
                                        alignSelf: msg.senderId === user._id ? 'flex-end' : 'flex-start',
                                        background: msg.senderId === user._id ? 'var(--diamond-600)' : 'var(--surface-alt)',
                                        color: msg.senderId === user._id ? 'white' : 'var(--text-primary)'
                                    }}
                                >
                                    {msg.content}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                            <input
                                flex={1}
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-primary" type="submit">
                                <HiOutlinePaperAirplane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <p>Select a conversation or search for a user to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingHub;
