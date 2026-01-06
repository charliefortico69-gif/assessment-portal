const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['CS101', 'MA102', 'EC201', 'PH301', 'CH401', 'EN501']
  },
  facultyEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries
commentSchema.index({ studentEmail: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model("Comment", commentSchema);