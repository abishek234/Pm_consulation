// models/Profile.js - Simple Profile Table
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  name: { type: String, required: true },
  
  education: { 
    type: String, 
    required: true 
  }, // "B.Sc. Computer Science"
  
  skills: [{ 
    type: String, 
    required: true 
  }], // ["python", "javascript"]
  
  sector_interests: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true 
  }],

  preferred_locations: [{ 
    type: String, 
    required: true 
  }], // ["Chennai", "Bangalore"]
  
  language: { 
    type: String, 
    required: true,
    default: "en-IN"
  }, // "ta-IN", "hi-IN", "en-IN"
  
  // For notifications
  notificationsEnabled: { type: Boolean, default: false }
}, {
  timestamps: true
});


module.exports = mongoose.model("Profile", profileSchema);