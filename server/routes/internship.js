// routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const internshipController = require("../controllers/internshipController");
const { protect, adminOnly } = require("../middleware/authMiddleware");


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept CSV and Excel files
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and Excel files allowed.'), false);
        }
    }
});


// === INTERNSHIP ROUTES ===
// User: Get personalized recommendations
router.get('/recommendations/:userId', protect, internshipController.getRecommendations);

// Public: Get all internships (with filters)
router.get('/internships', internshipController.getAllInternships);

// Public: Get single internship details
router.get('/internships/:id', internshipController.getInternshipById);

// === ADMIN ONLY ROUTES ===

// Admin: Create new internship (auto-triggers notifications)
router.post('/admin/internships', protect, adminOnly, internshipController.createInternship);

// Admin: Bulk upload internships
router.post('/admin/internships/bulk-upload', protect, adminOnly, upload.single('file'), internshipController.bulkUploadInternships);

// Admin: Download internship upload template
router.get('/admin/internships/template', protect, adminOnly, internshipController.downloadInternshipTemplate);

// Admin: Manually trigger notifications for existing internship
router.post('/admin/internships/:internshipId/notify', protect, adminOnly, internshipController.triggerNotifications);

// Admin: Update internship
router.put('/admin/internships/:id', protect, adminOnly, internshipController.updateInternship);

// Admin: Delete internship
router.delete('/admin/internships/:id', protect, adminOnly, internshipController.deleteInternship);



module.exports = router;