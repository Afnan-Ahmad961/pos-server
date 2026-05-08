const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandle.js');
const ApiError = require('../utils/apiErrors.js');

const isProduction = process.env.NODE_ENV === 'production';

// Create access token and refresh token for a user
const createAcessTokenAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = await jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
    const refreshToken = await jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
}

// Register a new user
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, businessName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'Email already exists');
    }
    const user = (await User.create({ name, email, password, businessName }));
    res.status(201).json({ name: user.name, email: user.email, businessName: user.businessName });
});

// Login a user
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, 'Invalid email or password');
    }
    if (!await user.comparePassword(password)) {
        throw new ApiError(400, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = await createAcessTokenAndRefreshToken(user._id);
    // Set both tokens as httpOnly cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ name: user.name, email: user.email, businessName: user.businessName, refreshToken });
});

// Logout a user
const logout = asyncHandler(async (req, res, next) => {
   const user = await User.findOne(
        req.user.id
    )
    if (!user) {
        throw new ApiError(400, 'Invalid refresh token');
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: isProduction});
    res.clearCookie('accessToken', { httpOnly: true, secure: isProduction});
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: 'Logged out successfully' });
});

// Refresh a user's access token
const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken: token } = req.cookies;
    if (!token) {
        throw new ApiError(400, 'Refresh token not found');
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
        throw new ApiError(400, 'Invalid refresh token');
    }
    const accessToken = await jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ message: 'Refresh token successful' });
});

// Get the user's information
const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    return res.status(200).json({ name: user.name, email: user.email });
});

const googleCallback = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, 'Invalid google callback');
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
});

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    googleCallback,
};

