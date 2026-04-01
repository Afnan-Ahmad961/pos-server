const express = require('express');
const authController = require('../controllers/authController.js');
const validate = require('../middleware/validate.js');
const { registerRules, loginRules } = require('../middleware/authValidation.js');
const verifyJWT = require('../middleware/verifyJWT.js');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refreshToken', authController.refreshToken);
router.get('/me', verifyJWT, authController.getMe);

module.exports = router;