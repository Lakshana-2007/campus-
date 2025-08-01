const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load mock users for development
const loadMockUsers = () => {
    try {
        const mockDataFile = path.join(__dirname, '../mock-users.json');
        if (fs.existsSync(mockDataFile)) {
            const data = fs.readFileSync(mockDataFile, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('Could not load mock users:', error.message);
    }
    return [];
};

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET || 'campushub_super_secret_jwt_key_2026', { expiresIn: '7d' });
};

// Dev login - uses mock data if MongoDB unavailable
const devLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const mockUsers = loadMockUsers();
        const user = mockUsers.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user._id, user.email);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};

module.exports = { devLogin, loadMockUsers };
