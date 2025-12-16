// ============================================================
// controllers/sectorController.js
const Sector = require('../models/Sector');

// GET ALL SECTORS
exports.getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ name: 1 });
    res.json({
      success: true,
      count: sectors.length,
      sectors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sectors',
      error: error.message
    });
  }
};

// GET SINGLE SECTOR
exports.getSectorById = async (req, res) => {
  try {
    const sector = await Sector.findById(req.params.id);
    
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found'
      });
    }

    res.json({
      success: true,
      sector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sector',
      error: error.message
    });
  }
};

// CREATE SECTOR
exports.createSector = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Sector name is required'
      });
    }

    const sector = await Sector.create({ name });

    res.status(201).json({
      success: true,
      message: 'Sector created successfully',
      sector
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sector name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating sector',
      error: error.message
    });
  }
};

// UPDATE SECTOR
exports.updateSector = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Sector name is required'
      });
    }

    const sector = await Sector.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found'
      });
    }

    res.json({
      success: true,
      message: 'Sector updated successfully',
      sector
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sector name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating sector',
      error: error.message
    });
  }
};

// DELETE SECTOR
exports.deleteSector = async (req, res) => {
  try {
    const sector = await Sector.findByIdAndDelete(req.params.id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found'
      });
    }

    res.json({
      success: true,
      message: 'Sector deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sector',
      error: error.message
    });
  }
};
