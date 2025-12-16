// routes/StatsRoutes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Dashboard overview stats
router.get('/dashboard', protect, adminOnly, statsController.getDashboardStats);

// Detailed user analytics  
router.get('/users', protect, adminOnly, statsController.getUserAnalytics);

// Internship analytics
router.get('/internships', protect, adminOnly, statsController.getInternshipAnalytics);

// Notification statistics
router.get('/notifications', protect, adminOnly, statsController.getNotificationStats);

// System health check
router.get('/health', protect, adminOnly, statsController.getSystemHealth);

module.exports = router;