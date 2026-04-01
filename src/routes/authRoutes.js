const express = require('express');
const authController = require('../controllers/authController.js');
const validate = require('../middleware/validate.js');
const { registerRules, loginRules } = require('../middleware/authValidation.js');
const verifyJWT = require('../middleware/verifyJWT.js');
const passport = require('passport');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refreshToken', authController.refreshToken);
router.get('/me', verifyJWT, authController.getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.googleCallback);

module.exports = router;