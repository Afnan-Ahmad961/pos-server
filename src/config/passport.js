const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        let user = await User.findOne({ googleId });
        if (user) {
            return done(null, user);
        }
        user = await User.findOne({ email });
        if (user) {
            user.googleId = googleId;
            await user.save();
            return done(null, user);
        }
        const newUser = await User.create({
            name: profile.displayName,
            email,
            googleId,
            businessName: `${profile.displayName}'s Business`, // businessName is required in User model
        });
        return done(null, newUser);
    }
    catch (error) {
        return done(error, null);
    }
}));