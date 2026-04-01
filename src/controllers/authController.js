const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';

const register = async (req, res, next) => {
    try {
        const { name, email, password, businessName } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            next({ statusCode: 400, message: 'Email already exists' });
            return;
        }
        const user = (await User.create({ name, email, password, businessName }));
        res.status(201).json({ name: user.name, email: user.email });
    } catch (error) {
        next({ statusCode: 500, message: 'Error creating user - ' + error.message });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            next({ statusCode: 400, message: 'Invalid email or password' });
            return;
        }
        if (!await user.comparePassword(password)) {
            next({ statusCode: 400, message: 'Invalid email or password' });
            return;
        }

        const accessToken = await jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        })

        const refreshToken = await jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        })
        //Save the refresh token on the user document 
        user.refreshToken = refreshToken;
        await user.save();
        // Set both tokens as httpOnly cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(200).json({ message: 'Login successful' });

    }
    catch (error) {
        next({ statusCode: 500, message: 'Error logging in - ' + error.message });
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const user = await User.findOne({ refreshToken });
        if (!user) {
            next({ statusCode: 400, message: 'Invalid refresh token' });
            return;
        }
        user.refreshToken = null;
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        await user.save();
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next({ statusCode: 500, message: 'Error logging out - ' + error.message });
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.cookies;
        if (!token) {
            next({ statusCode: 400, message: 'Refresh token not found' });
            return;
        }
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ refreshToken: token });
        if (!user) {
            next({ statusCode: 400, message: 'Invalid refresh token' });
            return;
        }
        const accessToken = await jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        })

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'Refresh token successful' });
    }
    catch (error) {
        next({ statusCode: 500, message: 'Error refreshing token - ' + error.message });
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        if (!user) {
            next({ statusCode: 404, message: 'User not found' });
            return;
        }
        return res.status(200).json({ name: user.name, email: user.email });
    }
    catch (error) {
        next({ statusCode: 500, message: 'Error getting user - ' + error.message });
    }
};

const googleCallback = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            next({ statusCode: 400, message: 'Invalid google callback' });
            return;
        }
        const accessToken = await jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        })
        const refreshToken = await jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        })
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.redirect('http://localhost:5000/health');
    }
    catch (error) {
        next({ statusCode: 500, message: 'Error logging in - ' + error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    googleCallback,
};

