const express = require('express');
const authController = require('../controllers/authController.js');
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/register',validate, authController.register);
router.post('/login',validate, authController.login);
router.post('/logout',validate, authController.logout);
router.post('/refreshToken',validate, authController.refreshToken);

module.exports = router;