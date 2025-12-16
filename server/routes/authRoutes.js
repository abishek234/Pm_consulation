// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// === AUTHENTICATION ROUTES ===
// user Registration
router.post("/register", authController.signup);

// Admin Registration (requires secret key)
router.post("/admin/register", authController.adminSignup);

// Login (works for both users and admins)
router.post("/login", authController.login);
router.post('/verification-otp', authController.verifyOtpAndLogin);
router.get('/profile/:id', authController.getUserProfile);

// === PROFILE ROUTES ===
// Create user profile (after registration)
router.post("/profile/create", authController.createProfile);

// Get & Update profile


// GET /api/notifications/status - Get user's notification status
router.get('/status/:id',  authController.getNotificationStatus);

// POST /api/notifications/toggle - Toggle notification preferences
router.put('/toggle/:id',  authController.toggleNotificationPreference);


// Admin: Get all users
router.get('/admin/users', protect, adminOnly, authController.getAllUsers);


router.delete('/delete-user/:id', protect, adminOnly, authController.deleteUser);




router.post('/request-otp', authController.otp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/change-password', authController.changePassword);
module.exports = router;