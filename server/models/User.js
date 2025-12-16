// models/User.js - Simple Auth Table
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true }, // Government prefers phone
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true, default: "user" },
  isProfileComplete: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Pre-save hook to hash passwords
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);