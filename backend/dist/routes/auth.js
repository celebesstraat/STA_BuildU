"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../utils/database"));
const router = express_1.default.Router();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password, firstName, lastName'
            });
        }
        const { data, error } = await database_1.default.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });
        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during registration'
        });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        const { data, error } = await database_1.default.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return res.status(401).json({ success: false, error: error.message });
        }
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login'
        });
    }
});
router.get('/me', async (req, res) => {
    try {
        const { data, error } = await database_1.default.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
        if (error) {
            return res.status(401).json({ success: false, error: error.message });
        }
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { error } = await database_1.default.auth.signOut();
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
        res.json({ success: true, message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during logout'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map