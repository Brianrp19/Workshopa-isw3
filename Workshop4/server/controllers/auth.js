const User = require('../models/user');
const bcrypt = require('bcrypt');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error authenticating token' });
    }
};

const generateToken = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = await bcrypt.hash(email + password, 10);
        user.token = token;
        await user.save();

        return res.status(201).json({ token: user.token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error generating token' });
    }
};

const register = async (req, res) => {
    const { name, lastName, email, password } = req.body;

    if (!name || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            name,
            lastName,
            email,
            password
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

module.exports = {
    authenticateToken,
    generateToken,
    register,
};