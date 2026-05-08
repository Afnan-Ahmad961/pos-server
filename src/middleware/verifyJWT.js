const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const verifyJWT = async (req, res, next)=>{
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        next({ statusCode: 401, message: 'Access token is required' });
        return;
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        console.log(decoded);
        if (!user) {
            throw new ApiError(401, 'Invalid access token 1');
        }
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            businessName: user.businessName,
        };
        next();
    }
    catch (error) {
        next({ statusCode: 401, message: error.message});
    }
};

module.exports = verifyJWT;