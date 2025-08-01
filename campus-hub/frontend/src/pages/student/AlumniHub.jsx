import { useState, useEffect } from 'react';
import api from '../../utils/api';

const AlumniHub = () => {
    const [alumni, setAlumni] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('I would like to connect and learn more about your career path.');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, reqRes] = await Promise.all([
                    api.get('/alumni/recommendations'),
                    api.get('/messages') // Reusing messages to show active connections
                ]);
                setAlumni(recRes.data.data);
                setRequests(reqRes.data.data);
            } catch (error) {
                console.error('Error fetching alumni data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleConnect = async (alumniId) => {
        try {
            await api.post(`/alumni/connect/${alumniId}`, { message });
            alert('Request sent!');
        } catch (error) {
            alert(error.response?.data?.message || 'Request failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="alumni-hub-container" style={{ padding: '20px' }}>
            <h1>Alumni Hub - AI Recommendations</h1>
            <p>Based on your profile, we recommend connecting with these professional alumni:</p>

            <div className="alumni-grid">
                {alumni.map(person => (
                    <div key={person._id} className="alumni-card" style={{ border: '1px solid #ddd', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
                        <h3>{person.name}</h3>
                        <p><strong>Expertise:</strong> {person.department} Alumnous</p>
                        <p><em>{person.recommendationReason}</em></p>
                        <a href={person.linkedinURL} target="_blank" rel="noreferrer">LinkedIn Profile</a>
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={() => handleConnect(person._id)}>Request Connection</button>
                        </div>
                    </div>
                ))}
            </div>

            <section className="active-chats" style={{ marginTop: '40px' }}>
                <h2>💬 Your Conversations</h2>
                {requests.length === 0 ? <p>No active connections yet. Request a connection to start chatting.</p> : (
                    requests.map(chat => (
                        <div key={chat._id} className="chat-preview">
                            <h4>{chat.sessionTitle}</h4>
                            <p>Last message: {chat.messages[chat.messages.length - 1]?.content}</p>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
};

export default AlumniHub;
