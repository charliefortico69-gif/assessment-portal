const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'admin']
  },
  name: {
    type: String,
    trim: true
  },
  assignedCourse: {
    type: String,
    uppercase: true,
    enum: ['CS101', 'MA102', 'EC201', 'PH301', 'CH401', 'EN501'],
    required: function() { return this.role === 'faculty'; }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
