const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next)=>{
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        next({ status: 401, message: 'Access token is required' });
        return;
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        next({ status: 401, message: 'Invalid access token' });
    }
};

module.exports = verifyJWT;