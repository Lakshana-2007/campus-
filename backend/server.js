const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const plagiarismRoutes = require('./routes/plagiarismRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const placementRoutes = require('./routes/placementRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const messageRoutes = require('./routes/messageRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files — uploaded submissions
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #3375FF;">🚀 Campus Hub API</h1>
            <p>The backend is running successfully!</p>
            <p>To use the application, please visit the frontend at:</p>
            <a href="http://localhost:5173" style="color: #3375FF; font-weight: bold; text-decoration: none; border: 1px solid #3375FF; padding: 10px 20px; border-radius: 5px;">Open Campus Hub UI</a>
        </div>
    `);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Campus Hub Server running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to database:', err.message);
        process.exit(1);
    });

module.exports = app;
