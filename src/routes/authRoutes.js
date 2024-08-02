const router = require('express').Router();

const authController = require('../controllers/authController');

router.post('/sign-up', authController.register, authController.sendVerificationMail);
router.post('/login', authController.login, authController.sendVerificationSMS);
router.get('/verify-number', authController.sendVerificationSMS);
router.get('/verify-mail', authController.sendVerificationMail);
router.post("/verify-code", authController.verifyCode);

module.exports = router;