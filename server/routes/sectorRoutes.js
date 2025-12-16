// ============================================================
// routes/sectorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} = require('../controllers/sectorController');

// Public routes
router.get('/', getAllSectors);
router.get('/:id', getSectorById);

// Admin only routes (add auth middleware as needed)
router.post('/', createSector);
router.put('/:id', updateSector);
router.delete('/:id', deleteSector);

module.exports = router;