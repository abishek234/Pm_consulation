// models/Internship.js - Fixed version
const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  job_id: { 
    type: String, 
    unique: true 
    // Removed required: true to let pre-save hook handle it
  },
  
  title: { 
    type: String, 
    required: true 
  },
  
  company: { 
    type: String, 
    required: true 
  },
  
  location: { 
    type: String, 
    required: true 
  },
  
  skills_required: [{ 
    type: String, 
    required: true 
  }],
  
sectors: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true 
  }],
  
  description: { 
    type: String, 
    required: true 
  },
  
  remote_ok: { 
    type: Boolean, 
    default: false 
  },
  
  companyLogo: {
    url: String,
    filename: String
  },
  
  duration: { 
    type: String, 
    required: true 
  },
  
  stipend: {
    amount: Number,
    currency: { type: String, default: "INR" }
  },
  
  eligibility: {
    education: [String],
  },
  
  applicationDeadline: { 
    type: Date, 
    required: true 
  },
  
  maxApplications: { 
    type: Number, 
    default: 50 
  },
  
  currentApplications: { 
    type: Number, 
    default: 0 
  },
  
  status: { 
    type: String, 
    enum: ['Active', 'Paused', 'Closed'], 
    default: 'Active' 
  },

  websiteLink: {
    type: String,
  },
  
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  notifiedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

// Fixed pre-save hook for job_id generation
internshipSchema.pre('save', async function (next) {
    if (!this.job_id) {
        try {
            // Use a more robust method for generating job_id
            const lastInternship = await mongoose.model('Internship')
                .findOne({}, {}, { sort: { 'createdAt': -1 } });
            
            let nextNumber = 1001;
            if (lastInternship && lastInternship.job_id) {
                // Extract number from job_id (e.g., "J1005" -> 1005)
                const lastNumber = parseInt(lastInternship.job_id.substring(1));
                nextNumber = lastNumber + 1;
            }
            
            this.job_id = `J${nextNumber}`;
        } catch (error) {
            // Fallback method
            const count = await mongoose.model('Internship').countDocuments();
            this.job_id = `J${count + 1001}`;
        }
    }
    next();
});

// Alternative: Static method for bulk operations
internshipSchema.statics.generateJobId = async function() {
    try {
        const lastInternship = await this.findOne({}, {}, { sort: { 'createdAt': -1 } });
        let nextNumber = 1001;
        
        if (lastInternship && lastInternship.job_id) {
            const lastNumber = parseInt(lastInternship.job_id.substring(1));
            nextNumber = lastNumber + 1;
        }
        
        return `J${nextNumber}`;
    } catch (error) {
        const count = await this.countDocuments();
        return `J${count + 1001}`;
    }
};

// Index for better search performance - FIXED
// Cannot index multiple arrays together, so create separate indexes
internshipSchema.index({ location: 1 });
internshipSchema.index({ skills_required: 1 });
internshipSchema.index({ sectors: 1 });
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ company: 1 });
internshipSchema.index({ title: 1 });

module.exports = mongoose.model("Internship", internshipSchema);