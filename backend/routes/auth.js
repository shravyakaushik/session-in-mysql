const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { User, Session } = require('../models');
const router = express.Router();

const secretKey = 'your_secret_key';

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        const session = await Session.findOne({ where: { token } });
        if (!session || new Date(session.expires) < new Date()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.userId = decoded.id;
        req.tokenExpires = decoded.exp;
        next();
    });
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check for an active session
        const activeSession = await Session.findOne({
            where: {
                user_id: user.id,
                expires: { [Sequelize.Op.gt]: new Date() }
            }
        });

        let token;
        if (activeSession) {
            token = activeSession.token;
        } else {
            const expiresIn = 7 * 24 * 60 * 60;

            // Generate JWT token
            token = jwt.sign({ id: user.id }, secretKey, {
                expiresIn,
            });

            const expires = new Date(Date.now() + expiresIn * 1000);

            // Create session in the database
            const sessionId = `sess_${new Date().getTime()}`; // Example session ID
            await Session.create({
                session_id: sessionId,
                user_id: user.id,
                token: token,
                expires: expires,
            });
        }

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/protected', verifyToken, async (req, res) => {
    try {
        res.json({ message: 'You are authenticated' });
    } catch (error) {
        console.error('Error during protected route access:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
